import { useUser } from '@/src/context/UserContext';
import { db } from '@/src/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export type Lang = 'es' | 'en' | 'de';

const STORAGE_KEY = '@regalo_app_language';

const translations = {
  es: {
    // Commons
    common_ok: 'OK',
    common_cancel: 'Cancelar',
    common_done: 'Listo',
    settings_title: 'Ajustes',
    settings_notifications: 'Notificaciones',
    settings_notifications_toggle: 'Activar notificaciones push',
    settings_notifications_helper: 'Recordatorios de cumpleaños e invitaciones.',
    settings_notifications_system_disabled:
      'Las notificaciones están desactivadas a nivel del sistema. Actívalas en los ajustes de tu dispositivo.',
    settings_appearance: 'Apariencia',
    settings_theme: 'Tema',
    settings_theme_light: 'Claro',
    settings_theme_dark: 'Oscuro',
    settings_language: 'Idioma',
    settings_language_restart_required: 'Reinicia la app para ver los cambios de idioma',
    settings_language_change_title: 'Cambiar idioma',
    settings_language_change_message: '¿Quieres cambiar el idioma de la aplicación? Tendrás que cerrar y volver a abrir la app para aplicar los cambios.',
    settings_language_change_cancel: 'Cancelar',
    settings_language_change_confirm: 'Cambiar',
    language_spanish: 'Español',
    language_english: 'Inglés',
    language_german: 'Alemán',

    welcome_title: 'Bienvenido',
    welcome_create_profile: 'Crear Perfil',
    welcome_login: 'Iniciar Sesión',

    login_title: 'Iniciar Sesión',
    login_subtitle: 'Ingresa con tu email y contraseña',
    login_email_label: 'Email',
    login_email_placeholder: 'tu@email.com',
    login_password_label: 'Contraseña',
    login_password_placeholder: 'Tu contraseña',
    login_button: 'Iniciar Sesión',
    login_button_loading: 'Iniciando sesión...',
    login_back: 'Volver',
    login_forgot_password: '¿Has olvidado tu contraseña?',
    login_error_title: 'Error',
    login_error_email_required: 'Por favor ingresa tu email',
    login_error_password_required: 'Por favor ingresa tu contraseña',
    login_error_generic: 'No se pudo iniciar sesión',

    create_profile_intro_title: 'Vamos a crear tu perfil',
    create_profile_email_title: '¿Cuál es tu email?',
    create_profile_email_subtitle: 'Crea tu cuenta para acceder a la app',
    create_profile_email_label: 'Email',
    create_profile_email_placeholder: 'tu@email.com',
    create_profile_password_label: 'Contraseña',
    create_profile_password_placeholder: 'Mínimo 6 caracteres',
    create_profile_button: 'Crear cuenta',
    create_profile_button_loading: 'Creando perfil...',
    create_profile_confirm_password_label: 'Confirmar contraseña',
    create_profile_confirm_password_placeholder: 'Repite tu contraseña',
    create_profile_error_title: 'Error',
    create_profile_error_email_required: 'Por favor ingresa tu email',
    create_profile_error_email_invalid: 'Por favor ingresa un email válido',
    create_profile_error_password_required: 'Por favor ingresa una contraseña',
    create_profile_error_password_min_length: 'La contraseña debe tener al menos 6 caracteres',
    create_profile_error_password_mismatch: 'Las contraseñas no coinciden',
    create_profile_error_tempuser_missing: 'No se encontraron datos del perfil. Por favor vuelve a empezar.',
    create_profile_error_generic: 'Hubo un problema al crear tu perfil. Por favor intenta de nuevo.',
    create_profile_created_title: 'Perfil creado',
    create_profile_created_message: '¡Tu perfil ha sido creado exitosamente!',

    invite_invalid_id: 'ID de invitación inválido',
    invite_not_found: 'Invitación no encontrada',
    invite_expired: 'Esta invitación ha expirado',
    invite_used: 'Esta invitación ya fue usada',
    invite_load_error: 'Error al cargar la invitación',
    invite_login_title: 'Inicia sesión',
    invite_login_message: 'Necesitas iniciar sesión para aceptar esta invitación',
    invite_login_cancel: 'Cancelar',
    invite_login_action: 'Iniciar sesión',
    invite_error_self_connect: 'No puedes conectar contigo mismo',
    invite_connected_title: '¡Petición enviada!',
    invite_connected_message: 'Petición de conexión enviada a {{name}}. Espera su respuesta.',
    invite_connected_button: 'Ver conexiones',
    invite_accepting: 'Aceptando...',
    invite_accept: 'Aceptar',
    invite_reject: 'Rechazar',
    invite_reject_title: 'Rechazar invitación',
    invite_reject_message: '¿Estás seguro de que quieres rechazar esta invitación?',
    invite_reject_cancel: 'Cancelar',
    invite_reject_confirm: 'Rechazar',
    invite_invalid_title: 'Invitación no válida',
    invite_invalid_fallback: 'No se pudo cargar la invitación',
    invite_loading: 'Cargando invitación...',
    invite_login_required_inline: 'Necesitas iniciar sesión para aceptar esta invitación',
    invite_expiry_prefix: 'Esta invitación expira el ',

    // Calendar
    calendar_title: 'Calendario',
    calendar_month_birthdays_title: 'Cumpleaños en {{month}}',
    calendar_month_birthdays_count_label: 'Cumpleaños',
    calendar_view_list: 'Ver lista',
    calendar_day_modal_title: 'Cumpleaños - {{day}} de {{month}}',
    calendar_month_modal_title: '{{month}} - {{count}} cumpleaños',
    calendar_month_modal_empty: 'No hay cumpleaños este mes',
    calendar_day_item_age_suffix: 'años',
    calendar_profile_modal_title: 'Perfil',
    calendar_profile_birthdate_label: 'Fecha de nacimiento',
    calendar_profile_age_label: 'Edad',
    calendar_profile_email_label: 'Email',
    calendar_profile_hobbies_label: 'Hobbies',
    calendar_profile_gift_preferences_label: 'Preferencias de regalos',
    calendar_profile_close_button: 'Cerrar',
    calendar_add_button: 'Añadir',
    calendar_add_menu_create_connection: 'Crear conexión',
    calendar_add_menu_add_manually: 'Añadir manualmente',
    calendar_manual_modal_title: 'Añadir cumpleaños manualmente',
    calendar_manual_name_label: 'Nombre',
    calendar_manual_name_placeholder: 'Nombre de la persona',
    calendar_manual_date_label: 'Fecha de nacimiento',
    calendar_manual_date_placeholder: 'Selecciona una fecha',
    calendar_manual_submit_button: 'Guardar cumpleaños',
    calendar_manual_error_title: 'Error',
    calendar_manual_error_name_required: 'Por favor ingresa un nombre',
    calendar_manual_error_generic: 'No se pudo añadir el cumpleaños',
    calendar_manual_success_title: 'Éxito',
    calendar_manual_success_message: 'Cumpleaños de {{name}} añadido correctamente',
    calendar_manual_edit_title: 'Editar cumpleaños',
    calendar_manual_edit_submit: 'Guardar cambios',
    calendar_manual_edit_success: 'Cumpleaños actualizado correctamente',
    calendar_manual_delete_confirm_title: '¿Eliminar cumpleaños?',
    calendar_manual_delete_confirm_message: '¿Estás seguro que deseas eliminar el cumpleaños de {{name}}?',
    calendar_manual_delete_button: 'Eliminar',
    // Days of week (short)
    day_mon: 'Lun',
    day_tue: 'Mar',
    day_wed: 'Mié',
    day_thu: 'Jue',
    day_fri: 'Vie',
    day_sat: 'Sáb',
    day_sun: 'Dom',
    // Months
    month_january: 'Enero',
    month_february: 'Febrero',
    month_march: 'Marzo',
    month_april: 'Abril',
    month_may: 'Mayo',
    month_june: 'Junio',
    month_july: 'Julio',
    month_august: 'Agosto',
    month_september: 'Septiembre',
    month_october: 'Octubre',
    month_november: 'Noviembre',
    month_december: 'Diciembre',

    // Birthday Notification Modal
    birthday_modal_title_single: '¡Cumpleaños!',
    birthday_modal_title_multiple: '¡Cumpleaños de hoy!',
    birthday_modal_loading: 'Cargando...',
    birthday_modal_empty: 'No hay cumpleaños hoy',
    birthday_modal_age_text: 'Cumple {{age}} años hoy 🎂',
    birthday_modal_close_button: 'Cerrar',

    // Connect
    connect_title: 'Conectar',
    connect_subtitle: 'Conecta con amigos para ver sus cumpleaños',
    connect_invite_label: 'Invitar por nombre de usuario',
    connect_invite_placeholder: 'nombre_usuario',
    connect_invite_button: 'Enviar Invitación',
    connect_invite_button_loading: 'Enviando...',
    connect_invite_error_username_required: 'Por favor ingresa un nombre de usuario',
    connect_tab_connections: 'Mis Conexiones ({{count}})',
    connect_tab_pending: 'Pendientes',
    connect_empty_requires_login_title: 'Inicia sesión',
    connect_empty_requires_login_text: 'Inicia sesión para conectar con amigos',
    connect_empty_connections_title: 'No tienes conexiones todavía',
    connect_empty_connections_subtitle: 'Envía una invitación para conectar con amigos',
    connect_empty_pending_title: 'No tienes invitaciones pendientes',
    connect_accept_invitation_success_title: '¡Conectado!',
    connect_accept_invitation_success_message:
      'Ahora estás conectado con {{name}}. Sus cumpleaños aparecerán en tu calendario.',
    connect_accept_invitation_error_title: 'Error',
    connect_accept_invitation_error_message: 'No se pudo aceptar la invitación',
    connect_reject_invitation_error_title: 'Error',
    connect_reject_invitation_error_message: 'No se pudo rechazar la invitación',
    connect_disconnect_title: 'Desconectar contacto',
    connect_disconnect_message:
      'Si desconectas de {{name}}, dejarás de ver sus cumpleaños en tu calendario.',
    connect_disconnect_confirm: 'Desconectar',
    connect_disconnect_cancel: 'Cancelar',
    connect_disconnect_error_title: 'Error',
    connect_disconnect_error_message: 'No se pudo desconectar',

    // Profile
    profile_title: 'Mi Perfil',
    profile_edit: 'Editar',
    profile_name: 'Nombre',
    profile_avatar: 'Avatar',
    profile_email: 'Email',
    profile_birthdate: 'Fecha de nacimiento',
    profile_privacy_hide_age: 'No revelar edad',
    profile_privacy_info: 'Al activar esta opción, otros usuarios verán solo tu próximo cumpleaños (día y mes) en lugar de tu fecha de nacimiento completa.',
    profile_privacy_preview: 'Los demás verán:',
    profile_hobbies: 'Hobbies',
    profile_hobbies_empty: 'Sin hobbies',
    profile_hobbies_other: 'Otro',
    profile_hobbies_custom_placeholder: 'Escribe tu hobby',
    profile_hobbies_add: 'Añadir',
    profile_gift_preferences: 'Preferencias de regalos',
    profile_gift_preferences_empty: 'Sin preferencias',
    profile_gift_preferences_other: 'Otro',
    profile_gift_preferences_custom_placeholder: 'Escribe tu preferencia',
    profile_gift_preferences_add: 'Añadir',
    profile_username: 'Nombre de usuario',
    profile_username_empty: 'Sin nombre de usuario',
    profile_username_add: 'Añadir nombre de usuario',
    profile_username_edit: 'Cambiar nombre de usuario',
    profile_unsaved_changes_title: 'Cambios sin guardar',
    profile_unsaved_changes_message: 'Tienes cambios sin guardar. Por favor, guarda o cancela antes de salir.',
    profile_cancel_button: 'Volver',
    profile_discard_button: 'Descartar cambios',
    create_profile_gift_preferences_title: '¿Qué te gustaría que te regalen?',
    create_profile_gift_preferences_skip: 'Saltar',
    create_profile_hobbies_title: '¿Cuáles son tus hobbies?',
    create_profile_hobbies_selected_label: 'Seleccionados:',
    create_profile_username_title: 'Elige tu nombre de usuario',
    create_profile_username_subtitle: 'Tu nombre de usuario será único y público. Otros usuarios podrán encontrarte con él.',
    create_profile_username_placeholder: 'nombre_usuario',
    create_profile_username_prefix: '@',
    create_profile_username_checking: 'Verificando...',
    create_profile_username_available: 'Disponible',
    create_profile_username_taken: 'No disponible',
    create_profile_username_invalid: 'Solo letras, números y guiones bajos',
    create_profile_username_too_short: 'Mínimo 3 caracteres',
    create_profile_username_too_long: 'Máximo 20 caracteres',
    create_profile_username_skip: 'Saltar (puedes añadirlo después)',
    create_profile_username_continue: 'Guardar y continuar',
    // Hobbies options
    hobby_sports: 'Deportes',
    hobby_reading: 'Lectura',
    hobby_music: 'Música',
    hobby_movies: 'Cine',
    hobby_cooking: 'Cocina',
    hobby_travel: 'Viajes',
    hobby_photography: 'Fotografía',
    hobby_gaming: 'Gaming',
    hobby_art: 'Arte',
    hobby_technology: 'Tecnología',
    // Gift preferences options
    gift_clothes: 'Ropa',
    gift_socks: 'Calcetines',
    gift_books: 'Libros',
    gift_videogames: 'Videojuegos',
    gift_technology: 'Tecnología',
    gift_music: 'Música',
    gift_sports: 'Deportes',
    gift_art: 'Arte',
    gift_cooking: 'Cocina',
    gift_travel: 'Viajes',
    profile_save: 'Guardar',
    profile_saving: 'Guardando...',
    profile_cancel: 'Cancelar',
    profile_change_avatar: 'Cambiar avatar',
    profile_select_avatar: 'Selecciona tu avatar',
    profile_name_placeholder: 'Tu nombre',
    profile_error_empty_name: 'El nombre no puede estar vacío',
    profile_error_no_user_id: 'No se encontró el ID del usuario',
    profile_success: 'Perfil actualizado correctamente',
    profile_error_update: 'No se pudo actualizar el perfil',
    profile_error_privacy: 'No se pudo actualizar la configuración',
    profile_no_user_title: 'No hay usuario',
    profile_no_user_text: 'Por favor inicia sesión o crea un perfil',

    // Drawer / Navigation
    drawer_home: 'Home',
    drawer_profile: 'Perfil',
    drawer_calendar: 'Calendario',
    drawer_settings: 'Ajustes',
    drawer_privacy: 'Política de privacidad',
    drawer_account: 'Cuenta',
    drawer_logout: 'Cerrar sesión',
    drawer_profile_title: 'Mi Perfil',
    drawer_calendar_title: 'Calendario',
    drawer_settings_title: 'Ajustes',
    drawer_privacy_title: 'Política de privacidad',
    drawer_account_title: 'Gestión de cuenta',
    drawer_logout_title: 'Cerrar sesión',

    // In-app notifications
    notification_new_request_title: 'Nueva petición de conexión',
    notification_new_request_message: 'Tienes una nueva solicitud de conexión. Toca para ver.',

    // Account Management
    account_section_title: 'Gestión de cuenta',
    account_logout_title: 'Cerrar sesión',
    account_logout_description: 'Salir de tu cuenta en este dispositivo',
    account_logout_confirm_title: '¿Cerrar sesión?',
    account_logout_confirm_message: '¿Estás seguro de que quieres cerrar sesión?',
    account_logout_confirm_cancel: 'Cancelar',
    account_logout_confirm_button: 'Cerrar sesión',
    account_delete_title: 'Eliminar cuenta',
    account_delete_description: 'Eliminar permanentemente tu cuenta y todos tus datos',
    account_delete_confirm_title: '⚠️ Eliminar cuenta',
    account_delete_confirm_message: 'Esta acción es permanente y no se puede deshacer. Se eliminarán:\n\n• Tu perfil y datos personales\n• Todas tus conexiones\n• Tu cuenta de autenticación\n\n¿Estás completamente seguro?',
    account_delete_confirm_cancel: 'Cancelar',
    account_delete_confirm_button: 'Eliminar cuenta',
    account_delete_final_title: '⚠️ Confirmación final',
    account_delete_final_message: 'Escribe "ELIMINAR" para confirmar que deseas eliminar tu cuenta permanentemente.',
    account_delete_final_cancel: 'Cancelar',
    account_delete_final_button: 'Continuar',
    account_delete_success_title: 'Cuenta eliminada',
    account_delete_success_message: 'Tu cuenta ha sido eliminada permanentemente.',
    account_delete_error_title: 'Error',
    account_delete_error_message: 'No se pudo eliminar la cuenta. ',
    account_delete_error_reauth: 'Por seguridad, necesitas volver a iniciar sesión antes de eliminar tu cuenta.',
    account_delete_error_no_user: 'No hay usuario autenticado',
    account_logout_error: 'No se pudo cerrar sesión',
    account_warning: 'La eliminación de cuenta es permanente y no se puede deshacer',
    account_processing: 'Procesando...',

    // Group Detail
    group_back: 'Volver',
    group_for: 'Para',
    group_birthday: 'Cumpleaños',
    group_about_gift: 'Sobre este regalo',
    group_deadline_label: 'Fecha límite de aceptación',
    group_deadline_dont_pay: '(No pagues antes)',
    group_deadline_passed: 'Fecha límite pasada - No se pueden unir nuevos miembros',
    group_deadline_active: 'Nuevos miembros pueden unirse hasta esta fecha',
    group_total_price: 'Precio Total',
    group_per_person: 'Por Persona',
    group_per_person_estimated: 'Por Persona (Estimado)',
    group_payment_progress: 'Progreso de Pago',
    group_payment_status: '{{paid}}/{{total}} pagado',
    group_members_title: 'Miembros ({{count}})',
    group_member_pending: 'Pendiente...',
    group_member_paid: 'Pagado ✓',
    group_member_not_paid: 'No pagado',
    group_member_admin: '(Admin)',
    group_chat_title: 'Chat del Grupo',
    group_chat_placeholder: 'Escribe un mensaje...',
    group_chat_send: 'Enviar',
    group_close_button: 'Cerrar Grupo',
    group_close_confirm_title: '¿Cerrar grupo?',
    group_close_confirm_message: '¿Estás seguro de que quieres cerrar este grupo? Esta acción no se puede deshacer.',
    group_close_confirm_cancel: 'Cancelar',
    group_close_confirm_button: 'Cerrar',
    group_closed_badge: 'Cerrado',
    group_details_tab: 'Detalles',
    group_members_tab: 'Miembros',

    // Onboarding
    onboarding_skip: 'Saltar',
    onboarding_next: 'Siguiente',
    onboarding_get_started: 'Comenzar',
    onboarding_welcome_title: '¡Bienvenido a RegaloApp!',
    onboarding_welcome_description: 'Nunca más olvides un cumpleaños. Organiza regalos grupales y haz que cada celebración sea especial.',
    onboarding_birthdays_title: 'Recordatorios Inteligentes',
    onboarding_birthdays_description: 'Recibe notificaciones de cumpleaños de tus amigos y familiares. Añade fechas manualmente o conecta con otros usuarios.',
    onboarding_connections_title: 'Conecta con Amigos',
    onboarding_connections_description: 'Invita a tus amigos y familia. Comparte cumpleaños y coordina regalos juntos.',
    onboarding_groups_title: 'Regalos Grupales',
    onboarding_groups_description: 'Organiza regalos en grupo fácilmente. Divide costos, chatea y sorprende a tus seres queridos.',
  },
  en: {
    // Commons
    common_ok: 'OK',
    common_cancel: 'Cancel',
    common_done: 'Done',
    settings_title: 'Settings',
    settings_notifications: 'Notifications',
    settings_notifications_toggle: 'Enable push notifications',
    settings_notifications_helper: 'Birthday reminders and invitations.',
    settings_notifications_system_disabled:
      'Notifications are disabled at system level. Enable them in your device settings.',
    settings_appearance: 'Appearance',
    settings_theme: 'Theme',
    settings_theme_light: 'Light',
    settings_theme_dark: 'Dark',
    settings_language: 'Language',
    settings_language_restart_required: 'Restart the app to see language changes',
    settings_language_change_title: 'Change language',
    settings_language_change_message: 'Do you want to change the app language? You will need to close and reopen the app to apply the changes.',
    settings_language_change_cancel: 'Cancel',
    settings_language_change_confirm: 'Change',
    language_spanish: 'Spanish',
    language_english: 'English',
    language_german: 'German',

    welcome_title: 'Welcome',
    welcome_create_profile: 'Create Profile',
    welcome_login: 'Log In',

    login_title: 'Log In',
    login_subtitle: 'Sign in with your email and password',
    login_email_label: 'Email',
    login_email_placeholder: 'you@email.com',
    login_password_label: 'Password',
    login_password_placeholder: 'Your password',
    login_button: 'Log In',
    login_button_loading: 'Logging in...',
    login_back: 'Back',
    login_forgot_password: 'Forgot your password?',
    login_error_title: 'Error',
    login_error_email_required: 'Please enter your email',
    login_error_password_required: 'Please enter your password',
    login_error_generic: 'Could not log in',

    create_profile_intro_title: 'Let\'s create your profile',
    create_profile_email_title: 'What is your email?',
    create_profile_email_subtitle: 'Create your account to access the app',
    create_profile_email_label: 'Email',
    create_profile_email_placeholder: 'you@email.com',
    create_profile_password_label: 'Password',
    create_profile_password_placeholder: 'Minimum 6 characters',
    create_profile_button: 'Create account',
    create_profile_button_loading: 'Creating profile...',
    create_profile_confirm_password_label: 'Confirm password',
    create_profile_confirm_password_placeholder: 'Repeat your password',
    create_profile_error_title: 'Error',
    create_profile_error_email_required: 'Please enter your email',
    create_profile_error_email_invalid: 'Please enter a valid email address',
    create_profile_error_password_required: 'Please enter a password',
    create_profile_error_password_min_length: 'Password must be at least 6 characters long',
    create_profile_error_password_mismatch: 'Passwords do not match',
    create_profile_error_tempuser_missing: 'Profile data not found. Please start again.',
    create_profile_error_generic: 'There was a problem creating your profile. Please try again.',
    create_profile_created_title: 'Profile created',
    create_profile_created_message: 'Your profile has been created successfully!',

    invite_invalid_id: 'Invalid invitation ID',
    invite_not_found: 'Invitation not found',
    invite_expired: 'This invitation has expired',
    invite_used: 'This invitation has already been used',
    invite_load_error: 'Error loading invitation',
    invite_login_title: 'Log in',
    invite_login_message: 'You need to log in to accept this invitation',
    invite_login_cancel: 'Cancel',
    invite_login_action: 'Log in',
    invite_error_self_connect: 'You cannot connect with yourself',
    invite_connected_title: 'Request sent!',
    invite_connected_message: 'Connection request sent to {{name}}. Wait for their response.',
    invite_connected_button: 'View connections',
    invite_accepting: 'Accepting...',
    invite_accept: 'Accept',
    invite_reject: 'Reject',
    invite_reject_title: 'Reject invitation',
    invite_reject_message: 'Are you sure you want to reject this invitation?',
    invite_reject_cancel: 'Cancel',
    invite_reject_confirm: 'Reject',
    invite_invalid_title: 'Invalid invitation',
    invite_invalid_fallback: 'Could not load invitation',
    invite_loading: 'Loading invitation...',
    invite_login_required_inline: 'You need to log in to accept this invitation',
    invite_expiry_prefix: 'This invitation expires on ',

    // Calendar
    calendar_title: 'Calendar',
    calendar_month_birthdays_title: 'Birthdays in {{month}}',
    calendar_month_birthdays_count_label: 'Birthdays',
    calendar_view_list: 'View list',
    calendar_day_modal_title: 'Birthdays - {{day}} {{month}}',
    calendar_month_modal_title: '{{month}} - {{count}} birthdays',
    calendar_month_modal_empty: 'No birthdays this month',
    calendar_day_item_age_suffix: 'years',
    calendar_profile_modal_title: 'Profile',
    calendar_profile_birthdate_label: 'Date of birth',
    calendar_profile_age_label: 'Age',
    calendar_profile_email_label: 'Email',
    calendar_profile_hobbies_label: 'Hobbies',
    calendar_profile_gift_preferences_label: 'Gift preferences',
    calendar_profile_close_button: 'Close',
    calendar_add_button: 'Add',
    calendar_add_menu_create_connection: 'Create connection',
    calendar_add_menu_add_manually: 'Add manually',
    calendar_manual_modal_title: 'Add birthday manually',
    calendar_manual_name_label: 'Name',
    calendar_manual_name_placeholder: 'Person\'s name',
    calendar_manual_date_label: 'Date of birth',
    calendar_manual_date_placeholder: 'Select a date',
    calendar_manual_submit_button: 'Save birthday',
    calendar_manual_error_title: 'Error',
    calendar_manual_error_name_required: 'Please enter a name',
    calendar_manual_error_generic: 'Could not add the birthday',
    calendar_manual_success_title: 'Success',
    calendar_manual_success_message: "{{name}}'s birthday added successfully",
    calendar_manual_edit_title: 'Edit birthday',
    calendar_manual_edit_submit: 'Save changes',
    calendar_manual_edit_success: 'Birthday updated successfully',
    calendar_manual_delete_confirm_title: 'Delete birthday?',
    calendar_manual_delete_confirm_message: "Are you sure you want to delete {{name}}'s birthday?",
    calendar_manual_delete_button: 'Delete',
    // Days of week (short)
    day_mon: 'Mon',
    day_tue: 'Tue',
    day_wed: 'Wed',
    day_thu: 'Thu',
    day_fri: 'Fri',
    day_sat: 'Sat',
    day_sun: 'Sun',
    // Months
    month_january: 'January',
    month_february: 'February',
    month_march: 'March',
    month_april: 'April',
    month_may: 'May',
    month_june: 'June',
    month_july: 'July',
    month_august: 'August',
    month_september: 'September',
    month_october: 'October',
    month_november: 'November',
    month_december: 'December',

    // Birthday Notification Modal
    birthday_modal_title_single: 'Birthday!',
    birthday_modal_title_multiple: 'Birthdays Today!',
    birthday_modal_loading: 'Loading...',
    birthday_modal_empty: 'No birthdays today',
    birthday_modal_age_text: 'Turns {{age}} years old today 🎂',
    birthday_modal_close_button: 'Close',

    // Connect
    connect_title: 'Connect',
    connect_subtitle: 'Connect with friends to see their birthdays',
    connect_invite_label: 'Invite by username',
    connect_invite_placeholder: 'username',
    connect_invite_button: 'Send Invitation',
    connect_invite_button_loading: 'Sending...',
    connect_invite_error_username_required: 'Please enter a username',
    connect_tab_connections: 'My Connections ({{count}})',
    connect_tab_pending: 'Pending',
    connect_empty_requires_login_title: 'Log in',
    connect_empty_requires_login_text: 'Log in to connect with friends',
    connect_empty_connections_title: 'You have no connections yet',
    connect_empty_connections_subtitle: 'Send an invitation to connect with friends',
    connect_empty_pending_title: 'You have no pending invitations',
    connect_accept_invitation_success_title: 'Connected!',
    connect_accept_invitation_success_message:
      'You are now connected with {{name}}. Their birthdays will appear in your calendar.',
    connect_accept_invitation_error_title: 'Error',
    connect_accept_invitation_error_message: 'Could not accept the invitation',
    connect_reject_invitation_error_title: 'Error',
    connect_reject_invitation_error_message: 'Could not reject the invitation',
    connect_disconnect_title: 'Disconnect contact',
    connect_disconnect_message:
      'If you disconnect from {{name}}, you will no longer see their birthdays in your calendar.',
    connect_disconnect_confirm: 'Disconnect',
    connect_disconnect_cancel: 'Cancel',
    connect_disconnect_error_title: 'Error',
    connect_disconnect_error_message: 'Could not disconnect',

    // Profile
    profile_title: 'My Profile',
    profile_edit: 'Edit',
    profile_name: 'Name',
    profile_avatar: 'Avatar',
    profile_email: 'Email',
    profile_birthdate: 'Date of birth',
    profile_privacy_hide_age: 'Hide age',
    profile_privacy_info: 'When enabled, other users will see only your next birthday (day and month) instead of your full date of birth.',
    profile_privacy_preview: 'Others will see:',
    profile_hobbies: 'Hobbies',
    profile_hobbies_empty: 'No hobbies',
    profile_hobbies_other: 'Other',
    profile_hobbies_custom_placeholder: 'Write your hobby',
    profile_hobbies_add: 'Add',
    profile_gift_preferences: 'Gift preferences',
    profile_gift_preferences_empty: 'No preferences',
    profile_gift_preferences_other: 'Other',
    profile_gift_preferences_custom_placeholder: 'Write your preference',
    profile_gift_preferences_add: 'Add',
    profile_username: 'Username',
    profile_username_empty: 'No username',
    profile_username_add: 'Add username',
    profile_username_edit: 'Change username',
    profile_unsaved_changes_title: 'Unsaved changes',
    profile_unsaved_changes_message: 'You have unsaved changes. Please save or cancel before leaving.',
    profile_cancel_button: 'Go back',
    profile_discard_button: 'Discard changes',
    create_profile_gift_preferences_title: 'What would you like to receive as gifts?',
    create_profile_gift_preferences_skip: 'Skip',
    create_profile_hobbies_title: 'What are your hobbies?',
    create_profile_hobbies_selected_label: 'Selected:',
    create_profile_username_title: 'Choose your username',
    create_profile_username_subtitle: 'Your username will be unique and public. Other users can find you with it.',
    create_profile_username_placeholder: 'username',
    create_profile_username_prefix: '@',
    create_profile_username_checking: 'Checking...',
    create_profile_username_available: 'Available',
    create_profile_username_taken: 'Not available',
    create_profile_username_invalid: 'Only letters, numbers and underscores',
    create_profile_username_too_short: 'Minimum 3 characters',
    create_profile_username_too_long: 'Maximum 20 characters',
    create_profile_username_skip: 'Skip (you can add it later)',
    create_profile_username_continue: 'Save and continue',
    // Hobbies options
    hobby_sports: 'Sports',
    hobby_reading: 'Reading',
    hobby_music: 'Music',
    hobby_movies: 'Movies',
    hobby_cooking: 'Cooking',
    hobby_travel: 'Travel',
    hobby_photography: 'Photography',
    hobby_gaming: 'Gaming',
    hobby_art: 'Art',
    hobby_technology: 'Technology',
    // Gift preferences options
    gift_clothes: 'Clothes',
    gift_socks: 'Socks',
    gift_books: 'Books',
    gift_videogames: 'Video games',
    gift_technology: 'Technology',
    gift_music: 'Music',
    gift_sports: 'Sports',
    gift_art: 'Art',
    gift_cooking: 'Cooking',
    gift_travel: 'Travel',
    profile_save: 'Save',
    profile_saving: 'Saving...',
    profile_cancel: 'Cancel',
    profile_change_avatar: 'Change avatar',
    profile_select_avatar: 'Select your avatar',
    profile_name_placeholder: 'Your name',
    profile_error_empty_name: 'Name cannot be empty',
    profile_error_no_user_id: 'User ID not found',
    profile_success: 'Profile updated successfully',
    profile_error_update: 'Could not update profile',
    profile_error_privacy: 'Could not update settings',
    profile_no_user_title: 'No user',
    profile_no_user_text: 'Please log in or create a profile',

    // Drawer / Navigation
    drawer_home: 'Home',
    drawer_profile: 'Profile',
    drawer_calendar: 'Calendar',
    drawer_settings: 'Settings',
    drawer_privacy: 'Privacy Policy',
    drawer_account: 'Account',
    drawer_logout: 'Logout',
    drawer_profile_title: 'My Profile',
    drawer_calendar_title: 'Calendar',
    drawer_settings_title: 'Settings',
    drawer_privacy_title: 'Privacy Policy',
    drawer_account_title: 'Account Management',
    drawer_logout_title: 'Logout',

    // In-app notifications
    notification_new_request_title: 'New connection request',
    notification_new_request_message: 'You have a new connection request. Tap to view.',

    // Account Management
    account_section_title: 'Account Management',
    account_logout_title: 'Logout',
    account_logout_description: 'Sign out from your account on this device',
    account_logout_confirm_title: 'Logout?',
    account_logout_confirm_message: 'Are you sure you want to logout?',
    account_logout_confirm_cancel: 'Cancel',
    account_logout_confirm_button: 'Logout',
    account_delete_title: 'Delete account',
    account_delete_description: 'Permanently delete your account and all your data',
    account_delete_confirm_title: '⚠️ Delete account',
    account_delete_confirm_message: 'This action is permanent and cannot be undone. The following will be deleted:\n\n• Your profile and personal data\n• All your connections\n• Your authentication account\n\nAre you completely sure?',
    account_delete_confirm_cancel: 'Cancel',
    account_delete_confirm_button: 'Delete account',
    account_delete_final_title: '⚠️ Final confirmation',
    account_delete_final_message: 'Type "DELETE" to confirm that you want to permanently delete your account.',
    account_delete_final_cancel: 'Cancel',
    account_delete_final_button: 'Continue',
    account_delete_success_title: 'Account deleted',
    account_delete_success_message: 'Your account has been permanently deleted.',
    account_delete_error_title: 'Error',
    account_delete_error_message: 'Could not delete account. ',
    account_delete_error_reauth: 'For security reasons, you need to login again before deleting your account.',
    account_delete_error_no_user: 'No authenticated user',
    account_logout_error: 'Could not logout',
    account_warning: 'Account deletion is permanent and cannot be undone',
    account_processing: 'Processing...',

    // Group Detail
    group_back: 'Back',
    group_for: 'For',
    group_birthday: 'Birthday',
    group_about_gift: 'About this gift',
    group_deadline_label: 'Member Acceptance Deadline',
    group_deadline_dont_pay: '(Don\'t pay before)',
    group_deadline_passed: 'Deadline passed - No new members can join',
    group_deadline_active: 'New members can join until this date',
    group_total_price: 'Total Price',
    group_per_person: 'Per Person',
    group_per_person_estimated: 'Per Person (Estimated)',
    group_payment_progress: 'Payment Progress',
    group_payment_status: '{{paid}}/{{total}} paid',
    group_members_title: 'Members ({{count}})',
    group_member_pending: 'Pending...',
    group_member_paid: 'Paid ✓',
    group_member_not_paid: 'Not paid',
    group_member_admin: '(Admin)',
    group_chat_title: 'Group Chat',
    group_chat_placeholder: 'Type a message...',
    group_chat_send: 'Send',
    group_close_button: 'Close Group',
    group_close_confirm_title: 'Close group?',
    group_close_confirm_message: 'Are you sure you want to close this group? This action cannot be undone.',
    group_close_confirm_cancel: 'Cancel',
    group_close_confirm_button: 'Close',
    group_closed_badge: 'Closed',
    group_details_tab: 'Details',
    group_members_tab: 'Members',

    // Onboarding
    onboarding_skip: 'Skip',
    onboarding_next: 'Next',
    onboarding_get_started: 'Get Started',
    onboarding_welcome_title: 'Welcome to RegaloApp!',
    onboarding_welcome_description: 'Never forget a birthday again. Organize group gifts and make every celebration special.',
    onboarding_birthdays_title: 'Smart Reminders',
    onboarding_birthdays_description: 'Get birthday notifications for your friends and family. Add dates manually or connect with other users.',
    onboarding_connections_title: 'Connect with Friends',
    onboarding_connections_description: 'Invite your friends and family. Share birthdays and coordinate gifts together.',
    onboarding_groups_title: 'Group Gifts',
    onboarding_groups_description: 'Organize group gifts easily. Split costs, chat, and surprise your loved ones.',
  },
  de: {
    // Commons
    common_ok: 'OK',
    common_cancel: 'Abbrechen',
    common_done: 'Fertig',
    settings_title: 'Einstellungen',
    settings_notifications: 'Benachrichtigungen',
    settings_notifications_toggle: 'Push-Benachrichtigungen aktivieren',
    settings_notifications_helper: 'Geburtstagserinnerungen und Einladungen.',
    settings_notifications_system_disabled:
      'Benachrichtigungen sind systemweit deaktiviert. Aktiviere sie in den Geräteeinstellungen.',
    settings_appearance: 'Aussehen',
    settings_theme: 'Design',
    settings_theme_light: 'Hell',
    settings_theme_dark: 'Dunkel',
    settings_language: 'Sprache',
    settings_language_restart_required: 'Starte die App neu, um Sprachänderungen zu sehen',
    settings_language_change_title: 'Sprache ändern',
    settings_language_change_message: 'Möchtest du die App-Sprache ändern? Du musst die App schließen und neu öffnen, um die Änderungen anzuwenden.',
    settings_language_change_cancel: 'Abbrechen',
    settings_language_change_confirm: 'Ändern',
    language_spanish: 'Spanisch',
    language_english: 'Englisch',
    language_german: 'Deutsch',

    welcome_title: 'Willkommen',
    welcome_create_profile: 'Profil erstellen',
    welcome_login: 'Anmelden',

    login_title: 'Anmelden',
    login_subtitle: 'Melde dich mit E-Mail und Passwort an',
    login_email_label: 'E-Mail',
    login_email_placeholder: 'deine@email.de',
    login_password_label: 'Passwort',
    login_password_placeholder: 'Dein Passwort',
    login_button: 'Anmelden',
    login_button_loading: 'Wird angemeldet...',
    login_back: 'Zurück',
    login_forgot_password: 'Passwort vergessen?',
    login_error_title: 'Fehler',
    login_error_email_required: 'Bitte gib deine E-Mail ein',
    login_error_password_required: 'Bitte gib dein Passwort ein',
    login_error_generic: 'Anmeldung nicht möglich',

    create_profile_intro_title: 'Lass uns dein Profil erstellen',
    create_profile_email_title: 'Wie lautet deine E-Mail?',
    create_profile_email_subtitle: 'Erstelle dein Konto, um die App zu nutzen',
    create_profile_email_label: 'E-Mail',
    create_profile_email_placeholder: 'deine@email.de',
    create_profile_password_label: 'Passwort',
    create_profile_password_placeholder: 'Mindestens 6 Zeichen',
    create_profile_button: 'Konto erstellen',
    create_profile_button_loading: 'Profil wird erstellt...',
    create_profile_confirm_password_label: 'Passwort bestätigen',
    create_profile_confirm_password_placeholder: 'Wiederhole dein Passwort',
    create_profile_error_title: 'Fehler',
    create_profile_error_email_required: 'Bitte gib deine E-Mail ein',
    create_profile_error_email_invalid: 'Bitte gib eine gültige E-Mail-Adresse ein',
    create_profile_error_password_required: 'Bitte gib ein Passwort ein',
    create_profile_error_password_min_length: 'Das Passwort muss mindestens 6 Zeichen lang sein',
    create_profile_error_password_mismatch: 'Passwörter stimmen nicht überein',
    create_profile_error_tempuser_missing: 'Profildaten wurden nicht gefunden. Bitte starte erneut.',
    create_profile_error_generic: 'Beim Erstellen deines Profils ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    create_profile_created_title: 'Profil erstellt',
    create_profile_created_message: 'Dein Profil wurde erfolgreich erstellt!',

    invite_invalid_id: 'Ungültige Einladungs-ID',
    invite_not_found: 'Einladung nicht gefunden',
    invite_expired: 'Diese Einladung ist abgelaufen',
    invite_used: 'Diese Einladung wurde bereits verwendet',
    invite_load_error: 'Fehler beim Laden der Einladung',
    invite_login_title: 'Anmelden',
    invite_login_message: 'Du musst dich anmelden, um diese Einladung zu akzeptieren',
    invite_login_cancel: 'Abbrechen',
    invite_login_action: 'Anmelden',
    invite_error_self_connect: 'Du kannst dich nicht mit dir selbst verbinden',
    invite_connected_title: 'Anfrage gesendet!',
    invite_connected_message: 'Verbindungsanfrage an {{name}} gesendet. Warte auf die Antwort.',
    invite_connected_button: 'Verbindungen anzeigen',
    invite_accepting: 'Wird akzeptiert...',
    invite_accept: 'Akzeptieren',
    invite_reject: 'Ablehnen',
    invite_reject_title: 'Einladung ablehnen',
    invite_reject_message: 'Bist du sicher, dass du diese Einladung ablehnen möchtest?',
    invite_reject_cancel: 'Abbrechen',
    invite_reject_confirm: 'Ablehnen',
    invite_invalid_title: 'Ungültige Einladung',
    invite_invalid_fallback: 'Einladung konnte nicht geladen werden',
    invite_loading: 'Einladung wird geladen...',
    invite_login_required_inline: 'Du musst dich anmelden, um diese Einladung zu akzeptieren',
    invite_expiry_prefix: 'Diese Einladung läuft ab am ',

    // Calendar
    calendar_title: 'Kalender',
    calendar_month_birthdays_title: 'Geburtstage im {{month}}',
    calendar_month_birthdays_count_label: 'Geburtstage',
    calendar_view_list: 'Liste anzeigen',
    calendar_day_modal_title: 'Geburtstage - {{day}}. {{month}}',
    calendar_month_modal_title: '{{month}} - {{count}} Geburtstage',
    calendar_month_modal_empty: 'In diesem Monat gibt es keine Geburtstage',
    calendar_day_item_age_suffix: 'Jahre',
    calendar_profile_modal_title: 'Profil',
    calendar_profile_birthdate_label: 'Geburtsdatum',
    calendar_profile_age_label: 'Alter',
    calendar_profile_email_label: 'E-Mail',
    calendar_profile_hobbies_label: 'Hobbys',
    calendar_profile_gift_preferences_label: 'Geschenkpräferenzen',
    calendar_profile_close_button: 'Schließen',
    calendar_add_button: 'Hinzufügen',
    calendar_add_menu_create_connection: 'Verbindung erstellen',
    calendar_add_menu_add_manually: 'Manuell hinzufügen',
    calendar_manual_modal_title: 'Geburtstag manuell hinzufügen',
    calendar_manual_name_label: 'Name',
    calendar_manual_name_placeholder: 'Name der Person',
    calendar_manual_date_label: 'Geburtsdatum',
    calendar_manual_date_placeholder: 'Datum auswählen',
    calendar_manual_submit_button: 'Geburtstag speichern',
    calendar_manual_error_title: 'Fehler',
    calendar_manual_error_name_required: 'Bitte gib einen Namen ein',
    calendar_manual_error_generic: 'Geburtstag konnte nicht hinzugefügt werden',
    calendar_manual_success_title: 'Erfolg',
    calendar_manual_success_message: 'Geburtstag von {{name}} wurde erfolgreich hinzugefügt',
    calendar_manual_edit_title: 'Geburtstag bearbeiten',
    calendar_manual_edit_submit: 'Änderungen speichern',
    calendar_manual_edit_success: 'Geburtstag erfolgreich aktualisiert',
    calendar_manual_delete_confirm_title: 'Geburtstag löschen?',
    calendar_manual_delete_confirm_message: 'Bist du sicher, dass du den Geburtstag von {{name}} löschen möchtest?',
    calendar_manual_delete_button: 'Löschen',
    // Days of week (short)
    day_mon: 'Mo',
    day_tue: 'Di',
    day_wed: 'Mi',
    day_thu: 'Do',
    day_fri: 'Fr',
    day_sat: 'Sa',
    day_sun: 'So',
    // Months
    month_january: 'Januar',
    month_february: 'Februar',
    month_march: 'März',
    month_april: 'April',
    month_may: 'Mai',
    month_june: 'Juni',
    month_july: 'Juli',
    month_august: 'August',
    month_september: 'September',
    month_october: 'Oktober',
    month_november: 'November',
    month_december: 'Dezember',

    // Birthday Notification Modal
    birthday_modal_title_single: 'Geburtstag!',
    birthday_modal_title_multiple: 'Geburtstage heute!',
    birthday_modal_loading: 'Laden...',
    birthday_modal_empty: 'Heute keine Geburtstage',
    birthday_modal_age_text: 'Wird heute {{age}} Jahre alt 🎂',
    birthday_modal_close_button: 'Schließen',

    // Connect
    connect_title: 'Verbinden',
    connect_subtitle: 'Verbinde dich mit Freunden, um ihre Geburtstage zu sehen',
    connect_invite_label: 'Per Benutzername einladen',
    connect_invite_placeholder: 'benutzername',
    connect_invite_button: 'Einladung senden',
    connect_invite_button_loading: 'Wird gesendet...',
    connect_invite_error_username_required: 'Bitte gib einen Benutzernamen ein',
    connect_tab_connections: 'Meine Verbindungen ({{count}})',
    connect_tab_pending: 'Ausstehend',
    connect_empty_requires_login_title: 'Anmelden',
    connect_empty_requires_login_text: 'Melde dich an, um dich mit Freunden zu verbinden',
    connect_empty_connections_title: 'Du hast noch keine Verbindungen',
    connect_empty_connections_subtitle: 'Sende eine Einladung, um dich mit Freunden zu verbinden',
    connect_empty_pending_title: 'Du hast keine ausstehenden Einladungen',
    connect_accept_invitation_success_title: 'Verbunden!',
    connect_accept_invitation_success_message:
      'Du bist jetzt mit {{name}} verbunden. Seine Geburtstage erscheinen in deinem Kalender.',
    connect_accept_invitation_error_title: 'Fehler',
    connect_accept_invitation_error_message: 'Einladung konnte nicht akzeptiert werden',
    connect_reject_invitation_error_title: 'Fehler',
    connect_reject_invitation_error_message: 'Einladung konnte nicht abgelehnt werden',
    connect_disconnect_title: 'Kontakt trennen',
    connect_disconnect_message:
      'Wenn du die Verbindung zu {{name}} trennst, werden seine Geburtstage nicht mehr in deinem Kalender angezeigt.',
    connect_disconnect_confirm: 'Trennen',
    connect_disconnect_cancel: 'Abbrechen',
    connect_disconnect_error_title: 'Fehler',
    connect_disconnect_error_message: 'Trennen nicht möglich',

    // Profile
    profile_title: 'Mein Profil',
    profile_edit: 'Bearbeiten',
    profile_name: 'Name',
    profile_avatar: 'Avatar',
    profile_email: 'E-Mail',
    profile_birthdate: 'Geburtsdatum',
    profile_privacy_hide_age: 'Alter verbergen',
    profile_privacy_info: 'Wenn aktiviert, sehen andere Benutzer nur deinen nächsten Geburtstag (Tag und Monat) anstelle deines vollständigen Geburtsdatums.',
    profile_privacy_preview: 'Andere werden sehen:',
    profile_hobbies: 'Hobbys',
    profile_hobbies_empty: 'Keine Hobbys',
    profile_hobbies_other: 'Andere',
    profile_hobbies_custom_placeholder: 'Schreibe dein Hobby',
    profile_hobbies_add: 'Hinzufügen',
    profile_gift_preferences: 'Geschenkpräferenzen',
    profile_gift_preferences_empty: 'Keine Präferenzen',
    profile_gift_preferences_other: 'Andere',
    profile_gift_preferences_custom_placeholder: 'Schreibe deine Präferenz',
    profile_gift_preferences_add: 'Hinzufügen',
    profile_username: 'Benutzername',
    profile_username_empty: 'Kein Benutzername',
    profile_username_add: 'Benutzername hinzufügen',
    profile_username_edit: 'Benutzername ändern',
    profile_unsaved_changes_title: 'Nicht gespeicherte Änderungen',
    profile_unsaved_changes_message: 'Du hast nicht gespeicherte Änderungen. Bitte speichere oder brich ab, bevor du die Seite verlässt.',
    profile_cancel_button: 'Zurück',
    profile_discard_button: 'Änderungen verwerfen',
    create_profile_gift_preferences_title: 'Was würdest du gerne geschenkt bekommen?',
    create_profile_gift_preferences_skip: 'Überspringen',
    create_profile_hobbies_title: 'Was sind deine Hobbys?',
    create_profile_hobbies_selected_label: 'Ausgewählt:',
    create_profile_username_title: 'Wähle deinen Benutzernamen',
    create_profile_username_subtitle: 'Dein Benutzername wird einzigartig und öffentlich sein. Andere Benutzer können dich damit finden.',
    create_profile_username_placeholder: 'benutzername',
    create_profile_username_prefix: '@',
    create_profile_username_checking: 'Überprüfen...',
    create_profile_username_available: 'Verfügbar',
    create_profile_username_taken: 'Nicht verfügbar',
    create_profile_username_invalid: 'Nur Buchstaben, Zahlen und Unterstriche',
    create_profile_username_too_short: 'Mindestens 3 Zeichen',
    create_profile_username_too_long: 'Maximal 20 Zeichen',
    create_profile_username_skip: 'Überspringen (du kannst es später hinzufügen)',
    create_profile_username_continue: 'Speichern und fortfahren',
    // Hobbies options
    hobby_sports: 'Sport',
    hobby_reading: 'Lesen',
    hobby_music: 'Musik',
    hobby_movies: 'Kino',
    hobby_cooking: 'Kochen',
    hobby_travel: 'Reisen',
    hobby_photography: 'Fotografie',
    hobby_gaming: 'Gaming',
    hobby_art: 'Kunst',
    hobby_technology: 'Technologie',
    // Gift preferences options
    gift_clothes: 'Kleidung',
    gift_socks: 'Socken',
    gift_books: 'Bücher',
    gift_videogames: 'Videospiele',
    gift_technology: 'Technologie',
    gift_music: 'Musik',
    gift_sports: 'Sport',
    gift_art: 'Kunst',
    gift_cooking: 'Kochen',
    gift_travel: 'Reisen',
    profile_save: 'Speichern',
    profile_saving: 'Speichern...',
    profile_cancel: 'Abbrechen',
    profile_change_avatar: 'Avatar ändern',
    profile_select_avatar: 'Wähle deinen Avatar',
    profile_name_placeholder: 'Dein Name',
    profile_error_empty_name: 'Name darf nicht leer sein',
    profile_error_no_user_id: 'Benutzer-ID nicht gefunden',
    profile_success: 'Profil erfolgreich aktualisiert',
    profile_error_update: 'Profil konnte nicht aktualisiert werden',
    profile_error_privacy: 'Einstellungen konnten nicht aktualisiert werden',
    profile_no_user_title: 'Kein Benutzer',
    profile_no_user_text: 'Bitte melde dich an oder erstelle ein Profil',

    // Drawer / Navigation
    drawer_home: 'Home',
    drawer_profile: 'Profil',
    drawer_calendar: 'Kalender',
    drawer_settings: 'Einstellungen',
    drawer_privacy: 'Datenschutzerklärung',
    drawer_account: 'Konto',
    drawer_logout: 'Abmelden',
    drawer_profile_title: 'Mein Profil',
    drawer_calendar_title: 'Kalender',
    drawer_settings_title: 'Einstellungen',
    drawer_privacy_title: 'Datenschutzerklärung',
    drawer_account_title: 'Kontoverwaltung',
    drawer_logout_title: 'Abmelden',

    // In-app notifications
    notification_new_request_title: 'Neue Verbindungsanfrage',
    notification_new_request_message: 'Du hast eine neue Verbindungsanfrage. Tippe zum Anzeigen.',

    // Account Management
    account_section_title: 'Kontoverwaltung',
    account_logout_title: 'Abmelden',
    account_logout_description: 'Von deinem Konto auf diesem Gerät abmelden',
    account_logout_confirm_title: 'Abmelden?',
    account_logout_confirm_message: 'Bist du sicher, dass du dich abmelden möchtest?',
    account_logout_confirm_cancel: 'Abbrechen',
    account_logout_confirm_button: 'Abmelden',
    account_delete_title: 'Konto löschen',
    account_delete_description: 'Dein Konto und alle deine Daten dauerhaft löschen',
    account_delete_confirm_title: '⚠️ Konto löschen',
    account_delete_confirm_message: 'Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden. Folgendes wird gelöscht:\n\n• Dein Profil und persönliche Daten\n• Alle deine Verbindungen\n• Dein Authentifizierungskonto\n\nBist du dir absolut sicher?',
    account_delete_confirm_cancel: 'Abbrechen',
    account_delete_confirm_button: 'Konto löschen',
    account_delete_final_title: '⚠️ Endgültige Bestätigung',
    account_delete_final_message: 'Gib "LÖSCHEN" ein, um zu bestätigen, dass du dein Konto dauerhaft löschen möchtest.',
    account_delete_final_cancel: 'Abbrechen',
    account_delete_final_button: 'Fortfahren',
    account_delete_success_title: 'Konto gelöscht',
    account_delete_success_message: 'Dein Konto wurde dauerhaft gelöscht.',
    account_delete_error_title: 'Fehler',
    account_delete_error_message: 'Konto konnte nicht gelöscht werden. ',
    account_delete_error_reauth: 'Aus Sicherheitsgründen musst du dich erneut anmelden, bevor du dein Konto löschen kannst.',
    account_delete_error_no_user: 'Kein authentifizierter Benutzer',
    account_logout_error: 'Abmeldung fehlgeschlagen',
    account_warning: 'Die Kontolöschung ist dauerhaft und kann nicht rückgängig gemacht werden',
    account_processing: 'Verarbeitung...',

    // Group Detail
    group_back: 'Zurück',
    group_for: 'Für',
    group_birthday: 'Geburtstag',
    group_about_gift: 'Über dieses Geschenk',
    group_deadline_label: 'Frist für Mitgliederakzeptanz',
    group_deadline_dont_pay: '(Nicht vorher bezahlen)',
    group_deadline_passed: 'Frist abgelaufen - Keine neuen Mitglieder können beitreten',
    group_deadline_active: 'Neue Mitglieder können bis zu diesem Datum beitreten',
    group_total_price: 'Gesamtpreis',
    group_per_person: 'Pro Person',
    group_per_person_estimated: 'Pro Person (Geschätzt)',
    group_payment_progress: 'Zahlungsfortschritt',
    group_payment_status: '{{paid}}/{{total}} bezahlt',
    group_members_title: 'Mitglieder ({{count}})',
    group_member_pending: 'Ausstehend...',
    group_member_paid: 'Bezahlt ✓',
    group_member_not_paid: 'Nicht bezahlt',
    group_member_admin: '(Admin)',
    group_chat_title: 'Gruppen-Chat',
    group_chat_placeholder: 'Nachricht eingeben...',
    group_chat_send: 'Senden',
    group_close_button: 'Gruppe schließen',
    group_close_confirm_title: 'Gruppe schließen?',
    group_close_confirm_message: 'Bist du sicher, dass du diese Gruppe schließen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
    group_close_confirm_cancel: 'Abbrechen',
    group_close_confirm_button: 'Schließen',
    group_closed_badge: 'Geschlossen',
    group_details_tab: 'Details',
    group_members_tab: 'Mitglieder',

    // Onboarding
    onboarding_skip: 'Überspringen',
    onboarding_next: 'Weiter',
    onboarding_get_started: 'Loslegen',
    onboarding_welcome_title: 'Willkommen bei RegaloApp!',
    onboarding_welcome_description: 'Vergiss nie wieder einen Geburtstag. Organisiere Gruppengeschenke und mache jede Feier besonders.',
    onboarding_birthdays_title: 'Intelligente Erinnerungen',
    onboarding_birthdays_description: 'Erhalte Geburtstagserinnerungen für deine Freunde und Familie. Füge Daten manuell hinzu oder verbinde dich mit anderen Nutzern.',
    onboarding_connections_title: 'Mit Freunden verbinden',
    onboarding_connections_description: 'Lade deine Freunde und Familie ein. Teile Geburtstage und koordiniere Geschenke zusammen.',
    onboarding_groups_title: 'Gruppengeschenke',
    onboarding_groups_description: 'Organisiere Gruppengeschenke einfach. Teile Kosten, chatte und überrasche deine Liebsten.',
  },
} as const;

export type TranslationKey = keyof typeof translations['es'];

interface LanguageContextValue {
  lang: Lang;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
  setLanguage: (lang: Lang) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function resolveAppLanguage(locale: string | null | undefined): Lang {
  if (!locale) return 'en';
  const code = locale.split('-')[0].toLowerCase();
  if (code === 'es') return 'es';
  if (code === 'de') return 'de';
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // Load language ONCE at startup - this runs only on app initialization
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (!mounted) return;

        if (stored === 'es' || stored === 'en' || stored === 'de') {
          setLang(stored);
          console.log(`✅ Language loaded from storage: ${stored}`);
        } else {
          // Detect device locale only on first launch
          let deviceLocale: string | null = null;
          try {
            // Get device locales using expo-localization
            const locales = Localization.getLocales();
            if (locales && locales.length > 0) {
              deviceLocale = locales[0].languageCode || null;
              console.log(`📱 Device locale detected: ${deviceLocale}`);
            }
          } catch (error) {
            console.warn('⚠️ Error detecting device locale, falling back to en:', error);
          }
          const detectedLang = resolveAppLanguage(deviceLocale);
          if (mounted) {
            setLang(detectedLang);
            // Save detected language
            await AsyncStorage.setItem(STORAGE_KEY, detectedLang);
            console.log(`✅ Language auto-detected and saved: ${detectedLang}`);
          }
        }
      } catch (error) {
        console.error('❌ Error loading language from storage:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Sync language with Firestore when user logs in
  useEffect(() => {
    if (!user?.id) return;

    const syncLanguageWithFirestore = async () => {
      try {
        if (user.preferredLanguage) {
          // User has a preferred language in Firestore - use it
          const firestoreLang = user.preferredLanguage;
          if (firestoreLang === 'es' || firestoreLang === 'en' || firestoreLang === 'de') {
            const currentLang = await AsyncStorage.getItem(STORAGE_KEY);

            // Only update if different from current
            if (currentLang !== firestoreLang) {
              await AsyncStorage.setItem(STORAGE_KEY, firestoreLang);
              setLang(firestoreLang);
              console.log(`✅ Language synced from Firestore: ${firestoreLang}`);
            }
          }
        } else {
          // User doesn't have a preferred language - save current language to Firestore
          const currentLang = await AsyncStorage.getItem(STORAGE_KEY);
          if (currentLang === 'es' || currentLang === 'en' || currentLang === 'de') {
            await db.getAdapter().updateUser(user.id!, {
              preferredLanguage: currentLang as 'es' | 'en' | 'de',
            });
            console.log(`✅ Initial language saved to Firestore: ${currentLang}`);
          }
        }
      } catch (error) {
        console.error('❌ Error syncing language with Firestore:', error);
      }
    };

    syncLanguageWithFirestore();
  }, [user?.id, user?.preferredLanguage]);

  // When user changes language, save to storage AND Firestore
  // DO NOT update state - language will change on next app launch
  const setLanguage = async (next: Lang) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);

      // Also save to Firestore if user is logged in
      if (user?.id) {
        await db.getAdapter().updateUser(user.id, {
          preferredLanguage: next,
        });
        console.log(`✅ Language preference saved to Firestore: ${next}`);
      }
      // DO NOT call setLang(next) here - we want language to change only on app restart
    } catch (error) {
      console.error('❌ Error saving language:', error);
    }
  };

  // Translation function with variable interpolation support
  const t = (key: TranslationKey, vars?: Record<string, string>): string => {
    let text: string = translations[lang][key] ?? translations.en[key];

    // Replace variables like {{paid}} with actual values
    if (vars) {
      Object.keys(vars).forEach((varKey) => {
        text = text.replace(new RegExp(`{{${varKey}}}`, 'g'), vars[varKey]);
      });
    }

    return text;
  };

  // Show a brief loading indicator while loading language (only on first app launch)
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C1C' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
