import { ReactNode } from 'react';
import { StyleSheet, View, ViewProps, ImageBackground } from 'react-native';
import { colors } from '@/src/theme';
import BgDark from '../../../assets/images/bg-dark.png';

export interface AppContainerProps extends ViewProps {
  children: ReactNode;
}

export function AppContainer({ children, style, ...rest }: AppContainerProps) {
  return (
    <ImageBackground source={BgDark} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={[styles.content, style]} {...rest}>
          {children}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
});
