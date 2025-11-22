import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Zona horaria para Alemania (CET/CEST)
const TIMEZONE = 'Europe/Berlin';

// Expo Push API endpoint
const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

// Traducciones para notificaciones
const notificationTranslations = {
  es: {
    birthday_title: (name: string) => `🎉 ¡Hoy es el cumpleaños de ${name}!`,
    birthday_body: (age: number) => `Cumple ${age} años. No olvides felicitarlo 🎂`,
    monthly_summary_title: (month: string) => `🎂 Cumpleaños en ${month}`,
    monthly_summary_body: (count: number, list: string, more: string) => 
      `Tienes ${count} cumpleaños: ${list}${more}`,
  },
  en: {
    birthday_title: (name: string) => `🎉 It's ${name}'s birthday today!`,
    birthday_body: (age: number) => `Turns ${age} years old. Don't forget to wish them well 🎂`,
    monthly_summary_title: (month: string) => `🎂 Birthdays in ${month}`,
    monthly_summary_body: (count: number, list: string, more: string) => 
      `You have ${count} birthdays: ${list}${more}`,
  },
  de: {
    birthday_title: (name: string) => `🎉 Heute hat ${name} Geburtstag!`,
    birthday_body: (age: number) => `Wird ${age} Jahre alt. Vergiss nicht zu gratulieren 🎂`,
    monthly_summary_title: (month: string) => `🎂 Geburtstage im ${month}`,
    monthly_summary_body: (count: number, list: string, more: string) => 
      `Du hast ${count} Geburtstage: ${list}${more}`,
  },
};

// Nombres de meses en diferentes idiomas
const monthNames = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
};

// Tipos
type Lang = 'es' | 'en' | 'de';

interface UserData {
  id: string;
  name: string;
  email: string;
  birthdate: admin.firestore.Timestamp;
  fcmToken?: string;
  preferredLanguage?: Lang;
  [key: string]: any;
}

interface ExpoPushMessage {
  to: string | string[];
  sound?: 'default' | null;
  title?: string;
  body?: string;
  data?: any;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushResponse {
  data: Array<{
    status: 'ok' | 'error';
    id?: string;
    message?: string;
    details?: any;
  }>;
}

/**
 * Envía notificaciones usando Expo Push API
 */
async function sendExpoPushNotifications(
  messages: ExpoPushMessage[]
): Promise<ExpoPushResponse> {
  try {
    const response = await fetch(EXPO_PUSH_API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      throw new Error(`Expo Push API error: ${response.status}`);
    }

    return await response.json() as ExpoPushResponse;
  } catch (error) {
    console.error('❌ Error sending Expo push notifications:', error);
    throw error;
  }
}

/**
 * Función programada que se ejecuta todos los días a las 08:00 AM (hora de Alemania)
 * Envía notificaciones para cumpleaños del día
 */
export const sendDailyBirthdayReminders = functions
  .region('europe-west1') // Servidor en Europa para mejor latencia
  .pubsub
  .schedule('0 8 * * *') // Cron: 08:00 AM todos los días
  .timeZone(TIMEZONE)
  .onRun(async (context) => {
    console.log('🎂 Starting daily birthday reminders...');
    
    try {
      // Obtener la fecha actual en la zona horaria de Alemania
      const today = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
      const todayMonth = today.getMonth(); // 0-11
      const todayDay = today.getDate(); // 1-31
      
      console.log(`📅 Checking birthdays for: ${todayDay}/${todayMonth + 1}/${today.getFullYear()} (${TIMEZONE})`);
      
      // 1. Obtener todos los usuarios
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      
      console.log(`👥 Total users: ${users.length}`);
      
      // 2. Filtrar usuarios que cumplen años HOY
      const birthdayUsers = users.filter(user => {
        if (!user.birthdate) return false;
        
        // Convertir el timestamp a fecha en la zona horaria de Alemania
        const birthdate = new Date(user.birthdate.toDate().toLocaleString('en-US', { timeZone: TIMEZONE }));
        const birthMonth = birthdate.getMonth();
        const birthDay = birthdate.getDate();
        
        console.log(`  Checking ${user.name}: birthdate ${birthDay}/${birthMonth + 1} vs today ${todayDay}/${todayMonth + 1}`);
        
        return birthMonth === todayMonth && birthDay === todayDay;
      });
      
      console.log(`🎉 Users with birthday today: ${birthdayUsers.length}`);
      
      if (birthdayUsers.length === 0) {
        console.log('✅ No birthdays today');
        return null;
      }
      
      // 3. Para cada usuario que cumple años, notificar a sus conexiones
      for (const birthdayUser of birthdayUsers) {
        await notifyConnectionsAboutBirthday(birthdayUser);
      }
      
      console.log('✅ Daily birthday reminders sent successfully');
      return null;
      
    } catch (error) {
      console.error('❌ Error sending daily reminders:', error);
      throw error;
    }
  });

/**
 * Función programada que se ejecuta el día 20 de cada mes a las 09:00 AM
 * Envía resumen de cumpleaños del mes siguiente
 */
export const sendMonthlyBirthdaySummary = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 9 20 * *') // Cron: 09:00 AM del día 20 de cada mes
  .timeZone(TIMEZONE)
  .onRun(async (context) => {
    console.log('📊 Starting monthly birthday summary...');
    
    try {
      // Obtener la fecha actual en la zona horaria de Alemania
      const today = new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthNumber = nextMonth.getMonth(); // 0-11
      
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      console.log(`📅 Preparing summary for: ${monthNames[nextMonthNumber]}`);
      
      // 1. Obtener todos los usuarios
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      
      // 2. Obtener todas las conexiones aceptadas
      const connectionsSnapshot = await db
        .collection('connections')
        .where('status', '==', 'accepted')
        .get();
      
      const connections = connectionsSnapshot.docs.map(doc => doc.data());
      
      console.log(`🔗 Total connections: ${connections.length}`);
      
      // 3. Para cada usuario, encontrar cumpleaños del mes siguiente en sus conexiones
      const userMap = new Map(users.map(u => [u.id, u]));
      
      for (const user of users) {
        if (!user.fcmToken) continue; // Skip si no tiene token
        
        // Encontrar conexiones del usuario
        const userConnections = connections.filter(
          conn => conn.userId1 === user.id || conn.userId2 === user.id
        );
        
        // Obtener IDs de usuarios conectados
        const connectedUserIds = userConnections.map(conn => 
          conn.userId1 === user.id ? conn.userId2 : conn.userId1
        );
        
        // Filtrar cumpleaños del mes siguiente
        const nextMonthBirthdays = connectedUserIds
          .map(id => userMap.get(id))
          .filter(connectedUser => {
            if (!connectedUser || !connectedUser.birthdate) return false;
            
            const birthdate = connectedUser.birthdate.toDate();
            return birthdate.getMonth() === nextMonthNumber;
          })
          .sort((a, b) => {
            const dateA = a!.birthdate.toDate().getDate();
            const dateB = b!.birthdate.toDate().getDate();
            return dateA - dateB;
          });
        
        if (nextMonthBirthdays.length > 0) {
          await sendMonthlySummaryNotification(
            user,
            nextMonthBirthdays,
            nextMonthNumber
          );
        }
      }
      
      console.log('✅ Monthly summaries sent successfully');
      return null;
      
    } catch (error) {
      console.error('❌ Error sending monthly summary:', error);
      throw error;
    }
  });

/**
 * Notifica a las conexiones de un usuario sobre su cumpleaños
 */
async function notifyConnectionsAboutBirthday(birthdayUser: any) {
  try {
    console.log(`🎂 Notifying connections about ${birthdayUser.name}'s birthday`);
    
    // Obtener conexiones del usuario
    const connectionsSnapshot = await db
      .collection('connections')
      .where('status', '==', 'accepted')
      .get();
    
    const connections = connectionsSnapshot.docs
      .map(doc => doc.data())
      .filter(conn => 
        conn.userId1 === birthdayUser.id || conn.userId2 === birthdayUser.id
      );
    
    console.log(`🔗 Found ${connections.length} connections`);
    
    // Obtener IDs de usuarios conectados
    const connectedUserIds = connections.map(conn => 
      conn.userId1 === birthdayUser.id ? conn.userId2 : conn.userId1
    );
    
    // Obtener datos completos de usuarios conectados (incluyendo idioma preferido)
    const usersSnapshot = await db
      .collection('users')
      .where(admin.firestore.FieldPath.documentId(), 'in', connectedUserIds)
      .get();
    
    const connectedUsers = usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as UserData))
      .filter(user => user.fcmToken && user.fcmToken.startsWith('ExponentPushToken[')); // Filtrar usuarios con tokens Expo válidos
    
    if (connectedUsers.length === 0) {
      console.log('⚠️ No Expo Push tokens found for connections');
      return;
    }
    
    console.log(`📱 Sending to ${connectedUsers.length} devices`);
    
    // Calcular edad
    const birthdate = birthdayUser.birthdate.toDate();
    const age = new Date().getFullYear() - birthdate.getFullYear();
    
    // Crear mensajes para Expo Push API con traducciones según idioma del usuario
    const messages: ExpoPushMessage[] = connectedUsers.map(user => {
      const lang = user.preferredLanguage || 'en'; // Default a inglés si no tiene idioma
      const translations = notificationTranslations[lang];
      
      return {
        to: user.fcmToken!,
        sound: 'default',
        title: translations.birthday_title(birthdayUser.name),
        body: translations.birthday_body(age),
        data: {
          type: 'birthday',
          userId: birthdayUser.id,
          userName: birthdayUser.name,
          age: age.toString(),
        },
        priority: 'high',
      };
    });
    
    // Enviar notificaciones
    const response = await sendExpoPushNotifications(messages);
    
    const successCount = response.data.filter(r => r.status === 'ok').length;
    const failureCount = response.data.filter(r => r.status === 'error').length;
    
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    
    // Limpiar tokens inválidos
    if (failureCount > 0) {
      const tokens = connectedUsers.map(u => u.fcmToken!);
      await cleanupInvalidExpoPushTokens(response, tokens);
    }
    
  } catch (error) {
    console.error(`❌ Error notifying about ${birthdayUser.name}'s birthday:`, error);
  }
}

/**
 * Envía resumen mensual a un usuario
 */
async function sendMonthlySummaryNotification(
  user: any,
  birthdays: any[],
  monthIndex: number
) {
  try {
    if (!user.fcmToken || !user.fcmToken.startsWith('ExponentPushToken[')) return;
    
    const lang: Lang = user.preferredLanguage || 'en';
    const translations = notificationTranslations[lang];
    const monthName = monthNames[lang][monthIndex];
    
    console.log(`📊 Sending summary to ${user.name}: ${birthdays.length} birthdays in ${monthName}`);
    
    // Crear lista de cumpleaños
    const birthdayList = birthdays
      .slice(0, 3) // Máximo 3 en la notificación
      .map(b => {
        const day = b.birthdate.toDate().getDate();
        return `${b.name} (${day} ${monthName.toLowerCase().slice(0, 3)})`;
      })
      .join(', ');
    
    const moreText = birthdays.length > 3 ? ` y ${birthdays.length - 3} más` : '';
    
    const message: ExpoPushMessage = {
      to: user.fcmToken,
      sound: 'default',
      title: translations.monthly_summary_title(monthName),
      body: translations.monthly_summary_body(birthdays.length, birthdayList, moreText),
      data: {
        type: 'monthly_summary',
        month: monthName,
        count: birthdays.length.toString(),
      },
      priority: 'high',
    };
    
    const response = await sendExpoPushNotifications([message]);
    
    if (response.data[0].status === 'ok') {
      console.log(`✅ Summary sent to ${user.name}`);
    } else {
      console.error(`❌ Failed to send summary to ${user.name}:`, response.data[0].message);
      // Limpiar token inválido
      await db.collection('users').doc(user.id).update({
        fcmToken: admin.firestore.FieldValue.delete()
      });
      console.log(`🧹 Cleaned invalid token for ${user.name}`);
    }
    
  } catch (error: any) {
    console.error(`❌ Error sending summary to ${user.name}:`, error);
  }
}

/**
 * Limpia tokens Expo Push inválidos de la base de datos
 */
async function cleanupInvalidExpoPushTokens(response: ExpoPushResponse, tokens: string[]) {
  let cleanupCount = 0;
  
  // Procesar cada respuesta
  for (let idx = 0; idx < response.data.length; idx++) {
    const resp = response.data[idx];
    
    if (resp.status === 'error') {
      const invalidToken = tokens[idx];
      
      // Buscar y limpiar el token inválido
      try {
        const snapshot = await db.collection('users')
          .where('fcmToken', '==', invalidToken)
          .limit(1)
          .get();
        
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            fcmToken: admin.firestore.FieldValue.delete()
          });
          cleanupCount++;
          console.log(`🧹 Cleaned invalid token: ${invalidToken.substring(0, 20)}...`);
        }
      } catch (error) {
        console.error(`❌ Error cleaning token:`, error);
      }
    }
  }
  
  if (cleanupCount > 0) {
    console.log(`✅ Total cleaned tokens: ${cleanupCount}`);
  }
}

/**
 * Función HTTP para testing manual (opcional)
 * Llama con: curl https://[region]-[project-id].cloudfunctions.net/testBirthdayNotifications
 */
export const testBirthdayNotifications = functions
  .region('europe-west1')
  .https
  .onRequest(async (req, res) => {
    try {
      console.log('🧪 Testing birthday notifications manually...');
      
      // Usar la misma zona horaria que el scheduler (Europe/Berlin)
      const today = new Date();
      const berlinDateString = today.toLocaleString('en-US', { 
        timeZone: 'Europe/Berlin',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      // Parse la fecha correctamente (formato: MM/DD/YYYY)
      const [month, day] = berlinDateString.split(',')[0].split('/');
      const todayMonth = parseInt(month) - 1; // 0-11
      const todayDay = parseInt(day); // 1-31
      
      console.log(`📅 Manual test - Checking birthdays for: ${todayDay}/${todayMonth + 1} (Berlin time)`);
      
      // 1. Obtener todos los usuarios
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      
      console.log(`👥 Total users: ${users.length}`);
      
      // Log detallado de todos los usuarios y sus cumpleaños
      console.log('📋 All users birthdays:');
      const allBirthdays = users.map(user => {
        if (user.birthdate) {
          const birthdate = user.birthdate.toDate();
          return {
            name: user.name,
            day: birthdate.getDate(),
            month: birthdate.getMonth() + 1,
            year: birthdate.getFullYear(),
            formatted: `${birthdate.getDate()}/${birthdate.getMonth() + 1}/${birthdate.getFullYear()}`
          };
        }
        return { name: user.name, error: 'NO BIRTHDATE' };
      });
      
      allBirthdays.forEach(b => {
        console.log(`  - ${b.name}: ${b.formatted || b.error}`);
      });
      
      // 2. Filtrar usuarios que cumplen años HOY
      const birthdayUsers = users.filter(user => {
        if (!user.birthdate) return false;
        
        const birthdate = user.birthdate.toDate();
        const birthMonth = birthdate.getMonth();
        const birthDay = birthdate.getDate();
        
        const matches = birthMonth === todayMonth && birthDay === todayDay;
        
        if (matches) {
          console.log(`✅ MATCH: ${user.name} - ${birthDay}/${birthMonth + 1} matches ${todayDay}/${todayMonth + 1}`);
        }
        
        return matches;
      });
      
      console.log(`🎉 Users with birthday today: ${birthdayUsers.length}`);
      
      if (birthdayUsers.length === 0) {
        console.log('✅ No birthdays today');
        res.status(200).send({
          success: true,
          message: 'No birthdays today',
          date: `${todayDay}/${todayMonth + 1}`,
          totalUsers: users.length,
          allBirthdays: allBirthdays
        });
        return;
      }
      
      // 3. Para cada usuario que cumple años, notificar a sus conexiones
      const results = [];
      for (const birthdayUser of birthdayUsers) {
        console.log(`🎂 Processing birthday for: ${birthdayUser.name}`);
        await notifyConnectionsAboutBirthday(birthdayUser);
        results.push({
          name: birthdayUser.name,
          id: birthdayUser.id
        });
      }
      
      console.log('✅ Manual test completed - notifications sent');
      
      res.status(200).send({
        success: true,
        message: 'Birthday notifications sent successfully',
        date: `${todayDay}/${todayMonth + 1}`,
        birthdayUsers: results,
        totalUsers: users.length
      });
      
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      res.status(500).send({
        success: false,
        error: error?.message || 'Unknown error',
        stack: error?.stack
      });
    }
  });
