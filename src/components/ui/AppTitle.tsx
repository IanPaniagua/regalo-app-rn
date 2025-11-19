import { ReactNode } from 'react';
import { Text, TextProps } from 'react-native';
import { fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export interface AppTitleProps extends TextProps {
  children: ReactNode;
}

export function AppTitle({ children, style, ...rest }: AppTitleProps) {
  const { theme } = useAppTheme();
  
  return (
    <Text 
      style={[
        {
          color: theme.primary,
          fontFamily: fonts.title,
          fontSize: 28,
        },
        style
      ]} 
      {...rest}
    >
      {children}
    </Text>
  );
}
