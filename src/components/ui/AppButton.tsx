import { Pressable, PressableProps, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export interface AppButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export function AppButton({ title, variant = 'primary', style, ...rest }: AppButtonProps) {
  const { theme } = useAppTheme();
  
  return (
    <Pressable
      style={[
        {
          backgroundColor: variant === 'primary' ? theme.primary : 'transparent',
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 12,
          alignItems: 'center',
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.primary,
        },
        style,
      ]}
      {...rest}
    >
      <AppText 
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: variant === 'primary' ? theme.background : theme.primary,
        }}
      >
        {title}
      </AppText>
    </Pressable>
  );
}
