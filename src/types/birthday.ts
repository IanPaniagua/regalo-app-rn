// Tipos para el sistema de cumpleaños

export interface ManualBirthdayEntry {
  id: string;              // UUID generado localmente
  name: string;
  birthdate: Date;
  avatar: string;          // Emoji fijo, ej: '🎂'
  isManual: true;          // Flag para distinguirlo de usuarios reales
  userId?: string;         // ID del usuario real si ya se vinculó
  email?: string;          // Email si lo conoces (para vincular después)
  phone?: string;          // Teléfono si lo conoces (para vincular después)
}

// Tipo unión para representar cualquier entrada en el calendario
export type BirthdayEntry = {
  id: string;
  name: string;
  avatar: string;
  birthdate: Date;
  hobbies: string[];
  email: string;
  giftPreferences?: string[];
  isManual?: false;
} | ManualBirthdayEntry;
