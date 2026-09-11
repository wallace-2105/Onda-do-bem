/**
 * Onda do Bem — Interactive Map Screen
 *
 * Exibe o mapa geográfico do Brasil com marcadores interativos de todas as ações
 * ecológicas e comunitárias cadastradas. Suporta filtros por categoria,
 * centralização e card flutuante de detalhes da ação selecionada.
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import { useAppTheme } from '@/hooks/use-theme';
import { useFeedStore } from '@/store/feed.store';
import { AppText } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';
import { Spacing, BorderRadius, Shadows, FontWeight } from '@/constants/theme';
import { PostCategory } from '@/types/entities';
import { CATEGORY_INFO } from '@/constants/mock-data';
import { getPostImageSource } from '@/utils/post-image';
import { calculateUserRank } from '@/utils/rank';

export default function MapScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { posts, toggleLike } = useFeedStore();
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'ALL'>('ALL');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

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
            .leaflet-control-zoom {
              margin-top: 80px !important;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            // Inicializa o mapa com foco no Brasil
            var map = L.map('map', {
              zoomControl: true,
              attributionControl: false
            }).setView([-14.235, -51.9253], 4);

            // Adiciona camada do OpenStreetMap
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

              marker.on('click', function() {
                map.setView([item.lat, item.lng], 13, { animate: true });
                var payload = JSON.stringify({ type: 'SELECT_POST', postId: item.id });
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(payload);
                } else {
                  window.parent.postMessage(payload, '*');
                }
              });

              markerGroup.addLayer(marker);
            });

            markerGroup.addTo(map);

            // Ajusta o zoom inicial para enquadrar todos os marcadores
            if (markers.length > 0) {
              map.fitBounds(markerGroup.getBounds().pad(0.2));
            }

            // Desmarca ao clicar no mapa aberto
            map.on('click', function(e) {
              if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.classList.contains('custom-pin')) {
                return;
              }
              var payload = JSON.stringify({ type: 'DESELECT' });
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(payload);
              } else {
                window.parent.postMessage(payload, '*');
              }
            });

            // Comunicação para recentralizar o mapa
            window.recenterMap = function() {
              if (markers.length > 0) {
                map.fitBounds(markerGroup.getBounds().pad(0.2), { animate: true });
              } else {
                map.setView([-14.235, -51.9253], 4, { animate: true });
              }
            };
          </script>
        </body>
      </html>
    `;
  }, [filteredPosts]);

  // Manipula mensagens recebidas do Leaflet (clique nos marcadores)
  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_POST') {
        setSelectedPostId(data.postId);
      } else if (data.type === 'DESELECT') {
        setSelectedPostId(null);
      }
    } catch {
      // Ignora mensagens inválidas
    }
  };

  // Recentraliza o mapa nos marcadores
  const handleRecenter = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.recenterMap && window.recenterMap(); true;');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: insets.top + Spacing.xs }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <AppText variant="h3" weight="bold">
              Mapa do Bem 🗺️
            </AppText>
            <AppText variant="caption" color="secondary">
              Explore ações ecológicas perto de você
            </AppText>
          </View>
          <View style={[styles.countBadge, { backgroundColor: theme.primaryLight }]}>
            <AppText variant="caption" weight="bold" style={{ color: theme.primary }}>
              {filteredPosts.length} ações
            </AppText>
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

      {/* Map View Container */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          // Suporte nativo para navegadores Web
          <iframe
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          // Suporte nativo para iOS e Android
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
              <View style={styles.authorMiniRow}>
                <Avatar
                  source={selectedPost.author.avatarUrl}
                  name={selectedPost.author.displayName}
                  size="sm"
                />
                <AppText variant="caption" weight="medium" style={{ marginLeft: 6 }}>
                  {selectedPost.author.displayName}
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
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
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
    width: 72,
    height: 72,
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
});
