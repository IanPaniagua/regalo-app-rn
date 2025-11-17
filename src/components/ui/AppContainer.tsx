import { ReactNode, memo } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/src/theme';
import BgDark from '../../../assets/images/bg-dark.png';

interface AppContainerProps extends ViewProps {
  children: ReactNode;
}

export const AppContainer = memo(function AppContainer({ children, style, ...rest }: AppContainerProps) {
  return (
    <View style={styles.container}>
      {/* Background image with aggressive caching */}
      <Image 
        source={BgDark} 
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
        transition={0}
      />
      
      {/* Capa oscura sobre la imagen, detrás del contenido */}
      <View style={styles.darkOverlay} />

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
  // Capa que oscurece solo el fondo (entre la imagen y el contenido)
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
});
