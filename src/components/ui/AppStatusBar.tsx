import { StatusBar } from 'expo-status-bar';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * StatusBar que se adapta automáticamente al tema de la app
 * - Modo dark: texto blanco
 * - Modo light: texto oscuro
 */
export function AppStatusBar() {
  const { themeMode } = useAppTheme();
  
  return <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />;
}
