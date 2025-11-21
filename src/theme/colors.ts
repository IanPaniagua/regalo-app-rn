// Colores base compartidos
export const baseColors = {
  primary: '#cab097', // arena/beige como color principal por defecto (dark mode)
  gold: '#D4AF37',    // dorado solo para light mode
  tertiary: '#D9534F',
  successGreen: '#A8E6CF',

  // Compatibilidad con código legacy
  white: '#FFFFFF',
  black: '#000000',
  secondary: '#1A1A1A',
};

// Tema oscuro (actual)
export const darkTheme = {
  ...baseColors,
  primary: '#cab097', // beige/arena para modo dark
  background: '#1A1A1A',
  backgroundImage: 'bg-dark',
  overlay: 'rgba(0, 0, 0, 0.4)',
  surface: '#2A2A2A',
  surfaceHover: '#333333',
  border: '#444444',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#999999',
  cardBg: 'rgba(42, 42, 42, 0.9)',
  modalBg: '#1C1C1C',
  inputBg: '#2A2A2A',
};

// Tema claro (nuevo, azul elegante)
export const lightTheme = {
  ...baseColors,
  primary: '#cab097',  // arena/beige (mismo que dark mode)
  background: '#E6F0FF', // azul muy claro
  backgroundImage: 'bg-light',
  overlay: 'rgba(255, 255, 255, 0.3)',

  surface: '#F6FAFF',
  surfaceHover: '#EDF3FF',
  border: '#C2D4F2',

  text: '#0F172A',          // Texto principal: casi negro azulado (muy oscuro)
  textSecondary: '#1E293B', // Texto secundario: más oscuro para mejor contraste
  textMuted: '#475569',     // Texto muted: más oscuro que antes

  cardBg: 'rgba(246, 250, 255, 0.92)',
  modalBg: '#F6FAFF',
  inputBg: '#FFFFFF',
};

// Tipo para el tema
export type Theme = typeof darkTheme;
export type ThemeMode = 'light' | 'dark';

// Función para obtener el tema según el modo
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'light' ? lightTheme : darkTheme;
};

// Exportar colores base para compatibilidad (usa el dorado por defecto)
// Los componentes que necesiten el color del tema deben usar theme.primary
export const colors = baseColors;
