import { ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/src/theme';
import BgDark from '../../../assets/images/bg-dark.png';

export interface AppContainerProps extends ViewProps {
  children: ReactNode;
}

export function AppContainer({ children, style, ...rest }: AppContainerProps) {
  return (
    <ImageBackground source={BgDark} style={styles.container} resizeMode="cover">
      {/* Capa oscura sobre la imagen, detrás del contenido */}
      <View style={styles.darkOverlay} />

      {/* Contenido por encima, con colores sin teñir */}
      <View style={styles.overlay}>
        <View style={[styles.content, style]} {...rest}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Capa que oscurece solo el fondo (entre la imagen y el contenido)
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  // Contenedor del contenido, por encima del fondo oscurecido
  overlay: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
});
