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
    <View style={styles.container}>
      <Image 
        source={BgDark} 
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
      />
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
