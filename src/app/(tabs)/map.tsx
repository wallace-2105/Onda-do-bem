/**
 * Onda do Bem — Interactive Map Screen
 *
 * Exibe o mapa geográfico do Brasil com marcadores interativos de todas as ações
 * ecológicas e comunitárias cadastradas utilizando Leaflet e OpenStreetMap.
 */

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useAppTheme } from '@/hooks/use-theme';
import { useFeedStore } from '@/store/feed.store';
import { AppText } from '@/components/ui/text';
import { Spacing, BorderRadius } from '@/constants/theme';
import { CATEGORY_INFO } from '@/constants/mock-data';

export default function MapScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { posts } = useFeedStore();

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

  // Gera o código HTML interativo do Leaflet com OpenStreetMap
  const mapHtml = useMemo(() => {
    const markersData = mappedPosts.map((p) => ({
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
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
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
              markerGroup.addLayer(marker);
            });

            markerGroup.addTo(map);

            if (markers.length > 0) {
              map.fitBounds(markerGroup.getBounds().pad(0.2));
            }
          </script>
        </body>
      </html>
    `;
  }, [mappedPosts]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
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
              {mappedPosts.length} ações
            </AppText>
          </View>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <WebView
            source={{ html: mapHtml }}
            style={styles.webView}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
          />
        )}
      </View>
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
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  mapContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
