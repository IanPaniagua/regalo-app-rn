import { PropsWithChildren, createContext, useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';

type ThemeContextValue = Record<string, never>;

const ThemeContext = createContext<ThemeContextValue>({});

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [fontsLoaded] = useFonts({
    TitleFont: PlayfairDisplay_700Bold,
    TextFont: Inter_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary">
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  return <ThemeContext.Provider value={{}}>{children}</ThemeContext.Provider>;
}
