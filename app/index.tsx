import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';

export default function Home() {
  return (
    <AppContainer>
      <AppTitle className="text-primary">Título de Prueba</AppTitle>
      <AppText className="text-white mt-2">
        Este es un texto de prueba usando el sistema de diseño.
      </AppText>
    </AppContainer>
  );
}
