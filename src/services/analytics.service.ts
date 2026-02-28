import { getAnalytics, isSupported, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { getFirebaseApp } from './firebase';

class AnalyticsService {
  private analytics: any = null;
  private isInitialized = false;

  async initialize() {
    try {
      const app = getFirebaseApp();
      const supported = await isSupported();

      if (!supported) {
        this.isInitialized = false;
        console.log('📊 Analytics no está soportado en React Native (corriendo en modo local)');
        return;
      }

      this.analytics = getAnalytics(app);
      this.isInitialized = true;
      console.log('✅ Analytics initialized');
    } catch (error) {
      // Analytics no disponible en React Native - esto es normal
      // Solo funciona en web, usaremos logging en su lugar
      this.isInitialized = false;
      console.log('📊 Analytics running in logging mode (React Native)');
    }
  }

  logEvent(eventName: string, params?: Record<string, any>) {
    if (!this.isInitialized || !this.analytics) {
      console.log(`📊 [Analytics] ${eventName}`, params);
      return;
    }

    try {
      logEvent(this.analytics, eventName, params);
      console.log(`📊 [Analytics] ${eventName}`, params);
    } catch (error) {
      console.error('❌ Error logging event:', error);
    }
  }

  setUser(userId: string, properties?: Record<string, any>) {
    if (!this.isInitialized || !this.analytics) {
      console.log(`👤 [Analytics] User set: ${userId}`, properties);
      return;
    }

    try {
      setUserId(this.analytics, userId);
      if (properties) {
        setUserProperties(this.analytics, properties);
      }
      console.log(`👤 [Analytics] User set: ${userId}`, properties);
    } catch (error) {
      console.error('❌ Error setting user:', error);
    }
  }

  // ==================== User Events ====================

  trackSignup(method: 'email' | 'google' | 'apple') {
    this.logEvent('sign_up', { method });
  }

  trackLogin(method: 'email' | 'google' | 'apple') {
    this.logEvent('login', { method });
  }

  trackLogout() {
    this.logEvent('logout');
  }

  // ==================== Birthday Events ====================

  trackAddManualBirthday() {
    this.logEvent('add_manual_birthday');
  }

  trackDeleteManualBirthday() {
    this.logEvent('delete_manual_birthday');
  }

  trackViewBirthdayCalendar() {
    this.logEvent('view_birthday_calendar');
  }

  // ==================== Connection Events ====================

  trackSendConnectionRequest(method: 'username' | 'link') {
    this.logEvent('send_connection_request', { method });
  }

  trackAcceptConnection() {
    this.logEvent('accept_connection');
  }

  trackRejectConnection() {
    this.logEvent('reject_connection');
  }

  // ==================== Group Events ====================

  trackCreateGroup(memberCount: number, totalPrice: number) {
    this.logEvent('create_group', {
      member_count: memberCount,
      total_price: totalPrice,
    });
  }

  trackInviteToGroup(invitedCount: number) {
    this.logEvent('invite_to_group', {
      invited_count: invitedCount,
    });
  }

  trackAcceptGroupInvite() {
    this.logEvent('accept_group_invite');
  }

  trackRejectGroupInvite() {
    this.logEvent('reject_group_invite');
  }

  trackSendGroupMessage() {
    this.logEvent('send_group_message');
  }

  trackMarkAsPaid() {
    this.logEvent('mark_as_paid');
  }

  trackCloseGroup() {
    this.logEvent('close_group');
  }

  trackDeleteGroup() {
    this.logEvent('delete_group');
  }

  trackEditGroup() {
    this.logEvent('edit_group');
  }

  trackRemoveMember() {
    this.logEvent('remove_member');
  }

  // ==================== Settings Events ====================

  trackChangeLanguage(language: 'es' | 'en' | 'de') {
    this.logEvent('change_language', { language });
  }

  trackToggleTheme(theme: 'light' | 'dark') {
    this.logEvent('toggle_theme', { theme });
  }

  trackToggleNotifications(enabled: boolean) {
    this.logEvent('toggle_notifications', { enabled });
  }

  // ==================== Screen Views ====================

  trackScreenView(screenName: string) {
    this.logEvent('screen_view', {
      screen_name: screenName,
    });
  }

  // ==================== Engagement ====================

  trackAppOpen() {
    this.logEvent('app_open');
  }

  trackSessionStart() {
    this.logEvent('session_start');
  }
}

export const analytics = new AnalyticsService();
