import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function SettingsScreen() {
  return (
    <AppContainer>
      <AppTitle>Settings</AppTitle>
      <AppText style={{ marginTop: 8 }}>
        App configuration and preferences
      </AppText>
    </AppContainer>
  );
}
