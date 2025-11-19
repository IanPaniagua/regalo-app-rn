import { ReactNode } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export interface AppCardProps extends ViewProps {
  children: ReactNode;
  variant?: 'solid' | 'transparent';
  bordered?: boolean;
}

/**
 * AppCard - Componente de tarjeta reutilizable con estilos consistentes
 * 
 * @param variant - 'solid' para fondo sólido (inputBg), 'transparent' para fondo transparente (cardBg)
 * @param bordered - Si true, añade un borde sutil
 */
export function AppCard({ 
  children, 
  style, 
  variant = 'solid',
  bordered = true,
  ...rest 
}: AppCardProps) {
  const { theme } = useAppTheme();
  
  const backgroundColor = variant === 'solid' ? theme.inputBg : theme.cardBg;
  const borderStyle = bordered ? {
    borderWidth: 1,
    borderColor: theme.border,
  } : {};
  
  return (
    <View 
      style={[
        styles.card,
        {
          backgroundColor,
          ...borderStyle,
        },
        style
      ]} 
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
});
