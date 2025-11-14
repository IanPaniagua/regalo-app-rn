import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function ProfileTabScreen() {
  return (
    <AppContainer>
      <AppTitle>Profile</AppTitle>
      <AppText style={{ marginTop: 8 }}>
        Your personal information
      </AppText>
    </AppContainer>
  );
}
