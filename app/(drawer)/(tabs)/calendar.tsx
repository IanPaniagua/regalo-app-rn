import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function CalendarTabScreen() {
  return (
    <AppContainer>
      <AppTitle>Calendar</AppTitle>
      <AppText style={{ marginTop: 8 }}>
        View and manage your events
      </AppText>
    </AppContainer>
  );
}
