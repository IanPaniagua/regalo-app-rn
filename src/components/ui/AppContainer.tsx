import { ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '@/src/theme';

export interface AppContainerProps extends ViewProps {
  children: ReactNode;
}

export function AppContainer({ children, style, ...rest }: AppContainerProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
});
