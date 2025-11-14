import { ReactNode } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { colors, fonts } from '@/src/theme';

export interface AppTitleProps extends TextProps {
  children: ReactNode;
}

export function AppTitle({ children, style, ...rest }: AppTitleProps) {
  return (
    <Text style={[styles.title, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.primary,
    fontFamily: fonts.title,
    fontSize: 28,
  },
});
