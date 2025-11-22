import { Pressable, PressableProps, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export interface AppButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export function AppButton({ title, variant = 'primary', style, ...rest }: AppButtonProps) {
  const { theme, themeMode } = useAppTheme();
  
  // Para botón secondary en modo light, usar texto más oscuro para mejor contraste
  const getTextColor = () => {
    if (variant === 'primary') {
      return theme.background;
    }
    // Secondary button
    if (themeMode === 'light') {
      return theme.text; // Texto oscuro en modo light
    }
    return theme.primary; // Texto beige en modo dark
  };
  
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
          borderColor: variant === 'secondary' && themeMode === 'light' ? theme.text : theme.primary,
        },
        style,
      ]}
      {...rest}
    >
      <AppText 
        style={{
          fontSize: 18,
          fontWeight: '600',
          color: getTextColor(),
        }}
      >
        {title}
      </AppText>
    </Pressable>
  );
}
