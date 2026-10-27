import { useState } from 'react';
import {
  AlertTriangle,
  Baby,
  Bell,
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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';

type DashboardTab = 'alerts' | 'animals' | 'home' | 'search';
type HandlingIcon = 'birth' | 'medicine' | 'vaccine';
type DeadlineTone = 'calm' | 'soon';

interface HerdCategory {
  color: string;
  count: number;
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
  { label: 'Vacas', count: 18, color: '#2E7D32' },
  { label: 'Novilhas', count: 8, color: '#558B2F' },
  { label: 'Bezerros', count: 10, color: '#D97706' },
  { label: 'Touros', count: 4, color: '#2563EB' },
];

const UPCOMING_HANDLINGS: UpcomingHandling[] = [
  {
    id: 'aftosa',
    title: 'Vacinação Febre Aftosa',
    details: '40 animais',
    date: '25/09/2026',
    deadline: '2 dias',
    deadlineTone: 'soon',
    icon: 'vaccine',
  },
  {
    id: 'vermifugacao',
    title: 'Vermifugação',
    details: '18 animais',
    date: '27/09/2026',
    deadline: '4 dias',
    deadlineTone: 'soon',
    icon: 'medicine',
  },
  {
    id: 'parto-mimosa',
    title: 'Previsão de Parto',
    details: '#024 Mimosa',
    date: '30/09/2026',
    deadline: '7 dias',
    deadlineTone: 'calm',
    icon: 'birth',
  },
];

const NAVIGATION_ITEMS: Array<{ icon: DashboardTab; label: string }> = [
  { icon: 'home', label: 'Início' },
  { icon: 'animals', label: 'Animais' },
  { icon: 'alerts', label: 'Alertas' },
  { icon: 'search', label: 'Consulta' },
];

interface DashboardScreenProps {
  onNavigateToAnimals?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToConsultation?: () => void;
}

export function DashboardScreen({
  onNavigateToAnimals: onNavigateToAnimalsProp,
  onNavigateToAlerts: onNavigateToAlertsProp,
  onNavigateToConsultation: onNavigateToConsultationProp,
}: DashboardScreenProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');

  function onNavigateToAnimals() {
    console.log('Navegar para Animais');
    onNavigateToAnimalsProp?.();
  }

  function onNavigateToNewHandling() {
    console.log('Navegar para Novo Manejo');
  }

  function onNavigateToSmartSearch() {
    onNavigateToConsultationProp?.();
  }

  function onSelectNavigation(tab: DashboardTab) {
    setActiveTab(tab);

    if (tab === 'animals') {
      onNavigateToAnimals();
      return;
    }

    if (tab === 'search') {
      onNavigateToSmartSearch();
      return;
    }

    if (tab === 'alerts') {
      onNavigateToAlertsProp?.();
      return;
    }

    console.log('Navegar para Início');
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
              <Text style={styles.herdNumber}>40</Text>
              <Text style={styles.herdLabel}>animais ativos</Text>
            </View>
            <View style={styles.categoryGrid}>
              {HERD_CATEGORIES.map((category) => (
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
              <AttentionCard count="3" icon={<Clock color={colors.white} size={20} strokeWidth={2.4} />} label="PRÓXIMOS" tone="soon" />
              <AttentionCard count="2" icon={<AlertTriangle color={colors.white} size={20} strokeWidth={2.4} />} label="ATRASADOS" tone="late" />
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
              {UPCOMING_HANDLINGS.map((handling) => (
                <HandlingRow key={handling.id} handling={handling} />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onNavigateToAnimals} style={({ pressed }) => [styles.animalsButton, pressed && styles.primaryPressed]}>
              <PawPrint color={colors.white} size={21} strokeWidth={2.4} />
              <Text style={styles.animalsButtonText}>Ver Animais (40)</Text>
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
          </View>
        </ScrollView>

        <View style={styles.bottomNavigation}>
          {NAVIGATION_ITEMS.map((item) => (
            <NavigationItem
              active={activeTab === item.icon}
              key={item.icon}
              label={item.label}
              onPress={() => onSelectNavigation(item.icon)}
              tab={item.icon}
            />
          ))}
        </View>
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

function NavigationItem({ active, label, onPress, tab }: { active: boolean; label: string; onPress: () => void; tab: DashboardTab }) {
  const Icon = tab === 'home' ? LayoutGrid : tab === 'animals' ? PawPrint : tab === 'alerts' ? Bell : Search;

  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.navigationItem, pressed && styles.pressed]}>
      <View>
        <Icon color={active ? colors.primary : colors.muted} size={21} strokeWidth={active ? 2.6 : 2.2} />
        {tab === 'alerts' ? <View style={styles.alertsBadge}><Text style={styles.alertsBadgeText}>2</Text></View> : null}
      </View>
      <Text style={[styles.navigationLabel, active && styles.navigationLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  alertsBadge: {
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderColor: colors.white,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 16,
    justifyContent: 'center',
    position: 'absolute',
    right: -10,
    top: -7,
    width: 16,
  },
  alertsBadgeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 12,
  },
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
  bottomNavigation: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 70,
    paddingBottom: 4,
    paddingTop: 4,
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
  navigationItem: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 60,
  },
  navigationLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  navigationLabelActive: {
    color: colors.primary,
    fontFamily: fonts.bold,
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
