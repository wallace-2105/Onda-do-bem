/**
 * Onda do Bem — Claymorphism Post Button
 *
 * Botão flutuante central da barra de navegação com:
 * - Ícone 3D em massa de modelar (clay disc com + em relevo) no mesmo estilo do logo do app.
 * - Sobreposição da barra de tarefas (projeção para cima).
 * - Animação de compressão (squish) ao pressionar.
 * - Animação de splash de massinha ao soltar (respingos radiais se expandindo e sumindo).
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export interface ClayPostButtonProps {
  onPress?: ((e: GestureResponderEvent) => void) | null;
  onLongPress?: ((e: GestureResponderEvent) => void) | null;
  accessibilityState?: { selected?: boolean };
  accessibilityLabel?: string;
  testID?: string;
  children?: React.ReactNode;
  style?: any;
  to?: string;
}

// Splash blob configuration: 8 blobs em ângulos radiais com tamanhos variados
const SPLASH_BLOBS = [
  { angle: 0,    delay: 0,   size: 12, dist: 46 },
  { angle: 45,   delay: 20,  size: 8,  dist: 52 },
  { angle: 90,   delay: 10,  size: 13, dist: 44 },
  { angle: 135,  delay: 30,  size: 7,  dist: 50 },
  { angle: 180,  delay: 0,   size: 11, dist: 46 },
  { angle: 225,  delay: 25,  size: 9,  dist: 54 },
  { angle: 270,  delay: 15,  size: 12, dist: 42 },
  { angle: 315,  delay: 35,  size: 7,  dist: 48 },
  // Blobs extras intermediários (gotas menores)
  { angle: 22,   delay: 40,  size: 5,  dist: 62 },
  { angle: 112,  delay: 50,  size: 4,  dist: 60 },
  { angle: 202,  delay: 45,  size: 5,  dist: 58 },
  { angle: 292,  delay: 55,  size: 4,  dist: 64 },
];

export function ClayPostButton({
  onPress,
  onLongPress,
  accessibilityState,
}: ClayPostButtonProps) {
  const router = useRouter();
  const isFocused = !!accessibilityState?.selected;

  // --- Animações do botão ---
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // --- Animações do splash de massinha ---
  // Cada blob tem sua própria animação de distância e opacidade
  const blobAnims = useRef(
    SPLASH_BLOBS.map(() => ({
      dist: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const handlePressIn = useCallback(() => {
    // Comprimir o botão como se estivesse apertando massinha
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.88,
        tension: 350,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 4,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, translateYAnim]);

  const handlePressOut = useCallback(() => {
    // Soltar: botão volta + splash de massinha dispara
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Disparar animação de splash para cada blob
    blobAnims.forEach((anim, i) => {
      const blob = SPLASH_BLOBS[i];
      // Resetar estado
      anim.dist.setValue(0);
      anim.opacity.setValue(0);
      anim.scale.setValue(0);

      Animated.sequence([
        Animated.delay(blob.delay),
        Animated.parallel([
          // Blob aparece e voa para fora
          Animated.spring(anim.dist, {
            toValue: 1,
            tension: 120,
            friction: 7,
            useNativeDriver: true,
          }),
          // Blob cresce rapidamente e depois some
          Animated.sequence([
            Animated.spring(anim.scale, {
              toValue: 1,
              tension: 200,
              friction: 6,
              useNativeDriver: true,
            }),
          ]),
          // Opacidade: aparece rápido e desaparece suave
          Animated.sequence([
            Animated.timing(anim.opacity, {
              toValue: 0.92,
              duration: 60,
              useNativeDriver: true,
            }),
            Animated.delay(120),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        // Reset para próximo toque
        anim.dist.setValue(0);
        anim.scale.setValue(0);
        anim.opacity.setValue(0);
      });
    });
  }, [scaleAnim, translateYAnim, blobAnims]);

  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (onPress) {
      onPress(e);
    } else {
      router.push('/(tabs)/create');
    }
  }, [onPress, router]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.splashArea} pointerEvents="none">
        {/* Splash blobs de massinha */}
        {SPLASH_BLOBS.map((blob, i) => {
          const radians = (blob.angle * Math.PI) / 180;
          const tx = blobAnims[i].dist.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.cos(radians) * blob.dist],
          });
          const ty = blobAnims[i].dist.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.sin(radians) * blob.dist],
          });
          const sc = blobAnims[i].scale.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 1.2, 0.7],
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.splashBlob,
                {
                  width: blob.size,
                  height: blob.size,
                  borderRadius: blob.size / 2,
                  opacity: blobAnims[i].opacity,
                  transform: [
                    { translateX: tx },
                    { translateY: ty },
                    { scale: sc },
                  ],
                },
              ]}
            />
          );
        })}
      </View>

      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Postar nova ação de bem"
        accessibilityState={{ selected: isFocused }}
        hitSlop={{ top: 16, bottom: 8, left: 12, right: 12 }}
        style={styles.pressable}
      >
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: translateYAnim },
              ],
            },
          ]}
        >
          {/* Sombra ambiente verde do botão (imita a sombra do logo) */}
          <View style={styles.buttonShadow} />

          {/* Ícone em massa de modelar 3D — fundo transparente */}
          <Image
            source={require('@/../assets/images/clay-post-icon.png')}
            style={[
              styles.clayImage,
              isFocused && styles.clayImageFocused,
            ]}
            contentFit="contain"
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const BUTTON_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  buttonWrapper: {
    marginTop: Platform.OS === 'ios' ? -12 : -10,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonShadow: {
    position: 'absolute',
    bottom: -4,
    width: BUTTON_SIZE * 0.85,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(76, 150, 24, 0.4)',
  },
  clayImage: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  clayImageFocused: {
    opacity: 0.95,
  },
  // Área de overlay para os blobs de splash
  splashArea: {
    position: 'absolute',
    width: BUTTON_SIZE * 2.6,
    height: BUTTON_SIZE * 2.6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? -12 : -10,
    zIndex: 5,
    pointerEvents: 'none',
  },
  splashBlob: {
    position: 'absolute',
    backgroundColor: '#8DC53E',
  },
});
