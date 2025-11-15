import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { AppText } from '@/src/components/ui/AppText';
import { AppButton } from '@/src/components/ui/AppButton';
import { colors } from '@/src/theme';
import { useBirthdays, BirthdayUser } from '@/src/context/BirthdaysContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_PADDING = 20; // padding horizontal del scroll (10 * 2) - reducido
const GRID_PADDING = 16; // padding del grid (8 * 2)
const GAP = 4; // gap reducido
const DAY_SIZE = (SCREEN_WIDTH - CALENDAR_PADDING - GRID_PADDING - (GAP * 6)) / 7;

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CalendarTabScreen() {
  const { users, getUsersByDate } = useBirthdays();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showBirthdaysModal, setShowBirthdaysModal] = useState(false);
  const [selectedDayBirthdays, setSelectedDayBirthdays] = useState<BirthdayUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<BirthdayUser | null>(null);
  const [showMonthListModal, setShowMonthListModal] = useState(false);

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

  const handleDayPress = async (day: number) => {
    setSelectedDay(day);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const birthdays = await getUsersByDate(date);
    
    if (birthdays.length > 0) {
      setSelectedDayBirthdays(birthdays);
      setShowBirthdaysModal(true);
    }
  };

  const handleUserSelect = (user: BirthdayUser) => {
    setSelectedUser(user);
  };

  const closeModals = () => {
    setShowBirthdaysModal(false);
    setShowMonthListModal(false);
    setSelectedUser(null);
  };

  // Obtener cumpleaños del mes actual
  const getMonthBirthdays = () => {
    return users.filter(user => {
      return user.birthdate.getMonth() === currentDate.getMonth();
    }).sort((a, b) => a.birthdate.getDate() - b.birthdate.getDate());
  };

  const handleShowMonthList = () => {
    setShowMonthListModal(true);
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
      
      // Filtrar cumpleaños del mes actual para este día
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const birthdays = users.filter(user => {
        const userDay = user.birthdate.getDate();
        const userMonth = user.birthdate.getMonth();
        return userDay === day && userMonth === currentDate.getMonth();
      });

      days.push(
        <Pressable
          key={day}
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
            isSelected && styles.selectedCell,
          ]}
          onPress={() => handleDayPress(day)}
        >
          <AppText style={[
            styles.dayNumber,
            isToday && styles.todayText,
            isSelected && styles.selectedText,
          ]}>
            {day}
          </AppText>
          
          {/* Avatares de cumpleaños con contador */}
          {birthdays.length > 0 && (
            <View style={styles.iconsContainer}>
              <View style={styles.avatarWithCounter}>
                {/* Siempre mostrar el primer avatar */}
                <View style={styles.iconWrapper}>
                  <AppText style={styles.iconEmoji}>{birthdays[0].avatar}</AppText>
                </View>
                
                {/* Si hay más de uno, mostrar contador */}
                {birthdays.length > 1 && (
                  <View style={styles.counterBadgeSmall}>
                    <AppText style={styles.counterTextSmall}>+{birthdays.length - 1}</AppText>
                  </View>
                )}
              </View>
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

        {/* Resumen del mes */}
        <View style={styles.monthSummaryContainer}>
          <View style={styles.summaryHeader}>
            <Ionicons name="gift" size={24} color={colors.primary} />
            <AppText style={styles.summaryTitle}>
              Cumpleaños en {MONTHS[currentDate.getMonth()]}
            </AppText>
          </View>
          
          <View style={styles.summaryContent}>
            <View style={styles.totalCount}>
              <AppText style={styles.totalNumber}>{getMonthBirthdays().length}</AppText>
              <AppText style={styles.totalLabel}>
                {getMonthBirthdays().length === 1 ? 'cumpleaño' : 'cumpleaños'}
              </AppText>
            </View>
            
            <Pressable style={styles.viewListButton} onPress={handleShowMonthList}>
              <Ionicons name="list" size={18} color={colors.primary} />
              <AppText style={styles.viewListText}>Ver lista</AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal: Lista de cumpleaños del día */}
      <Modal
        visible={showBirthdaysModal && !selectedUser}
        transparent
        animationType="fade"
        onRequestClose={closeModals}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModals}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>
                Cumpleaños - {selectedDay} de {MONTHS[currentDate.getMonth()]}
              </AppText>
              <Pressable onPress={closeModals}>
                <Ionicons name="close" size={24} color={colors.white} />
              </Pressable>
            </View>

            <ScrollView style={styles.birthdaysList}>
              {selectedDayBirthdays.map((user) => (
                <Pressable
                  key={user.id}
                  style={styles.birthdayItem}
                  onPress={() => handleUserSelect(user)}
                >
                  <View style={styles.userAvatar}>
                    <AppText style={styles.userAvatarText}>{user.avatar}</AppText>
                  </View>
                  <View style={styles.userInfo}>
                    <AppText style={styles.userName}>{user.name}</AppText>
                    <AppText style={styles.userAge}>
                      {new Date().getFullYear() - user.birthdate.getFullYear()} años
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: Lista de cumpleaños del mes */}
      <Modal
        visible={showMonthListModal && !selectedUser}
        transparent
        animationType="slide"
        onRequestClose={closeModals}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModals}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>
                {MONTHS[currentDate.getMonth()]} - {getMonthBirthdays().length} {getMonthBirthdays().length === 1 ? 'cumpleaño' : 'cumpleaños'}
              </AppText>
              <Pressable onPress={closeModals}>
                <Ionicons name="close" size={24} color={colors.white} />
              </Pressable>
            </View>

            <ScrollView style={styles.birthdaysList}>
              {getMonthBirthdays().length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#666" />
                  <AppText style={styles.emptyText}>
                    No hay cumpleaños este mes
                  </AppText>
                </View>
              ) : (
                getMonthBirthdays().map((user) => (
                  <Pressable
                    key={user.id}
                    style={styles.birthdayItem}
                    onPress={() => handleUserSelect(user)}
                  >
                    <View style={styles.userAvatar}>
                      <AppText style={styles.userAvatarText}>{user.avatar}</AppText>
                    </View>
                    <View style={styles.userInfo}>
                      <AppText style={styles.userName}>{user.name}</AppText>
                      <AppText style={styles.userAge}>
                        {user.birthdate.getDate()} de {MONTHS[user.birthdate.getMonth()].toLowerCase()}
                      </AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                  </Pressable>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: Detalles del usuario */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="slide"
        onRequestClose={closeModals}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModals}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Pressable onPress={() => setSelectedUser(null)}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                  </Pressable>
                  <AppText style={styles.modalTitle}>Perfil</AppText>
                  <Pressable onPress={closeModals}>
                    <Ionicons name="close" size={24} color={colors.white} />
                  </Pressable>
                </View>

                <ScrollView style={styles.userDetails}>
                  <View style={styles.userAvatarLarge}>
                    <AppText style={styles.userAvatarLargeText}>{selectedUser.avatar}</AppText>
                  </View>

                  <AppText style={styles.userNameLarge}>{selectedUser.name}</AppText>

                  <View style={styles.detailSection}>
                    <AppText style={styles.detailLabel}>Fecha de nacimiento</AppText>
                    <AppText style={styles.detailValue}>
                      {selectedUser.birthdate.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </AppText>
                  </View>

                  <View style={styles.detailSection}>
                    <AppText style={styles.detailLabel}>Edad</AppText>
                    <AppText style={styles.detailValue}>
                      {new Date().getFullYear() - selectedUser.birthdate.getFullYear()} años
                    </AppText>
                  </View>

                  {selectedUser.email && (
                    <View style={styles.detailSection}>
                      <AppText style={styles.detailLabel}>Email</AppText>
                      <AppText style={styles.detailValue}>{selectedUser.email}</AppText>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <AppText style={styles.detailLabel}>Hobbies</AppText>
                    <View style={styles.hobbiesContainer}>
                      {selectedUser.hobbies.map((hobby, index) => (
                        <View key={index} style={styles.hobbyBadge}>
                          <AppText style={styles.hobbyText}>{hobby}</AppText>
                        </View>
                      ))}
                    </View>
                  </View>

                  <AppButton
                    title="Cerrar"
                    onPress={closeModals}
                    style={styles.closeButton}
                  />
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  scrollContent: {
    padding: 10,
  },
  title: {
    marginTop: 10,
    marginBottom: 16,
    textAlign: 'center',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 4,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 8,
    gap: 4,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    padding: 6,
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
    fontSize: 13,
    color: colors.white,
    fontWeight: '700',
    marginBottom: 2,
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
  avatarWithCounter: {
    position: 'relative',
    width: 36,
    height: 36,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  counterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E74C3C', // Rojo
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  counterBadgeSmall: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E74C3C', // Rojo
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1C1C1C',
  },
  counterTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  monthSummaryContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalCount: {
    alignItems: 'center',
  },
  totalNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  totalLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  viewListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  viewListText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  // Estilos para modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1C1C1C',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  birthdaysList: {
    padding: 20,
  },
  birthdayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  userAge: {
    fontSize: 14,
    color: '#999',
  },
  userDetails: {
    padding: 20,
  },
  userAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  userAvatarLargeText: {
    fontSize: 50,
  },
  userNameLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: colors.white,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyBadge: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  hobbyText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    marginBottom: 10,
  },
});
