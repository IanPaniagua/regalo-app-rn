import { Pressable, StyleSheet, PressableProps, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/src/theme';

export interface AppButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export function AppButton({ title, variant = 'primary', style, ...rest }: AppButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        style,
      ]}
      {...rest}
    >
      <AppText style={[
        styles.buttonText,
        variant === 'primary' && styles.buttonTextPrimary,
        variant === 'secondary' && styles.buttonTextSecondary,
      ]}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: colors.secondary,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
});
