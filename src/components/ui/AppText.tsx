import { ReactNode } from 'react';
import { Text, TextProps } from 'react-native';
import { fonts } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export interface AppTextProps extends TextProps {
  children: ReactNode;
}

export function AppText({ children, style, ...rest }: AppTextProps) {
  const { theme } = useAppTheme();
  
  return (
    <Text 
      style={[
        {
          color: theme.text,
          fontFamily: fonts.text,
          fontSize: 16,
        },
        style
      ]} 
      {...rest}
    >
      {children}
    </Text>
  );
}
