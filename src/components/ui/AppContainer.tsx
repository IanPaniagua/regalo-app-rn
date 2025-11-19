import { ReactNode, memo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Image } from 'expo-image';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import BgDark from '../../../assets/images/bg-dark.png';
import BgLight from '../../../assets/images/bg-light.png';

interface AppContainerProps extends ViewProps {
  children: ReactNode;
}

export const AppContainer = memo(function AppContainer({ children, style, ...rest }: AppContainerProps) {
  const { theme, themeMode } = useAppTheme();
  const backgroundImage = themeMode === 'light' ? BgLight : BgDark;

  return (
    <View style={styles.container}>
      {/* Background image with aggressive caching */}
      <Image 
        source={backgroundImage} 
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
        transition={200}
      />
      
      {/* Capa de overlay sobre la imagen, detrás del contenido */}
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]} />

      {/* Contenido real de la app */}
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Capa de overlay sobre el fondo (entre la imagen y el contenido)
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
});
