import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function LogoutScreen() {
  return (
    <AppContainer>
      <AppTitle>Logout</AppTitle>
      <AppText style={{ marginTop: 8 }}>
        Sign out from your account
      </AppText>
    </AppContainer>
  );
}
