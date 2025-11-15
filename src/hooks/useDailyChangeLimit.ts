import { useState } from 'react';
import { Alert } from 'react-native';

interface ChangeLimitData {
  count: number;
  lastChangeDate: Date;
}

interface UseDailyChangeLimitProps {
  currentCount?: number;
  lastChangeDate?: Date;
  maxChanges?: number;
  fieldName: string; // Nombre del campo para mensajes personalizados
}

export const useDailyChangeLimit = ({
  currentCount = 0,
  lastChangeDate,
  maxChanges = 3,
  fieldName,
}: UseDailyChangeLimitProps) => {
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const canMakeChange = (): boolean => {
    const today = new Date();

    // Si no hay fecha de último cambio o es de otro día, permitir cambio
    if (!lastChangeDate || !isSameDay(new Date(lastChangeDate), today)) {
      return true;
    }

    // Si es el mismo día, verificar el contador
    return currentCount < maxChanges;
  };

  const getNewChangeLimitData = (): ChangeLimitData => {
    const today = new Date();
    
    // Si es un nuevo día, resetear contador
    if (!lastChangeDate || !isSameDay(new Date(lastChangeDate), today)) {
      return {
        count: 1,
        lastChangeDate: today,
      };
    }

    // Si es el mismo día, incrementar contador
    return {
      count: currentCount + 1,
      lastChangeDate: today,
    };
  };

  const checkAndNotify = (): boolean => {
    if (!canMakeChange()) {
      Alert.alert(
        'Límite alcanzado',
        `Has alcanzado el límite de ${maxChanges} cambios diarios para ${fieldName}. Podrás hacer más cambios mañana.`,
        [{ text: 'Entendido' }]
      );
      return false;
    }

    return true;
  };

  const notifyRemainingChanges = (newCount: number) => {
    const remaining = maxChanges - newCount;
    
    if (remaining === 1) {
      Alert.alert(
        'Aviso',
        `Te queda 1 cambio más para hoy en ${fieldName}.`,
        [{ text: 'OK' }]
      );
    } else if (remaining === 0) {
      Alert.alert(
        'Límite alcanzado',
        `Has usado todos tus cambios de hoy para ${fieldName}. Podrás hacer más cambios mañana.`,
        [{ text: 'OK' }]
      );
    }
  };

  return {
    canMakeChange,
    checkAndNotify,
    getNewChangeLimitData,
    notifyRemainingChanges,
  };
};
