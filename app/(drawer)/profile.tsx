import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function ProfileScreen() {
  return (
    <AppContainer>
      <AppTitle>Profile</AppTitle>
      <AppText style={{ marginTop: 8 }}>
        User profile information
      </AppText>
    </AppContainer>
  );
}
