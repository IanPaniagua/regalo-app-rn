import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export function HeaderLogo() {
  const { theme } = useAppTheme();
  
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.svg')}
        style={styles.logo}
        contentFit="contain"
        tintColor={theme.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
});
