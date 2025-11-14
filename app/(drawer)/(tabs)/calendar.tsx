import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_PADDING = 32; // padding horizontal del scroll (16 * 2)
const GRID_PADDING = 12; // padding del grid (6 * 2)
const GAP = 6;
const DAY_SIZE = (SCREEN_WIDTH - CALENDAR_PADDING - GRID_PADDING - (GAP * 6)) / 7;

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Datos de ejemplo: iconos en días específicos (simulando cumpleaños)
const MOCK_BIRTHDAYS: { [key: string]: string[] } = {
  '15': ['👤', '🎂'], // Día 15: 2 cumpleaños
  '23': ['👤'], // Día 23: 1 cumpleaño
};

export default function CalendarTabScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    // Convertir domingo (0) a 7 para que lunes sea 1
    return firstDay === 0 ? 7 : firstDay;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const isCurrentMonth = 
      today.getMonth() === currentDate.getMonth() && 
      today.getFullYear() === currentDate.getFullYear();

    const days = [];

    // Espacios vacíos antes del primer día
    for (let i = 1; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const isSelected = day === selectedDay;
      const hasBirthdays = MOCK_BIRTHDAYS[day.toString()];

      days.push(
        <Pressable
          key={day}
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
            isSelected && styles.selectedCell,
          ]}
          onPress={() => setSelectedDay(day)}
        >
          <AppText style={[
            styles.dayNumber,
            isToday && styles.todayText,
            isSelected && styles.selectedText,
          ]}>
            {day}
          </AppText>
          
          {/* Iconos de cumpleaños */}
          {hasBirthdays && (
            <View style={styles.iconsContainer}>
              {hasBirthdays.map((icon, index) => (
                <View key={index} style={styles.iconWrapper}>
                  <AppText style={styles.iconEmoji}>{icon}</AppText>
                </View>
              ))}
            </View>
          )}
        </Pressable>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppTitle style={styles.title}>Calendario</AppTitle>
        
        {/* Header del mes */}
        <View style={styles.monthHeader}>
          <Pressable onPress={previousMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </Pressable>
          
          <AppText style={styles.monthText}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </AppText>
          
          <Pressable onPress={nextMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={28} color={colors.primary} />
          </Pressable>
        </View>

        {/* Días de la semana */}
        <View style={styles.weekDaysContainer}>
          {DAYS_OF_WEEK.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <AppText style={styles.weekDayText}>{day}</AppText>
            </View>
          ))}
        </View>

        {/* Grid del calendario */}
        <View style={styles.calendarGrid}>
          {renderCalendarDays()}
        </View>

        {/* Leyenda */}
        <View style={styles.legendContainer}>
          <AppText style={styles.legendTitle}>Leyenda:</AppText>
          <View style={styles.legendItem}>
            <View style={styles.legendIcon}>
              <AppText style={styles.iconEmoji}>👤</AppText>
            </View>
            <AppText style={styles.legendText}>Cumpleaños de usuario</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendIcon}>
              <AppText style={styles.iconEmoji}>🎂</AppText>
            </View>
            <AppText style={styles.legendText}>Evento especial</AppText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowButton: {
    padding: 12,
  },
  monthText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 6,
    gap: 6,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedCell: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  todayText: {
    color: colors.primary,
  },
  selectedText: {
    color: colors.secondary,
  },
  iconsContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 16,
  },
  legendContainer: {
    marginTop: 20,
    padding: 18,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  legendText: {
    fontSize: 15,
    color: '#CCC',
  },
});
