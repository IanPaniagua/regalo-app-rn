# Documentación de Notificaciones Automáticas

Las notificaciones automáticas de RegaloApp están gestionadas en el backend mediante **Google Cloud Functions** (carpeta `functions/src/index.ts`). Este documento detalla las funciones programadas principales, su flujo de ejecución y la arquitectura técnica que las sustenta.

## Stack Tecnológico y Arquitectura

La automatización de estas notificaciones se basa en tres pilares fundamentales que operan en conjunto:

1. **Google Cloud Scheduler (Pub/Sub):** Actúa como el reloj interno del sistema (cron job). Se encarga de "despertar" a las Cloud Functions en los horarios exactos de forma confiable sin necesidad de tener un servidor dedicado encendido y facturando 24/7 (ej. una instancia de un servidor de Node Express).
2. **Firebase Cloud Functions (Backend Serverless):** Constituye el cerebro lógico basado en Node.js y TypeScript.
   - *¿Por qué se eligió Cloud Functions?* En lugar de obligar a que la App React Native en el móvil del usuario se despierte por sí sola en segundo plano –lo cual es extremadamente ineficiente para la batería y muy inconsistente en Android/iOS debido a sus bloqueos en background– delegamos todas las comprobaciones de fechas pesadas a los servidores seguros de Google.
3. **Expo Push API:** Es la pasarela de envíos de alerta.
   - *¿Por qué se eligió y no enviarlo por Apple APNs localmente?* Porque la API de Push de Expo actúa como un intermediario universal. Nosotros le damos el mensaje una sola vez y Expo se encarga nativamente de entregarlo al protocolo correcto, sea de Apple (APNs) o Android (FCM), abstrayendo al desarrollador por completo del enrutamiento de dispositivos subyacente de cada marca.

---

## 1. Alerta Diaria de Cumpleaños (`checkBirthdaysAndNotify`)

Esta función está programada mediante Pub/Sub para ejecutarse **todos los días a las 09:00 AM** (hora de Europa/Berlín).

### Flujo de Ejecución:
1. **Búsqueda de Cumpleañeros:** Extrae los usuarios registrados cuyo día y mes de nacimiento coinciden exactamente con el día actual.
2. **Notificación a Conexiones Reales:** 
   - Por cada usuario que cumple años, busca todas sus **conexiones en estado "aceptado"**.
   - Envía una notificación Push (vía API de Expo Push) a todos esos contactos amigos con el mensaje: *"¡Hoy es el cumpleaños de [Nombre]! Cumple [Edad] años."*
   - El mensaje se traduce al idioma de preferencia del destinatario (Inglés o Español).
3. **Notificación de Entradas Manuales:** 
   - Después de notificar cumpleaños reales, recorre la base de datos de todos los usuarios buscando **cumpleaños manuales** configurados para el día actual.
   - Si la entrada manual **no está auto-vinculada** a un usuario real, enviará una notificación push individual a la persona que la registró: *"¡Hoy es el cumpleaños de [Nombre Manual]!"*.
4. **Limpieza de Tokens Inválidos:** 
   - Si una persona desinstaló la aplicación o revocó permisos de notificaciones, la API de Expo devolverá un error (ej. `DeviceNotRegistered`).
   - El sistema detecta estos errores y realiza una *limpieza (cleanup)*, eliminando de Firestore el `fcmToken` asociado a ese usuario para no desperdiciar peticiones futuras.

---

## 2. Resumen Mensual de Cumpleaños (`sendMonthlyBirthdaySummary`)

Esta función se ejecuta de forma anticipada **el día 20 de cada mes a las 09:00 AM**. Su propósito es dar al usuario un aviso sobre los cumpleaños del siguiente mes para que puedan organizar regalos.

### Flujo de Ejecución:
1. **Detección del Mes Siguiente:** Se calcula la fecha para apuntar al mes venidero.
2. **Filtrado por Usuario:** Para cada usuario de la plataforma, repasa su lista de **conexiones aceptadas**.
3. **Detección de Fechas:** Extrae de esa lista únicamente las personas que cumplen años el mes siguiente y las ordena cronológicamente (del día 1 al fin de mes).
4. **Envío del Resumen Agrupado:** 
   - Envía un resumen por notificación push formato: *"Tienes [X] cumpleaños en [Nombre del Mes]"*.
   - El cuerpo del mensaje muestra hasta **3 personas principales** indicando el día para evitar saturar el aviso: *"Juan (12 nov), Maria (24 nov) y [X] más"*.

---

## 3. Pruebas y Depuración (`testBirthdayNotifications`)

Para facilitar el mantenimiento y testing sin esperar a que el "cron job" salte a las 09:00 AM, el desarrollo incluye un endpoint web manual HTTP.

Al realizar una solicitud (por ejemplo, mediante cURL o postman a `https://[region]-[project-id].cloudfunctions.net/testBirthdayNotifications`), el backend:
1. Simula el escáner diario evaluando los cumpleaños según la fecha en ese instante.
2. Devuelve un extenso LOG estadístico y un bloque de JSON informando cuántos usuarios fueron encontrados y cuántas notificaciones push tuvieron éxito o fallaron en el entorno de desarrollo.
