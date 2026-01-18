import { AppText } from '@/src/components/ui/AppText';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { TranslationKey } from '@/src/context/LanguageContext';

interface OnboardingSlide {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: 'gift-outline',
    titleKey: 'onboarding_welcome_title',
    descriptionKey: 'onboarding_welcome_description',
    color: '#4A90E2',
  },
  {
    icon: 'calendar-outline',
    titleKey: 'onboarding_birthdays_title',
    descriptionKey: 'onboarding_birthdays_description',
    color: '#E94B3C',
  },
  {
    icon: 'people-outline',
    titleKey: 'onboarding_connections_title',
    descriptionKey: 'onboarding_connections_description',
    color: '#6C5CE7',
  },
  {
    icon: 'heart-outline',
    titleKey: 'onboarding_groups_title',
    descriptionKey: 'onboarding_groups_description',
    color: '#00B894',
  },
];

export default function OnboardingScreen() {
  const { theme } = useAppTheme();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('ONBOARDING_COMPLETED', 'true');
    router.replace('/(drawer)/(tabs)/calendar');
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem('ONBOARDING_COMPLETED', 'true');
    router.replace('/(drawer)/(tabs)/calendar');
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Skip Button */}
      {!isLastSlide && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <AppText style={[styles.skipText, { color: theme.textMuted }]}>
            {t('onboarding_skip')}
          </AppText>
        </Pressable>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${slide.color}20` }]}>
          <Ionicons name={slide.icon} size={80} color={slide.color} />
        </View>

        {/* Title */}
        <AppText style={styles.title}>{t(slide.titleKey)}</AppText>

        {/* Description */}
        <AppText style={[styles.description, { color: theme.textSecondary }]}>
          {t(slide.descriptionKey)}
        </AppText>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottom}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentSlide ? theme.primary : theme.border,
                  width: index === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <Pressable
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleNext}
        >
          <AppText style={styles.buttonText}>
            {isLastSlide ? t('onboarding_get_started') : t('onboarding_next')}
          </AppText>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 60,
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
