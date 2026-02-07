import { AppButton } from '@/src/components/ui/AppButton';
import { AppContainer } from '@/src/components/ui/AppContainer';
import { AppText } from '@/src/components/ui/AppText';
import { AppTitle } from '@/src/components/ui/AppTitle';
import { UserProfileModal } from '@/src/components/UserProfileModal';
import { BirthdayUser, CalendarEntry, useBirthdays } from '@/src/context/BirthdaysContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { colors } from '@/src/theme';
import { useAppTheme } from '@/src/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

// Usar porcentaje en lugar de cálculos fijos para mejor compatibilidad cross-platform
const DAY_WIDTH_PERCENT = 14.28; // 100% / 7 días ≈ 14.28%

export default function CalendarTabScreen() {
  const { allEntries, getUsersByDate, addManualEntry } = useBirthdays();
  const { t, lang } = useLanguage();
  const { theme, themeMode } = useAppTheme();

  // Get translated days and months
  const DAYS_OF_WEEK = [t('day_mon'), t('day_tue'), t('day_wed'), t('day_thu'), t('day_fri'), t('day_sat'), t('day_sun')];
  const MONTHS = [
    t('month_january'), t('month_february'), t('month_march'), t('month_april'),
    t('month_may'), t('month_june'), t('month_july'), t('month_august'),
    t('month_september'), t('month_october'), t('month_november'), t('month_december')
  ];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showBirthdaysModal, setShowBirthdaysModal] = useState(false);
  const [selectedDayBirthdays, setSelectedDayBirthdays] = useState<CalendarEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<CalendarEntry | null>(null);
  const [showMonthListModal, setShowMonthListModal] = useState(false);
  
  // Estado para modal de añadir cumpleaños manual
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualBirthdate, setManualBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAddingManual, setIsAddingManual] = useState(false);
  
  // Estado para menú de opciones
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const router = useRouter();

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

  const handleUserSelect = (user: CalendarEntry) => {
    // Si es un cumpleaños añadido manualmente, no abrimos el modal OG de perfil
    // y tampoco tocamos selectedUser para no bloquear los otros modales
    if ('isManual' in user && user.isManual) {
      return;
    }

    setSelectedUser(user);
  };

  const closeModals = () => {
    setShowBirthdaysModal(false);
    setShowMonthListModal(false);
    setSelectedUser(null);
  };

  // Obtener cumpleaños del mes actual
  const getMonthBirthdays = () => {
    return allEntries.filter(entry => {
      return entry.birthdate.getMonth() === currentDate.getMonth();
    }).sort((a, b) => a.birthdate.getDate() - b.birthdate.getDate());
  };

  const handleShowMonthList = () => {
    setShowMonthListModal(true);
  };

  const handleAddManualBirthday = async () => {
    if (!manualName.trim()) {
      Alert.alert(t('calendar_manual_error_title'), t('calendar_manual_error_name_required'));
      return;
    }

    try {
      setIsAddingManual(true);
      await addManualEntry(manualName.trim(), manualBirthdate, manualEmail.trim() || undefined);
      
      // Limpiar y cerrar
      setManualName('');
      setManualEmail('');
      setManualBirthdate(new Date());
      setShowAddManualModal(false);

      Alert.alert(
        t('calendar_manual_success_title'),
        t('calendar_manual_success_message').replace('{{name}}', manualName)
      );
    } catch (error: any) {
      console.error('Error adding manual birthday:', error);
      
      // Intentar parsear si es una sugerencia de conexión
      try {
        const suggestion = JSON.parse(error?.message);
        if (suggestion.found && suggestion.user) {
          // Usuario encontrado en la plataforma - mostrar opción de conectar
          Alert.alert(
            '¡Usuario encontrado!',
            suggestion.message,
            [
              {
                text: 'Añadir manualmente',
                style: 'cancel',
                onPress: async () => {
                  // Forzar añadir manual (sin búsqueda)
                  // Por ahora, simplemente mostrar mensaje
                  Alert.alert('Info', 'Para añadir manualmente, ve a la pestaña Connect para enviar una solicitud de conexión.');
                }
              },
              {
                text: 'Ir a Connect',
                onPress: () => {
                  setManualName('');
                  setManualEmail('');
                  setShowAddManualModal(false);
                  router.push('/(drawer)/(tabs)/connect' as any);
                }
              }
            ]
          );
          return;
        }
      } catch (parseError) {
        // No es JSON, es un error normal
      }
      
      const errorMessage = error?.message || t('calendar_manual_error_generic');
      Alert.alert(t('calendar_manual_error_title'), errorMessage);
    } finally {
      setIsAddingManual(false);
    }
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
      const birthdays = allEntries.filter(entry => {
        const entryDay = entry.birthdate.getDate();
        const entryMonth = entry.birthdate.getMonth();
        return entryDay === day && entryMonth === currentDate.getMonth();
      });

      days.push(
        <Pressable
          key={day}
          style={[
            styles.dayCell,
            { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 },
            isToday && styles.todayCell,
            isSelected && styles.selectedCell,
          ]}
          onPress={() => handleDayPress(day)}
        >
          <AppText style={[
            styles.dayNumber,
            { color: theme.text },
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
                <View style={styles.birthdayIndicator}>
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
    <AppContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Título + botón Add en la misma fila */}
        <View style={styles.topHeader}>
          <AppTitle style={styles.title}>{t('calendar_title')}</AppTitle>
          
          {/* Botón Add + con menú */}
          <View style={styles.addButtonContainer}>
            <Pressable 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddMenu(!showAddMenu)}
            >
              <AppText style={styles.addButtonText}>{t('calendar_add_button')}</AppText>
              <Ionicons name="add" size={20} color="#000" />
            </Pressable>
            
            {/* Menú desplegable */}
            {showAddMenu && (
              <View style={[styles.addMenu, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Pressable 
                  style={[styles.menuItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setShowAddMenu(false);
                    // Ir a la pestaña de conexiones, donde está el formulario de invitar por username
                    router.push('/(drawer)/(tabs)/connect' as any);
                  }}
                >
                  <Ionicons name="person-add" size={20} color={colors.primary} />
                  <AppText style={[styles.menuItemText, { color: theme.text }]}>
                    {t('calendar_add_menu_create_connection')}
                  </AppText>
                </Pressable>
                
                <Pressable 
                  style={[styles.menuItem, { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setShowAddMenu(false);
                    setShowAddManualModal(true);
                  }}
                >
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <AppText style={[styles.menuItemText, { color: theme.text }]}>
                    {t('calendar_add_menu_add_manually')}
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Header del mes, centrado */}
        <View style={styles.monthHeader}>
          <Pressable onPress={previousMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </Pressable>
          
          <AppText style={[styles.monthText, { color: theme.text }]}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </AppText>
          
          <Pressable onPress={nextMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={28} color={colors.primary} />
          </Pressable>
        </View>

        {/* Días de la semana */}
        <View style={styles.weekDaysContainer}>
          {DAYS_OF_WEEK.map((day, index) => (
            <View 
              key={day} 
              style={[
                styles.weekDayCell,
                index === 6 && styles.lastInRow
              ]}
            >
              <AppText style={[styles.weekDayText, { color: theme.text, fontWeight: '700' }]}>{day}</AppText>
            </View>
          ))}
        </View>

        {/* Grid del calendario */}
        <View style={[styles.calendarGrid, { backgroundColor: theme.cardBg }]}>
          {renderCalendarDays()}
        </View>

        {/* Resumen del mes */}
        <View style={[styles.monthSummaryContainer, { backgroundColor: theme.cardBg }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="gift" size={24} color={colors.primary} />
            <AppText style={[styles.summaryTitle, { color: theme.text }]}>
              {t('calendar_month_birthdays_title').replace('{{month}}', MONTHS[currentDate.getMonth()])}
            </AppText>
          </View>
          
          <View style={styles.summaryContent}>
            <View style={styles.totalCount}>
              <AppText style={styles.totalNumber}>{getMonthBirthdays().length}</AppText>
              <AppText style={[styles.totalLabel, { color: theme.textMuted }]}>
                {t('calendar_month_birthdays_count_label')}
              </AppText>
            </View>
            
            <Pressable style={styles.viewListButton} onPress={handleShowMonthList}>
              <Ionicons name="list" size={18} color={colors.primary} />
              <AppText style={styles.viewListText}>{t('calendar_view_list')}</AppText>
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
          <Pressable style={[styles.modalContent, { backgroundColor: theme.modalBg }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <AppText style={[styles.modalTitle, { color: theme.text }]}>
                {t('calendar_day_modal_title').replace('{{day}}', selectedDay?.toString() || '').replace('{{month}}', MONTHS[currentDate.getMonth()])}
              </AppText>
              <Pressable onPress={closeModals}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.birthdaysList}>
              {selectedDayBirthdays.map((user) => (
                <Pressable
                  key={user.id}
                  style={[styles.birthdayItem, { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 }]}
                  onPress={() => handleUserSelect(user)}
                >
                  <View style={styles.userAvatar}>
                    <AppText style={styles.userAvatarText}>{user.avatar}</AppText>
                  </View>
                  <View style={styles.userInfo}>
                    <AppText style={[styles.userName, { color: theme.text }]}>{user.name}</AppText>
                    {!('isManual' in user && user.isManual) && (
                      <AppText style={[styles.userAge, { color: theme.textMuted }]}>
                        {new Date().getFullYear() - user.birthdate.getFullYear()} {t('calendar_day_item_age_suffix')}
                      </AppText>
                    )}
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
                {t('calendar_month_modal_title').replace('{{month}}', MONTHS[currentDate.getMonth()]).replace('{{count}}', getMonthBirthdays().length.toString())}
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
                    {t('calendar_month_modal_empty')}
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
      {selectedUser && !('isManual' in selectedUser && selectedUser.isManual) && (
        <UserProfileModal
          visible={!!selectedUser}
          user={selectedUser as BirthdayUser}
          onClose={closeModals}
          showDisconnect={false}
        />
      )}


      {/* Modal: Añadir cumpleaños manual */}
      <Modal
        visible={showAddManualModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddManualModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Pressable style={styles.modalOverlay} onPress={() => setShowAddManualModal(false)}>
              <Pressable style={[styles.modalContent, { backgroundColor: theme.modalBg }]} onPress={(e) => e.stopPropagation()}>
                <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                  <AppText style={[styles.modalTitle, { color: theme.text }]}>
                    {t('calendar_manual_modal_title')}
                  </AppText>
                  <Pressable onPress={() => setShowAddManualModal(false)}>
                    <Ionicons name="close" size={24} color={theme.text} />
                  </Pressable>
                </View>

                <ScrollView 
                  style={styles.addManualForm}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                      <View style={styles.formGroup}>
                        <AppText style={[styles.formLabel, { color: theme.text }]}>
                          {t('calendar_manual_name_label')}
                        </AppText>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                          placeholder={t('calendar_manual_name_placeholder')}
                          placeholderTextColor={theme.textMuted}
                          value={manualName}
                          onChangeText={setManualName}
                          autoFocus
                          returnKeyType="next"
                          onSubmitEditing={() => Keyboard.dismiss()}
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <AppText style={[styles.formLabel, { color: theme.text }]}>
                          Email (opcional)
                        </AppText>
                        <TextInput
                          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                          placeholder="email@ejemplo.com"
                          placeholderTextColor={theme.textMuted}
                          value={manualEmail}
                          onChangeText={setManualEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="done"
                          onSubmitEditing={() => Keyboard.dismiss()}
                        />
                      </View>

                      <View style={styles.formGroup}>
                        <AppText style={[styles.formLabel, { color: theme.text }]}>
                          {t('calendar_manual_date_label')}
                        </AppText>
                        <Pressable
                          style={[styles.dateButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                          onPress={() => {
                            Keyboard.dismiss();
                            setShowDatePicker(true);
                          }}
                        >
                          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                          <AppText style={[styles.dateButtonText, { color: theme.text }]}>
                            {manualBirthdate.toLocaleDateString(
                              lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : 'en-US',
                              { day: '2-digit', month: 'long', year: 'numeric' }
                            )}
                          </AppText>
                        </Pressable>
                      </View>

                      {showDatePicker && (
                        <View style={styles.datePickerContainer}>
                          <DateTimePicker
                            value={manualBirthdate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            themeVariant={themeMode}
                            onChange={(event, selectedDate) => {
                              if (Platform.OS === 'android') {
                                setShowDatePicker(false);
                              }
                              if (selectedDate) {
                                setManualBirthdate(selectedDate);
                              }
                            }}
                          />
                          {Platform.OS === 'ios' && (
                            <View style={styles.datePickerActions}>
                              <Pressable
                                style={[styles.doneButton, { backgroundColor: colors.primary }]}
                                onPress={() => setShowDatePicker(false)}
                              >
                                <AppText style={styles.doneButtonText}>{t('calendar_profile_close_button')}</AppText>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      )}

                      <AppButton
                        title={isAddingManual ? t('calendar_manual_submit_button') : t('calendar_manual_submit_button')}
                        onPress={handleAddManualBirthday}
                        disabled={isAddingManual || !manualName.trim()}
                        style={styles.submitButton}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </ScrollView>
              </Pressable>
            </Pressable>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </AppContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  title: {
    marginTop: 0,
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
    color: '#FFFFFF',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDayCell: {
    width: `${DAY_WIDTH_PERCENT}%`,
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
    backgroundColor: 'rgba(246, 250, 255, 0.92)',
    borderRadius: 16,
    padding: 4,
  },
  dayCell: {
    width: `${DAY_WIDTH_PERCENT}%`,
    height: 50,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: 10,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 4,
    overflow: 'hidden',
  },
  lastInRow: {
    // No necesario con porcentajes
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedCell: {
    backgroundColor: colors.primary,
  },
  dayNumber: {
    fontSize: 11,
    color: '#0F172A',
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
    gap: 2,
  },
  avatarWithCounter: {
    position: 'relative',
    width: 20,
    height: 20,
  },
  birthdayIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 12,
  },
  counterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E74C3C', // Rojo
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  counterBadgeSmall: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E74C3C', // Rojo
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1C1C1C',
  },
  counterTextSmall: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
  },
  monthSummaryContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: 'rgba(246, 250, 255, 0.92)',
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
    color: '#0F172A',
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
    color: '#64748B',
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
    color: '#64748B',
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
    backgroundColor: '#F6FAFF',
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
    color: '#0F172A',
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
    backgroundColor: 'rgba(246, 250, 255, 0.96)',
    borderRadius: 12,
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
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
    color: '#0F172A',
    marginBottom: 4,
  },
  userAge: {
    fontSize: 14,
    color: '#64748B',
  },
  userDetails: {
    padding: 20,
  },
  userAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
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
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#0F172A',
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
  topHeader: {
    position: 'relative',
    alignItems: 'stretch',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonContainer: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  addMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  addManualForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    flex: 1,
  },
  submitButton: {
    marginTop: 10,
  },
  datePickerContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  datePickerActions: {
    marginTop: 12,
    alignItems: 'center',
  },
  doneButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
