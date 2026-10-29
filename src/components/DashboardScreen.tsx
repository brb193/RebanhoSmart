import { useState } from 'react';
import {
  AlertTriangle,
  Baby,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  LayoutGrid,
  PawPrint,
  Pill,
  PlusCircle,
  Search,
  ShieldCheck,
  Sprout,
  Syringe,
  User,
  Wifi,
} from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Animal } from './AnimalListScreen';
import type { AlertItem } from './AlertsScreen';
import { BottomNavigation, type AppTabIndex } from './BottomNavigation';
import { ScreenSafeArea as SafeAreaView } from './ScreenSafeArea';
import { colors, fonts } from '../theme';

type HandlingIcon = 'birth' | 'medicine' | 'vaccine';
type DeadlineTone = 'calm' | 'soon';

interface HerdCategory {
  color: string;
  label: string;
}

interface UpcomingHandling {
  date: string;
  deadline: string;
  deadlineTone: DeadlineTone;
  details: string;
  icon: HandlingIcon;
  id: string;
  title: string;
}

const HERD_CATEGORIES: HerdCategory[] = [
  { label: 'Vacas', color: '#2E7D32' },
  { label: 'Novilhas', color: '#558B2F' },
  { label: 'Bezerros', color: '#D97706' },
  { label: 'Garrotes', color: '#7C3AED' },
  { label: 'Touros', color: '#2563EB' },
];

interface DashboardScreenProps {
  animals: Animal[];
  alerts: AlertItem[];
  onNavigateToDashboard?: () => void;
  onNavigateToAnimals?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToConsultation?: () => void;
  onOpenStateCatalog?: () => void;
}

export function DashboardScreen({
  animals,
  alerts,
  onNavigateToDashboard,
  onNavigateToAnimals: onNavigateToAnimalsProp,
  onNavigateToAlerts: onNavigateToAlertsProp,
  onNavigateToConsultation: onNavigateToConsultationProp,
  onOpenStateCatalog,
}: DashboardScreenProps) {
  const [isOffline, setIsOffline] = useState(false);
  const herdCategories = HERD_CATEGORIES.map((category) => ({
    ...category,
    count: animals.filter((animal) => animal.categoria === category.label).length,
  }));
  const delayedAlerts = alerts.filter((alert) => alert.severity === 'delayed');
  const upcomingAlerts = alerts.filter((alert) => alert.severity === 'upcoming');
  const upcomingHandlings: UpcomingHandling[] = upcomingAlerts.map((alert) => ({
    id: alert.handlingId,
    title: alert.title || alert.handlingType,
    details: alert.targetSummary,
    date: formatDueDate(alert.dueDate),
    deadline: alert.daysNoticeText,
    deadlineTone: 'calm',
    icon: alert.handlingType === 'Parto'
      ? 'birth'
      : alert.handlingType === 'Vermifugação'
        ? 'medicine'
        : 'vaccine',
  }));

  function onNavigateToNewHandling() {
    console.log('Navegar para Novo Manejo');
  }

  function onNavigateToSmartSearch() {
    onNavigateToConsultationProp?.();
  }

  function onSelectNavigation(tabIndex: AppTabIndex) {
    if (tabIndex === 0) onNavigateToDashboard?.();
    if (tabIndex === 1) onNavigateToAnimalsProp?.();
    if (tabIndex === 2) onNavigateToAlertsProp?.();
    if (tabIndex === 3) onNavigateToSmartSearch();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.phoneFrame}>
        <View style={styles.topBar}>
          <View style={styles.topBarMainRow}>
            <View style={styles.brandGroup}>
              <View style={styles.logoMark}>
                <Sprout color={colors.white} size={20} strokeWidth={2.5} />
              </View>
              <Text style={styles.brandName}>RebanhoSmart</Text>
            </View>

            <View style={styles.topBarActions}>
              <Pressable
                accessibilityHint="Alterna entre os status sincronizado e disponível offline"
                accessibilityRole="button"
                accessibilityState={{ selected: isOffline }}
                onPress={() => setIsOffline((current) => !current)}
                style={({ pressed }) => [styles.connectionBadge, isOffline && styles.offlineBadge, pressed && styles.pressed]}
              >
                {isOffline ? <Wifi color="#1E3A8A" size={16} strokeWidth={2.4} /> : <CheckCircle2 color={colors.success} size={16} strokeWidth={2.4} />}
                <Text style={[styles.connectionText, isOffline && styles.offlineText]}>{isOffline ? 'Disponível offline' : 'Sincronizado'}</Text>
              </Pressable>
              <Pressable accessibilityLabel="Perfil do produtor" onPress={() => console.log('Abrir perfil do produtor')} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
                <User color={colors.white} size={20} strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.brandDescription}>Aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.offlineCard}>
            <View style={styles.offlineIcon}>
              <ShieldCheck color={colors.primary} size={20} strokeWidth={2.4} />
            </View>
            <Text style={styles.offlineTextBody}>Modo offline pronto: seus lançamentos ficam seguros no celular mesmo sem conexão.</Text>
          </View>

          <View style={styles.herdCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Plantel Geral</Text>
              <View style={styles.gridIcon}>
                <LayoutGrid color={colors.primary} size={21} strokeWidth={2.3} />
              </View>
            </View>
            <View style={styles.herdMetricRow}>
              <Text style={styles.herdNumber}>{animals.length}</Text>
              <Text style={styles.herdLabel}>animais ativos</Text>
            </View>
            <View style={styles.categoryGrid}>
              {herdCategories.map((category) => (
                <View key={category.label} style={styles.categoryItem}>
                  <View style={styles.categoryName}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </View>
                  <Text style={styles.categoryCount}>{category.count}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.attentionSection}>
            <View style={styles.attentionHeading}>
              <Text style={styles.sectionTitle}>Atenção do Rebanho</Text>
              <Text style={styles.sectionKicker}>Manejos</Text>
            </View>
            <View style={styles.attentionCards}>
              <AttentionCard count={String(upcomingAlerts.length)} icon={<Clock color={colors.white} size={20} strokeWidth={2.4} />} label="PRÓXIMOS" tone="soon" />
              <AttentionCard count={String(delayedAlerts.length)} icon={<AlertTriangle color={colors.white} size={20} strokeWidth={2.4} />} label="ATRASADOS" tone="late" />
            </View>
          </View>

          <View style={styles.handlingSection}>
            <View style={styles.handlingHeading}>
              <Text style={styles.sectionTitle}>Próximos Manejos</Text>
              <Pressable accessibilityRole="button" onPress={() => console.log('Navegar para Calendário')} style={({ pressed }) => [styles.calendarLink, pressed && styles.pressed]}>
                <Calendar color={colors.primary} size={17} strokeWidth={2.3} />
                <Text style={styles.calendarLinkText}>Calendário</Text>
              </Pressable>
            </View>
            <View style={styles.handlingList}>
              {upcomingHandlings.map((handling) => (
                <HandlingRow key={handling.id} handling={handling} />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onNavigateToAnimalsProp} style={({ pressed }) => [styles.animalsButton, pressed && styles.primaryPressed]}>
              <PawPrint color={colors.white} size={21} strokeWidth={2.4} />
              <Text style={styles.animalsButtonText}>Ver Animais ({animals.length})</Text>
            </Pressable>
            <View style={styles.secondaryActions}>
              <Pressable accessibilityRole="button" onPress={onNavigateToNewHandling} style={({ pressed }) => [styles.newHandlingButton, pressed && styles.terracottaPressed]}>
                <PlusCircle color={colors.white} size={19} strokeWidth={2.5} />
                <Text style={styles.newHandlingButtonText}>Novo Manejo</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onNavigateToSmartSearch} style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}>
                <Search color="#1E3A8A" size={19} strokeWidth={2.5} />
                <Text style={styles.searchButtonText}>Consulta Rápida</Text>
              </Pressable>
            </View>
            {onOpenStateCatalog ? (
              <Pressable accessibilityRole="button" onPress={onOpenStateCatalog} style={styles.stateCatalogLink}>
                <Text style={styles.stateCatalogLinkText}>Catálogo de estados do sistema</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        <BottomNavigation activeTab={0} alertCount={alerts.length} onTabChange={onSelectNavigation} />
      </View>
    </SafeAreaView>
  );
}

function AttentionCard({ count, icon, label, tone }: { count: string; icon: React.ReactNode; label: string; tone: 'late' | 'soon' }) {
  const isLate = tone === 'late';

  return (
    <View style={[styles.attentionCard, isLate ? styles.lateCard : styles.soonCard]}>
      <View style={[styles.attentionIcon, isLate ? styles.lateIcon : styles.soonIcon]}>{icon}</View>
      <Text style={[styles.attentionNumber, isLate ? styles.lateText : styles.soonText]}>{count}</Text>
      <Text style={[styles.attentionLabel, isLate ? styles.lateText : styles.soonText]}>{label}</Text>
    </View>
  );
}

function HandlingRow({ handling }: { handling: UpcomingHandling }) {
  const Icon = handling.icon === 'vaccine' ? Syringe : handling.icon === 'medicine' ? Pill : Baby;

  return (
    <Pressable accessibilityRole="button" onPress={() => console.log(`Abrir manejo: ${handling.id}`)} style={({ pressed }) => [styles.handlingRow, pressed && styles.rowPressed]}>
      <View style={styles.handlingIcon}>
        <Icon color="#1E3A8A" size={22} strokeWidth={2.2} />
      </View>
      <View style={styles.handlingDetails}>
        <Text numberOfLines={1} style={styles.handlingTitle}>{handling.title}</Text>
        <Text style={styles.handlingMeta}>{handling.details} • {handling.date}</Text>
      </View>
      <View style={[styles.deadlineBadge, handling.deadlineTone === 'soon' ? styles.soonDeadline : styles.calmDeadline]}>
        <Text style={[styles.deadlineText, handling.deadlineTone === 'soon' ? styles.soonDeadlineText : styles.calmDeadlineText]}>{handling.deadline}</Text>
      </View>
      <ChevronRight color={colors.muted} size={19} strokeWidth={2.3} />
    </Pressable>
  );
}

function formatDueDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

const styles = StyleSheet.create({
  animalsButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 11,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  animalsButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    marginTop: 25,
  },
  stateCatalogLink: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  stateCatalogLinkText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  attentionCard: {
    borderRadius: 12,
    flex: 1,
    minHeight: 139,
    padding: 14,
  },
  attentionCards: {
    flexDirection: 'row',
    gap: 12,
  },
  attentionHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  attentionIcon: {
    alignItems: 'center',
    borderRadius: 9,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  attentionLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.65,
    lineHeight: 17,
    marginTop: 1,
  },
  attentionNumber: {
    fontFamily: fonts.bold,
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 35,
    marginTop: 12,
  },
  attentionSection: {
    marginTop: 22,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  brandDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 15,
  },
  brandGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 9,
  },
  brandName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.35,
    lineHeight: 25,
  },
  calendarLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    minHeight: 36,
  },
  calendarLinkText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  calmDeadline: {
    backgroundColor: '#E8EFFB',
  },
  calmDeadlineText: {
    color: '#1E3A8A',
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryCount: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  categoryDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  categoryGrid: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 17,
    paddingTop: 15,
  },
  categoryItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 31,
    width: '47%',
  },
  categoryLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
  },
  categoryName: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  connectionBadge: {
    alignItems: 'center',
    backgroundColor: colors.successBackground,
    borderColor: colors.successBorder,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 32,
    paddingHorizontal: 9,
  },
  connectionText: {
    color: colors.success,
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 17,
  },
  deadlineBadge: {
    borderRadius: 7,
    marginLeft: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  deadlineText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 15,
  },
  gridIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    height: 39,
    justifyContent: 'center',
    width: 39,
  },
  handlingDetails: {
    flex: 1,
    gap: 2,
  },
  handlingHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  handlingIcon: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 10,
    height: 43,
    justifyContent: 'center',
    width: 43,
  },
  handlingList: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  handlingMeta: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 19,
  },
  handlingRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  handlingSection: {
    marginTop: 25,
  },
  handlingTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  herdCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 17,
    padding: 16,
  },
  herdLabel: {
    alignSelf: 'flex-end',
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 5,
    marginLeft: 9,
  },
  herdMetricRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 8,
  },
  herdNumber: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 32,
    letterSpacing: -1,
    lineHeight: 38,
  },
  lateCard: {
    backgroundColor: colors.errorBackground,
  },
  lateIcon: {
    backgroundColor: '#B91C1C',
  },
  lateText: {
    color: colors.error,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  newHandlingButton: {
    alignItems: 'center',
    backgroundColor: colors.terracotta,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 7,
  },
  newHandlingButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  offlineBadge: {
    backgroundColor: colors.input,
    borderColor: '#BFDBFE',
  },
  offlineCard: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: '#C9D9F5',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    padding: 13,
  },
  offlineIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  offlineText: {
    color: '#1E3A8A',
  },
  offlineTextBody: {
    color: '#1E3A8A',
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  phoneFrame: {
    backgroundColor: colors.page,
    flex: 1,
    maxWidth: 390,
    width: '100%',
  },
  pressed: {
    opacity: 0.72,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
    transform: [{ scale: 0.99 }],
  },
  rowPressed: {
    backgroundColor: '#F3F7FF',
  },
  safeArea: {
    alignItems: 'center',
    backgroundColor: colors.page,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 23,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: '#C9D9F5',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 7,
  },
  searchButtonText: {
    color: '#1E3A8A',
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionKicker: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 20,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  soonCard: {
    backgroundColor: colors.terracottaSoft,
  },
  soonDeadline: {
    backgroundColor: colors.terracottaSoft,
  },
  soonDeadlineText: {
    color: '#C2410C',
  },
  soonIcon: {
    backgroundColor: '#C2410C',
  },
  soonText: {
    color: '#9A3412',
  },
  terracottaPressed: {
    backgroundColor: colors.terracottaActive,
    transform: [{ scale: 0.99 }],
  },
  topBar: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: 17,
    paddingHorizontal: 20,
    paddingTop: 13,
  },
  topBarActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  topBarMainRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
