import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';

export default function CalendarScreen() {
  return (
    <AppContainer>
      <AppTitle>Calendar</AppTitle>
      <AppText style={{ marginTop: 8 }}>
        Your events and schedule
      </AppText>
    </AppContainer>
  );
}
