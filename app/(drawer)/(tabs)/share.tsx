import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function ShareTabScreen() {
  return (
    <AppContainer>
      <AppTitle>Share</AppTitle>
      <AppText style={{ marginTop: 8 }}>
        Share content with friends
      </AppText>
    </AppContainer>
  );
}
