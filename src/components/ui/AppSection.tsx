import { ReactNode } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export interface AppSectionProps extends ViewProps {
  children: ReactNode;
}

/**
 * AppSection - Contenedor de sección con fondo transparente
 * Usado para agrupar contenido con un fondo sutil que permite ver la imagen de fondo
 */
export function AppSection({ 
  children, 
  style, 
  ...rest 
}: AppSectionProps) {
  const { theme } = useAppTheme();
  
  return (
    <View 
      style={[
        styles.section,
        {
          backgroundColor: theme.cardBg, // Fondo transparente
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
  section: {
    borderRadius: 16,
    padding: 16,
  },
});
