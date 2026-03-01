# Estrategia de Analíticas (Fase TestFlight / Testing Android)

En fase de beta (TestFlight / Internal Testing), **sí es recomendable poner analíticas**, pero de forma estratégica. No intentes medir cada clic, sino entender dónde se cae el usuario en el funnel (embudo) principal.

## ¿Poner Analíticas ahora o esperar?
**Recomendación:** Implementar un **stack mínimo viable** ahora. 
- *Por qué sí:* Si tienes a 20 beta-testers y 10 no logran añadir un cumpleaños manual porque la UI es confusa, necesitas saberlo *antes* del lanzamiento a producción. Si solo escuchas el feedback directo ("me gusta mucho"), te pierdes a los que simplemente cerraron la app y no te dijeron nada.
- *Por qué no hacerlo complejo:* Poner analíticas exhaustivas (medir cuánto tiempo pasan en cada pantalla, qué botón pulsan) lleva mucho tiempo de implementación. 

## Stack Recomendado (Opciones)

Dado que RegaloApp usa React Native (Expo) y Firebase, estas son tus mejores opciones:

### Opción 1: Firebase Analytics (Google Analytics) - Lo más rápido y lógico
*   **Pros:** Como ya estás usando Firebase Auth y Firestore, la integración es casi inmediata instalando `@react-native-firebase/analytics`. Es 100% gratis sin límite de volumen.
*   **Contras:** Su interfaz de reporting no es la mejor para Startups, tarda 24h en procesar datos y crear "Funnels" (embudos) es un poco rígido.
*   **Veredicto:** Ideal para arrancar hoy mismo sin añadir dependencias externas pesadas.

### Opción 2: PostHog - La navaja suiza moderna (🏆 Mi recomendación)
*   **Pros:** Integra analítica de eventos, "Grabación de Sesiones" (literalmente ves la pantalla como si fuera un video de dónde tocó el usuario), y Feature Flags en una sola SDK de React Native perfecta para Expo. 
*   **Contras:** Añade un dashboard extra que vigilar.
*   **Veredicto:** Para la fase de Beta, ver los *Session Replays* de PostHog no tiene precio. Verás exactamente cómo los usuarios intentan (y a veces fallan) al agregar conexiones. Tiene un plan gratuito muy generoso.

### Opción 3: Mixpanel / Amplitude - Los especialistas en Producto
*   **Pros:** Los reyes indiscutibles para crear embudos de retención. Sus dashboards son hermosos y muy fáciles de entender para analítica de comportamiento.
*   **Contras:** Son caros a escala y requieren una planificación meticulosa de "eventos". No tienen Replay de sesión como PostHog.

---

## Métricas críticas para esta Fase (TestFlight)

En lugar de medirlo todo, concéntrate en **4 eventos clave** que definen si RegaloApp funciona o fracasa:

1. **`onboarding_completed`**
   - *Por qué importa:* Si la gente se baja la app pero no completa el perfil (nombre, nacimiento, notificaciones), mueren en la orilla. 
   - *Dato asociado:* En qué paso del onboarding abandonan más (ej. ¿se caen al pedir permisos de notificaciones?).

2. **`connection_requested` & `connection_accepted`**
   - *Por qué importa:* RegaloApp es una app social. Si los usuarios no añaden a nadie a su círculo, el valor de la app es cero. 
   - *Dato asociado:* Creado mediante búsqueda (`method: search`) o escaneando un QR (`method: qr`).

3. **`manual_birthday_added`**
   - *Por qué importa:* Si los usuarios no consiguen convencer a sus amigos de bajar la app, ¿acaban añadiendo los cumpleaños a mano para retener la utilidad del calendario?

4. **`group_gift_created`**
   - *Por qué importa:* Esta es probablemente la funcionalidad estrella (y futura vía de monetización). Necesitas medir si los grupos se crean y, más importante, si otros usuarios *se unen* (`group_gift_joined`).

## Propuesta de Implementación a futuro
Cuando decidas integrarlo en el código (te sugiero **PostHog** por las sesiones en vídeo), crearemos un servicio centralizado:
*   Un `AnalyticsService.ts` 
*   Para que si el día de mañana cambias de Firebase a Mixpanel, solo toques un archivo y no todas las pantallas de React.
