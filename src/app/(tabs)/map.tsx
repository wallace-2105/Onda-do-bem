/**
 * Onda do Bem — Interactive Map Screen
 *
 * Exibe o mapa geográfico com marcadores interativos de todas as ações
 * ecológicas e comunitárias cadastradas. Permite colocar pins interativos
 * no mapa para criar novas ações sustentáveis com horários de início e término,
 * descrição, categoria e foto ilustrativa.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';

import { useAppTheme } from '@/hooks/use-theme';
import { useFeedStore } from '@/store/feed.store';
import { AppText } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';
import { AppButton } from '@/components/ui/button';
import { Spacing, BorderRadius, Shadows, FontWeight } from '@/constants/theme';
import { PostCategory, type Post } from '@/types/entities';
import { CATEGORY_INFO } from '@/constants/mock-data';
import { getPostImageSource } from '@/utils/post-image';
import { calculateUserRank } from '@/utils/rank';

// Presets de fotos de alta qualidade para teste rápido
const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Limpeza de Praia',
    emoji: '🌊',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop',
  },
  {
    label: 'Plantio de Mudas',
    emoji: '🌱',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop',
  },
  {
    label: 'Horta Comunitária',
    emoji: '🥕',
    url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop',
  },
  {
    label: 'Reciclagem e Coleta',
    emoji: '♻️',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop',
  },
  {
    label: 'Proteção Animal',
    emoji: '🐾',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop',
  },
];

export default function MapScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { posts, toggleLike, addPost } = useFeedStore();
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'ALL'>('ALL');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Estados de criação e posicionamento de pin
  const [isPinMode, setIsPinMode] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pinCoords, setPinCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: -23.5505,
    longitude: -46.6333,
  });

  // Campos do formulário de criação
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<PostCategory>(PostCategory.BEACH_CLEANUP);
  const [formLocationName, setFormLocationName] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('12:00');
  const [formPhoto, setFormPhoto] = useState<string>(SAMPLE_PHOTO_PRESETS[0].url);
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [isPhotoPicking, setIsPhotoPicking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const webViewRef = useRef<WebView>(null);

  // Filtra posts que possuem coordenadas geográficas válidas
  const mappedPosts = useMemo(() => {
    return posts.filter(
      (p) =>
        p.latitude !== null &&
        p.longitude !== null &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude)
    );
  }, [posts]);

  // Aplica o filtro de categoria selecionada
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'ALL') return mappedPosts;
    return mappedPosts.filter((p) => p.category === selectedCategory);
  }, [mappedPosts, selectedCategory]);

  // Post selecionado para o card de prévia
  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;
    return posts.find((p) => p.id === selectedPostId) || null;
  }, [posts, selectedPostId]);

  // Gera o código HTML interativo do Leaflet com OpenStreetMap
  const mapHtml = useMemo(() => {
    const markersData = filteredPosts.map((p) => ({
      id: p.id,
      lat: p.latitude,
      lng: p.longitude,
      title: p.title,
      category: p.category,
      emoji: CATEGORY_INFO[p.category]?.emoji || '🌱',
      color: CATEGORY_INFO[p.category]?.color || '#10B981',
      impact: p.impactScore,
      startTime: p.startTime,
      endTime: p.endTime,
    }));

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <style>
            html, body, #map {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background-color: #F8FAFC;
              overflow: hidden;
            }
            .custom-pin {
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              border: 3px solid #FFFFFF;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
              font-size: 18px;
              cursor: pointer;
              transition: transform 0.2s ease;
            }
            .custom-pin:active {
              transform: scale(0.9);
            }
            .new-action-pin {
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: grab;
            }
            @keyframes pulsePinAnim {
              0% {
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                transform: scale(1);
              }
              50% {
                box-shadow: 0 0 0 16px rgba(16, 185, 129, 0);
                transform: scale(1.08);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                transform: scale(1);
              }
            }
            .pulsing-pin {
              animation: pulsePinAnim 1.6s infinite ease-in-out;
            }
            .leaflet-control-zoom {
              margin-top: 80px !important;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            function sendToApp(payload) {
              var json = JSON.stringify(payload);
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(json);
              } else if (window.parent) {
                window.parent.postMessage(json, '*');
              }
            }

            var map = L.map('map', {
              zoomControl: true,
              attributionControl: false
            }).setView([-14.235, -51.9253], 4);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19
            }).addTo(map);

            var markers = ${JSON.stringify(markersData)};
            var markerGroup = L.featureGroup();

            markers.forEach(function(item) {
              var icon = L.divIcon({
                className: 'custom-pin',
                html: '<div style="background-color: ' + item.color + '; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">' + item.emoji + '</div>',
                iconSize: [38, 38],
                iconAnchor: [19, 19]
              });

              var marker = L.marker([item.lat, item.lng], { icon: icon });

              marker.on('click', function(ev) {
                L.DomEvent.stopPropagation(ev);
                map.setView([item.lat, item.lng], 13, { animate: true });
                sendToApp({ type: 'SELECT_POST', postId: item.id });
              });

              markerGroup.addLayer(marker);
            });

            markerGroup.addTo(map);

            if (markers.length > 0) {
              map.fitBounds(markerGroup.getBounds().pad(0.2));
            }

            // Marcador temporário de criação de nova ação
            var creationMarker = null;
            var isPinModeActive = ${isPinMode};

            function createOrUpdateCreationPin(lat, lng) {
              var pinIcon = L.divIcon({
                className: 'new-action-pin',
                html: '<div class="pulsing-pin" style="background: linear-gradient(135deg, #10B981, #047857); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(0,0,0,0.4); font-size: 22px;">📍</div>',
                iconSize: [44, 44],
                iconAnchor: [22, 22]
              });

              if (creationMarker) {
                creationMarker.setLatLng([lat, lng]);
              } else {
                creationMarker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
                creationMarker.on('dragend', function(e) {
                  var p = e.target.getLatLng();
                  sendToApp({ type: 'PIN_PLACED', lat: p.lat, lng: p.lng });
                });
              }
            }

            window.setPinMode = function(enabled) {
              isPinModeActive = enabled;
              if (!enabled && creationMarker) {
                map.removeLayer(creationMarker);
                creationMarker = null;
              }
            };

            window.placeCreationPin = function(lat, lng) {
              createOrUpdateCreationPin(lat, lng);
              map.setView([lat, lng], 14, { animate: true });
            };

            // Clique no mapa
            map.on('click', function(e) {
              if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.classList.contains('custom-pin')) {
                return;
              }

              if (isPinModeActive) {
                createOrUpdateCreationPin(e.latlng.lat, e.latlng.lng);
                sendToApp({ type: 'PIN_PLACED', lat: e.latlng.lat, lng: e.latlng.lng });
              } else {
                sendToApp({ type: 'DESELECT' });
              }
            });

            window.recenterMap = function() {
              if (markers.length > 0) {
                map.fitBounds(markerGroup.getBounds().pad(0.2), { animate: true });
              } else {
                map.setView([-14.235, -51.9253], 4, { animate: true });
              }
            };

            window.focusOnCoords = function(lat, lng) {
              map.setView([lat, lng], 14, { animate: true });
            };
          </script>
        </body>
      </html>
    `;
  }, [filteredPosts, isPinMode]);

  // Mensagens enviadas do Leaflet
  const handleDataMessage = (data: any) => {
    if (data.type === 'SELECT_POST') {
      setSelectedPostId(data.postId);
      setIsPinMode(false);
    } else if (data.type === 'DESELECT') {
      setSelectedPostId(null);
    } else if (data.type === 'PIN_PLACED') {
      setPinCoords({
        latitude: Number(data.lat),
        longitude: Number(data.lng),
      });
      setSelectedPostId(null);
    }
  };

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleDataMessage(data);
    } catch {
      // Ignora mensagens malformadas
    }
  };

  // Suporte a mensagens no navegador Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const onWindowMsg = (e: MessageEvent) => {
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (data && data.type) {
            handleDataMessage(data);
          }
        } catch {}
      };
      window.addEventListener('message', onWindowMsg);
      return () => window.removeEventListener('message', onWindowMsg);
    }
  }, []);

  // Recentraliza o mapa
  const handleRecenter = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.recenterMap && window.recenterMap(); true;');
    }
  };

  // Inicia o modo de posicionamento de pin
  const handleStartPinPlacement = () => {
    setIsPinMode(true);
    setSelectedPostId(null);

    // Se já tiver uma coordenada definida, projeta o pin no mapa
    const js = `
      window.setPinMode && window.setPinMode(true);
      window.placeCreationPin && window.placeCreationPin(${pinCoords.latitude}, ${pinCoords.longitude});
      true;
    `;
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(js);
    }
  };

  // Cancela o modo de posicionamento de pin
  const handleCancelPinPlacement = () => {
    setIsPinMode(false);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.setPinMode && window.setPinMode(false); true;');
    }
  };

  // Abre o formulário após marcar o pin
  const handleProceedToForm = () => {
    setIsPinMode(false);
    setIsCreateModalOpen(true);
  };

  // Tirar foto com a câmera
  const handleTakePhoto = async () => {
    try {
      setIsPhotoPicking(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de acesso à câmera para fotografar o local da ação sustentável.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormPhoto(result.assets[0].uri);
        setIsCustomPhoto(true);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a câmera no momento.');
    } finally {
      setIsPhotoPicking(false);
    }
  };

  // Escolher foto da galeria
  const handlePickGallery = async () => {
    try {
      setIsPhotoPicking(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos de permissão para selecionar uma foto da sua galeria.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormPhoto(result.assets[0].uri);
        setIsCustomPhoto(true);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível acessar a galeria.');
    } finally {
      setIsPhotoPicking(false);
    }
  };

  // Submeter a nova Ação Sustentável
  const handleSubmitAction = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Título obrigatório', 'Por favor, dê um título descritivo para sua ação ecológica.');
      return;
    }
    if (!formDescription.trim()) {
      Alert.alert('Descrição obrigatória', 'Por favor, descreva o que será feito nesta ação comunitária.');
      return;
    }

    try {
      setIsSubmitting(true);

      const createdPost = addPost({
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        locationName: formLocationName.trim() || 'Ponto no Mapa',
        imageUrl: formPhoto,
        impactScore: 25,
        latitude: pinCoords.latitude,
        longitude: pinCoords.longitude,
        startTime: formStartTime.trim() || '09:00',
        endTime: formEndTime.trim() || '12:00',
      });

      setIsCreateModalOpen(false);

      // Limpa os campos do formulário
      setFormTitle('');
      setFormDescription('');
      setFormLocationName('');
      setIsCustomPhoto(false);
      setFormPhoto(SAMPLE_PHOTO_PRESETS[0].url);

      // Centraliza e seleciona a nova ação no mapa
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(
            `window.focusOnCoords && window.focusOnCoords(${pinCoords.latitude}, ${pinCoords.longitude}); true;`
          );
        }
        if (createdPost?.id) {
          setSelectedPostId(createdPost.id);
        }
      }, 500);

      Alert.alert('Sucesso! 🌱', 'Sua ação sustentável foi fixada no mapa com sucesso!');
    } catch (err) {
      Alert.alert('Erro ao salvar', 'Ocorreu um erro ao registrar sua ação no mapa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            paddingTop: insets.top + Spacing.xs,
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <View>
            <AppText variant="h3" weight="bold">
              Mapa do Bem 🗺️
            </AppText>
            <AppText variant="caption" color="secondary">
              Ações ecológicas e comunitárias perto de você
            </AppText>
          </View>

          <View style={styles.headerActionsRight}>
            <View style={[styles.countBadge, { backgroundColor: theme.primaryLight }]}>
              <AppText variant="caption" weight="bold" style={{ color: theme.primary }}>
                {filteredPosts.length} ações
              </AppText>
            </View>

            {/* Botão Superior para Criar Ação */}
            <Pressable
              onPress={handleStartPinPlacement}
              style={[styles.headerCreateBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF', marginLeft: 2 }}>
                Criar Ação
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* Categorias Filtro Horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            onPress={() => {
              setSelectedCategory('ALL');
              setSelectedPostId(null);
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedCategory === 'ALL' ? theme.primary : theme.surfaceElevated,
                borderColor: selectedCategory === 'ALL' ? theme.primary : theme.border,
              },
            ]}
          >
            <AppText
              variant="caption"
              weight={selectedCategory === 'ALL' ? 'bold' : 'medium'}
              style={{ color: selectedCategory === 'ALL' ? '#FFFFFF' : theme.text }}
            >
              Todas 🌟
            </AppText>
          </Pressable>

          {Object.entries(CATEGORY_INFO).map(([catKey, meta]) => {
            const isSelected = selectedCategory === catKey;
            return (
              <Pressable
                key={catKey}
                onPress={() => {
                  setSelectedCategory(catKey as PostCategory);
                  setSelectedPostId(null);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? meta.color : theme.surfaceElevated,
                    borderColor: isSelected ? meta.color : theme.border,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  style={{ color: isSelected ? '#FFFFFF' : theme.text }}
                >
                  {meta.emoji} {meta.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Banner de Modo de Posicionamento de Pin Ativo */}
      {isPinMode && (
        <View style={[styles.pinModeBanner, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
          <View style={styles.pinModeTextContainer}>
            <View style={styles.pinModeTitleRow}>
              <View style={[styles.pulsingDot, { backgroundColor: theme.primary }]} />
              <AppText variant="bodySm" weight="bold" style={{ color: theme.primary }}>
                Toque no mapa para posicionar o Pin 📍
              </AppText>
            </View>
            <AppText variant="caption" color="secondary">
              Coordenadas: {pinCoords.latitude.toFixed(4)}, {pinCoords.longitude.toFixed(4)}
            </AppText>
          </View>

          <View style={styles.pinModeBannerButtons}>
            <Pressable
              onPress={handleCancelPinPlacement}
              style={[styles.pinBannerCancelBtn, { borderColor: theme.border }]}
            >
              <Ionicons name="close" size={16} color={theme.textMuted} />
              <AppText variant="caption" color="secondary" style={{ marginLeft: 3 }}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleProceedToForm}
              style={[styles.pinBannerConfirmBtn, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF', marginLeft: 4 }}>
                Confirmar Local ➜
              </AppText>
            </Pressable>
          </View>
        </View>
      )}

      {/* Map View Container */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            onMessage={handleMessage}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
          />
        )}

        {/* Botão Flutuante de Recentralização */}
        <Pressable
          onPress={handleRecenter}
          style={[styles.recenterFab, { backgroundColor: theme.surface, borderColor: theme.border }]}
          hitSlop={8}
        >
          <Ionicons name="locate" size={22} color={theme.primary} />
        </Pressable>

        {/* FAB Principal: "Criar Ação" Flutuante */}
        {!isPinMode && !selectedPost && (
          <Pressable
            onPress={handleStartPinPlacement}
            style={[styles.createActionFab, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <AppText variant="bodySm" weight="bold" style={{ color: '#FFFFFF', marginLeft: 6 }}>
              Criar Ação Sustentável 📍
            </AppText>
          </Pressable>
        )}
      </View>

      {/* Card Flutuante de Prévia da Ação Selecionada */}
      {selectedPost && (
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              bottom: insets.bottom + Spacing.md,
            },
          ]}
        >
          {/* Header do Card com Categoria e Botão Fechar */}
          <View style={styles.cardTopRow}>
            <View
              style={[
                styles.cardCategoryBadge,
                { backgroundColor: CATEGORY_INFO[selectedPost.category]?.color || theme.primary },
              ]}
            >
              <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF' }}>
                {CATEGORY_INFO[selectedPost.category]?.emoji} {CATEGORY_INFO[selectedPost.category]?.label}
              </AppText>
            </View>
            <Pressable onPress={() => setSelectedPostId(null)} hitSlop={8}>
              <Ionicons name="close" size={20} color={theme.textMuted} />
            </Pressable>
          </View>

          {/* Conteúdo Principal do Card */}
          <View style={styles.cardContentRow}>
            {(() => {
              const imageSource = getPostImageSource(selectedPost);
              if (!imageSource) return null;
              return (
                <Image
                  source={imageSource}
                  style={styles.cardThumbnail}
                  contentFit="cover"
                  transition={200}
                />
              );
            })()}
            <View style={styles.cardTextInfo}>
              <AppText variant="bodySm" weight="bold" numberOfLines={2}>
                {selectedPost.title}
              </AppText>
              <View style={styles.cardLocationRow}>
                <Ionicons name="location-outline" size={13} color={theme.textSecondary} />
                <AppText variant="caption" color="secondary" numberOfLines={1} style={{ marginLeft: 3 }}>
                  {selectedPost.locationName || 'Local da ação'}
                </AppText>
              </View>

              {/* Exibição dos Horários da Ação (se definidos) */}
              {(selectedPost.startTime || selectedPost.endTime) && (
                <View style={[styles.cardTimeRow, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="time-outline" size={13} color={theme.primary} />
                  <AppText variant="caption" weight="bold" style={{ color: theme.primary, marginLeft: 4 }}>
                    {selectedPost.startTime && selectedPost.endTime
                      ? `${selectedPost.startTime} às ${selectedPost.endTime}`
                      : selectedPost.startTime
                      ? `Início: ${selectedPost.startTime}`
                      : `Término: ${selectedPost.endTime}`}
                  </AppText>
                </View>
              )}

              <View style={styles.authorMiniRow}>
                <Avatar
                  source={selectedPost.author?.avatarUrl}
                  name={selectedPost.author?.displayName || 'Voluntário'}
                  size="sm"
                />
                <AppText variant="caption" weight="medium" style={{ marginLeft: 6 }}>
                  {selectedPost.author?.displayName || 'Voluntário'}
                </AppText>
                {(() => {
                  const authorRank = calculateUserRank(selectedPost.author?.totalImpact || 0);
                  return (
                    <View
                      style={[
                        styles.authorRankBadgeMini,
                        { backgroundColor: authorRank.color + '20', marginLeft: 6 },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        style={{ color: authorRank.color, fontSize: 10, fontWeight: FontWeight.bold }}
                      >
                        {authorRank.badge} R{authorRank.rank}
                      </AppText>
                    </View>
                  );
                })()}
              </View>
            </View>
          </View>

          {/* Rodapé com Impacto e Ação */}
          <View style={[styles.cardFooter, { borderTopColor: theme.borderLight }]}>
            <View style={styles.cardImpactBadge}>
              <Ionicons name="sparkles" size={13} color="#F59E0B" />
              <AppText variant="caption" weight="bold" style={{ color: '#F59E0B', marginLeft: 4 }}>
                +{selectedPost.impactScore} impacto
              </AppText>
            </View>

            <View style={styles.cardButtonsRow}>
              <Pressable
                onPress={() => toggleLike(selectedPost.id)}
                style={styles.cardLikeBtn}
                hitSlop={8}
              >
                <Ionicons
                  name={selectedPost.isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={selectedPost.isLiked ? '#EF4444' : theme.textSecondary}
                />
                <AppText
                  variant="caption"
                  weight="medium"
                  style={{ color: selectedPost.isLiked ? '#EF4444' : theme.textSecondary, marginLeft: 4 }}
                >
                  {selectedPost.likesCount}
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(tabs)')}
                style={[styles.viewPostBtn, { backgroundColor: theme.primary }]}
              >
                <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF' }}>
                  Ver no Feed 🌊
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Modal / Formulário Completo de Criação da Ação Sustentável */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: theme.background }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header do Modal */}
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: insets.top + Spacing.sm }]}>
            <View style={styles.modalHeaderLeft}>
              <View style={[styles.modalIconBadge, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="leaf" size={20} color={theme.primary} />
              </View>
              <View>
                <AppText variant="h3" weight="bold">
                  Nova Ação Sustentável 🌱
                </AppText>
                <AppText variant="caption" color="secondary">
                  Fixe no mapa e convide voluntários da rede
                </AppText>
              </View>
            </View>
            <Pressable
              onPress={() => setIsCreateModalOpen(false)}
              style={[styles.modalCloseBtn, { backgroundColor: theme.surfaceElevated }]}
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Coordenadas e Localização */}
            <View style={[styles.formSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="location" size={18} color={theme.primary} />
                <AppText variant="bodySm" weight="bold" style={{ marginLeft: 6 }}>
                  Ponto de Encontro & Local no Mapa
                </AppText>
              </View>

              <View style={[styles.coordsPill, { backgroundColor: theme.primaryLight }]}>
                <AppText variant="caption" weight="semibold" style={{ color: theme.primary }}>
                  📍 Coordenadas: {pinCoords.latitude.toFixed(4)}, {pinCoords.longitude.toFixed(4)}
                </AppText>
                <Pressable
                  onPress={() => {
                    setIsCreateModalOpen(false);
                    handleStartPinPlacement();
                  }}
                  style={styles.adjustPinBtn}
                >
                  <Ionicons name="refresh" size={13} color={theme.primary} />
                  <AppText variant="caption" weight="bold" style={{ color: theme.primary, marginLeft: 2 }}>
                    Mudar no Mapa
                  </AppText>
                </Pressable>
              </View>

              <AppText variant="caption" color="secondary" style={styles.inputLabel}>
                Nome ou Ponto de Referência do Local *
              </AppText>
              <TextInput
                value={formLocationName}
                onChangeText={setFormLocationName}
                placeholder="Ex: Praia de Copacabana (Posto 5), Parque do Ibirapuera..."
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.text },
                ]}
              />
            </View>

            {/* 2. Título da Ação Sustentável */}
            <View style={[styles.formSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="sparkles" size={18} color="#F59E0B" />
                <AppText variant="bodySm" weight="bold" style={{ marginLeft: 6 }}>
                  Título da Ação Sustentável *
                </AppText>
              </View>
              <TextInput
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="Ex: Mutirão de Limpeza na Orla e Coleta Seletiva"
                placeholderTextColor={theme.textMuted}
                maxLength={80}
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.text },
                ]}
              />
              <AppText variant="caption" color="muted" style={{ textAlign: 'right' }}>
                {formTitle.length}/80 caracteres
              </AppText>
            </View>

            {/* 3. Categoria Ecológica */}
            <View style={[styles.formSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="pricetag" size={18} color={theme.secondary} />
                <AppText variant="bodySm" weight="bold" style={{ marginLeft: 6 }}>
                  Categoria da Ação
                </AppText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPickerScroll}>
                {Object.entries(CATEGORY_INFO).map(([key, item]) => {
                  const isSelected = formCategory === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setFormCategory(key as PostCategory)}
                      style={[
                        styles.categorySelectChip,
                        {
                          backgroundColor: isSelected ? item.color : theme.surfaceElevated,
                          borderColor: isSelected ? item.color : theme.border,
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        weight={isSelected ? 'bold' : 'medium'}
                        style={{ color: isSelected ? '#FFFFFF' : theme.text }}
                      >
                        {item.emoji} {item.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. Horário de Começo e Previsão de Término */}
            <View style={[styles.formSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="time" size={18} color={theme.primary} />
                <AppText variant="bodySm" weight="bold" style={{ marginLeft: 6 }}>
                  Horários da Ação
                </AppText>
              </View>

              <View style={styles.timeInputsRow}>
                {/* Horário de Início */}
                <View style={styles.timeColumn}>
                  <AppText variant="caption" color="secondary" style={styles.inputLabel}>
                    Horário de Começo ⏰
                  </AppText>
                  <TextInput
                    value={formStartTime}
                    onChangeText={setFormStartTime}
                    placeholder="09:00"
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.textInput,
                      styles.timeInput,
                      { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.text },
                    ]}
                  />
                  <View style={styles.quickTimeRow}>
                    {['08:00', '09:00', '14:00', '16:00'].map((preset) => (
                      <Pressable
                        key={preset}
                        onPress={() => setFormStartTime(preset)}
                        style={[
                          styles.quickTimeChip,
                          {
                            backgroundColor: formStartTime === preset ? theme.primary : theme.surfaceElevated,
                            borderColor: formStartTime === preset ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <AppText
                          variant="caption"
                          style={{
                            fontSize: 10,
                            color: formStartTime === preset ? '#FFFFFF' : theme.textSecondary,
                            fontWeight: FontWeight.bold,
                          }}
                        >
                          {preset}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Previsão de Término */}
                <View style={styles.timeColumn}>
                  <AppText variant="caption" color="secondary" style={styles.inputLabel}>
                    Previsão de Término 🏁
                  </AppText>
                  <TextInput
                    value={formEndTime}
                    onChangeText={setFormEndTime}
                    placeholder="12:00"
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.textInput,
                      styles.timeInput,
                      { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.text },
                    ]}
                  />
                  <View style={styles.quickTimeRow}>
                    {['11:00', '12:00', '16:00', '18:00'].map((preset) => (
                      <Pressable
                        key={preset}
                        onPress={() => setFormEndTime(preset)}
                        style={[
                          styles.quickTimeChip,
                          {
                            backgroundColor: formEndTime === preset ? theme.primary : theme.surfaceElevated,
                            borderColor: formEndTime === preset ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <AppText
                          variant="caption"
                          style={{
                            fontSize: 10,
                            color: formEndTime === preset ? '#FFFFFF' : theme.textSecondary,
                            fontWeight: FontWeight.bold,
                          }}
                        >
                          {preset}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <View style={[styles.durationBadge, { backgroundColor: theme.surfaceElevated }]}>
                <Ionicons name="hourglass-outline" size={14} color={theme.primary} />
                <AppText variant="caption" color="secondary" style={{ marginLeft: 6 }}>
                  Programado: das <AppText variant="caption" weight="bold">{formStartTime}</AppText> até as{' '}
                  <AppText variant="caption" weight="bold">{formEndTime}</AppText>
                </AppText>
              </View>
            </View>

            {/* 5. Foto para Ilustrar a Ação */}
            <View style={[styles.formSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="camera" size={18} color={theme.primary} />
                <AppText variant="bodySm" weight="bold" style={{ marginLeft: 6 }}>
                  Foto da Ação Sustentável
                </AppText>
              </View>

              {/* Preview da Foto Selecionada */}
              {formPhoto && (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: formPhoto }} style={styles.photoPreviewImage} contentFit="cover" />
                  {isCustomPhoto && (
                    <View style={styles.customPhotoBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                      <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF', marginLeft: 4 }}>
                        Foto do Dispositivo
                      </AppText>
                    </View>
                  )}
                </View>
              )}

              {/* Botões de Ação para Foto */}
              <View style={styles.photoButtonsRow}>
                <Pressable
                  onPress={handleTakePhoto}
                  disabled={isPhotoPicking}
                  style={[styles.photoActionButton, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
                >
                  {isPhotoPicking ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={18} color={theme.primary} />
                      <AppText variant="caption" weight="bold" style={{ color: theme.primary, marginLeft: 6 }}>
                        Tirar Foto
                      </AppText>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={handlePickGallery}
                  disabled={isPhotoPicking}
                  style={[styles.photoActionButton, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
                >
                  <Ionicons name="images" size={18} color={theme.text} />
                  <AppText variant="caption" weight="semibold" style={{ color: theme.text, marginLeft: 6 }}>
                    Galeria
                  </AppText>
                </Pressable>
              </View>

              {/* Presets Rápidos de Fotos Ecológicas */}
              <AppText variant="caption" color="secondary" style={styles.inputLabel}>
                Ou selecione uma foto temática de exemplo:
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
                {SAMPLE_PHOTO_PRESETS.map((preset, idx) => {
                  const isSelected = formPhoto === preset.url;
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        setFormPhoto(preset.url);
                        setIsCustomPhoto(false);
                      }}
                      style={[
                        styles.presetCard,
                        { borderColor: isSelected ? theme.primary : theme.border },
                      ]}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetThumb} contentFit="cover" />
                      <View style={styles.presetLabelRow}>
                        <AppText variant="caption" style={{ fontSize: 11, fontWeight: isSelected ? FontWeight.bold : 'normal' }}>
                          {preset.emoji} {preset.label}
                        </AppText>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* 6. Descrição Detalhada da Ação */}
            <View style={[styles.formSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="document-text" size={18} color={theme.primary} />
                <AppText variant="bodySm" weight="bold" style={{ marginLeft: 6 }}>
                  Descrição da Ação Sustentável *
                </AppText>
              </View>
              <TextInput
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Descreva a ação que será feita, orientações aos voluntários, o que levar (luvas, água, sacolas) e metas sustentáveis..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                style={[
                  styles.textAreaInput,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.text },
                ]}
              />
            </View>

            {/* Estimativa de Impacto */}
            <View style={[styles.impactBox, { backgroundColor: '#10B98115', borderColor: '#10B98140' }]}>
              <Ionicons name="sparkles" size={20} color="#10B981" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <AppText variant="bodySm" weight="bold" style={{ color: '#047857' }}>
                  Impacto Positivo Estimado: +25 Pontos
                </AppText>
                <AppText variant="caption" style={{ color: '#065F46' }}>
                  Esta ação elevará seu nível de guardião ecológico e inspirará toda a comunidade no feed!
                </AppText>
              </View>
            </View>

            {/* Botões de Submissão */}
            <View style={styles.modalSubmitContainer}>
              <AppButton
                title="Publicar Ação no Mapa 🚀"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                onPress={handleSubmitAction}
                fullWidth
              />
              <Pressable
                onPress={() => setIsCreateModalOpen(false)}
                style={styles.modalCancelBtn}
              >
                <AppText variant="bodySm" color="secondary" weight="semibold">
                  Cancelar
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  headerCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  filterScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  recenterFab: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Shadows.md,
  },
  createActionFab: {
    position: 'absolute',
    bottom: Spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    ...Shadows.lg,
  },
  pinModeBanner: {
    position: 'absolute',
    top: 130,
    left: Spacing.md,
    right: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    zIndex: 30,
    ...Shadows.lg,
  },
  pinModeTextContainer: {
    marginBottom: Spacing.xs,
  },
  pinModeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pinModeBannerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pinBannerCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  pinBannerConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  previewCard: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    zIndex: 20,
    ...Shadows.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  cardCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardThumbnail: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.md,
    backgroundColor: '#0F172A',
  },
  cardTextInfo: {
    flex: 1,
    gap: 2,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  authorMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  authorRankBadgeMini: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  cardImpactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPostBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },

  // Estilos do Modal de Criação
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  formSection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  coordsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  adjustPinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    marginTop: Spacing.xs,
    marginBottom: 2,
    fontWeight: FontWeight.semibold,
  },
  textInput: {
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  textAreaInput: {
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  categoryPickerScroll: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  categorySelectChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timeColumn: {
    flex: 1,
  },
  timeInput: {
    textAlign: 'center',
    fontWeight: FontWeight.bold,
  },
  quickTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  quickTimeChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  photoPreviewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  customPhotoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  presetsScroll: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  presetCard: {
    width: 110,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    overflow: 'hidden',
  },
  presetThumb: {
    width: '100%',
    height: 70,
  },
  presetLabelRow: {
    padding: 4,
    alignItems: 'center',
  },
  impactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  modalSubmitContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
});
