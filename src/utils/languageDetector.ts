import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

export type Lang = 'es' | 'en' | 'de';

const STORAGE_KEY = '@regalo_app_language';

/**
 * Resolves the app language based on device locale
 * Defaults to 'en' if locale is unsupported
 */
function resolveAppLanguage(locale: string | null | undefined): Lang {
    if (!locale) return 'en';
    const code = locale.split('-')[0].toLowerCase();
    if (code === 'es') return 'es';
    if (code === 'de') return 'de';
    return 'en';
}

/**
 * Ensures language is initialized before app starts
 * Detects device language on first launch and saves to AsyncStorage
 * @returns The current app language
 */
export async function ensureLanguageInitialized(): Promise<Lang> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (stored === 'es' || stored === 'en' || stored === 'de') {
        console.log(`✅ Language already initialized: ${stored}`);
        return stored;
    }

    // Detect device locale
    let deviceLocale: string | null = null;
    try {
        const locales = Localization.getLocales();
        if (locales && locales.length > 0) {
            deviceLocale = locales[0].languageCode || null;
            console.log(`📱 Device locale detected: ${deviceLocale}`);
        }
    } catch (error) {
        console.warn('⚠️ Error detecting device locale, falling back to en:', error);
    }

    const detectedLang = resolveAppLanguage(deviceLocale);
    await AsyncStorage.setItem(STORAGE_KEY, detectedLang);
    console.log(`✅ Language detected and saved: ${detectedLang}`);

    return detectedLang;
}
