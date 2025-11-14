import { ReactNode } from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { colors, fonts } from '@/src/theme';

export interface AppTextProps extends TextProps {
  children: ReactNode;
}

export function AppText({ children, style, ...rest }: AppTextProps) {
  return (
    <Text style={[styles.text, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 16,
  },
});
