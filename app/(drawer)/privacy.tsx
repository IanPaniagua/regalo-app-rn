import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function PrivacyScreen() {
  return (
    <AppContainer>
      <AppTitle>Privacy Policy</AppTitle>
      <AppText style={{ marginTop: 8 }}>
        Terms and conditions
      </AppText>
    </AppContainer>
  );
}
