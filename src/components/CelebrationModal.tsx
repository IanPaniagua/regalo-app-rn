import React, { useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { colors } from '@/src/theme';

interface CelebrationModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onButtonPress: () => void;
}

export function CelebrationModal({
  visible,
  title,
  message,
  buttonText,
  onButtonPress,
}: CelebrationModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    console.log('🎊 CelebrationModal visible changed:', visible);
    if (visible) {
      console.log('🎊 Starting modal animation and confetti');
      // Disparar confetti
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);

      // Animar entrada del modal
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icono de celebración */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
            </View>
          </View>

          {/* Título */}
          <AppText style={styles.title}>{title}</AppText>

          {/* Mensaje */}
          <AppText style={styles.message}>{message}</AppText>

          {/* Botón */}
          <AppButton
            title={buttonText}
            onPress={onButtonPress}
            style={styles.button}
          />
        </Animated.View>

        {/* Confetti */}
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={2500}
          colors={[colors.primary, '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3']}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.successGreen,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C5F2D',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#2C5F2D',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  button: {
    width: '100%',
  },
});
