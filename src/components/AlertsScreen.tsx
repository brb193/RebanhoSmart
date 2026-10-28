import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Baby,
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  PawPrint,
  Pill,
  Syringe,
  Tag,
} from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';
import { BottomNavigation, type AppTabIndex } from './BottomNavigation';
import { ListLoadState, type ListLoadStatus } from './ListLoadState';
import { ScreenSafeArea as SafeAreaView } from './ScreenSafeArea';

export type AlertSeverity = 'delayed' | 'upcoming';
export type AlertHandlingType = 'Vacinação' | 'Vermifugação' | 'Inseminação' | 'Parto' | 'Secagem';
export type AlertFilter = 'todos' | 'atrasados' | 'proximos';

export interface AlertItem {
  id: string;
  handlingId: string;
  handlingType: AlertHandlingType;
  title?: string;
  scope: 'individual' | 'coletivo';
  targetSummary: string;
  targetTagNumber?: string;
  dueDate: string;
  daysNoticeText: string;
  severity: AlertSeverity;
}

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    handlingId: 'man-101',
    handlingType: 'Vermifugação',
    scope: 'coletivo',
    targetSummary: '18 novilhas e bezerros selecionados',
    dueDate: '2026-09-22',
    daysNoticeText: 'Atrasado há 3 dias',
    severity: 'delayed',
  },
  {
    id: 'alt-2',
    handlingId: 'man-102',
    handlingType: 'Vacinação',
    title: 'Vacinação Febre Aftosa',
    scope: 'individual',
    targetSummary: 'Animal #027 - Aurora (Novilha • Holandesa)',
    targetTagNumber: '#027',
    dueDate: '2026-09-24',
    daysNoticeText: 'Atrasado há 1 dia',
    severity: 'delayed',
  },
  {
    id: 'alt-3',
    handlingId: 'man-103',
    handlingType: 'Vacinação',
    title: 'Vacinação Febre Aftosa • Coletiva',
    scope: 'coletivo',
    targetSummary: '40 animais do plantel geral',
    dueDate: '2026-09-27',
    daysNoticeText: 'Em 2 dias',
    severity: 'upcoming',
  },
  {
    id: 'alt-4',
    handlingId: 'man-104',
    handlingType: 'Parto',
    title: 'Previsão de Parto',
    scope: 'individual',
    targetSummary: 'Animal #024 - Mimosa (Vaca • Holandesa)',
    targetTagNumber: '#024',
    dueDate: '2026-09-30',
    daysNoticeText: 'Em 5 dias',
    severity: 'upcoming',
  },
  {
    id: 'alt-5',
    handlingId: 'man-105',
    handlingType: 'Secagem',
    title: 'Secagem Programada',
    scope: 'individual',
    targetSummary: 'Animal #019 - Estrela (Vaca • Girolando)',
    targetTagNumber: '#019',
    dueDate: '2026-10-02',
    daysNoticeText: 'Em 7 dias',
    severity: 'upcoming',
  },
];

interface AlertsScreenProps {
  alerts: AlertItem[];
  loadStatus: ListLoadStatus;
  onRetryLoad: () => void;
  selectedAlertId: string | null;
  onSelectAlert: (handlingId: string) => void;
  onClearSelectedAlert: () => void;
  onResolveAlert: (alertId: string) => Promise<boolean>;
  onTabChange: (tabIndex: AppTabIndex) => void;
}

const FILTERS: { key: AlertFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'atrasados', label: 'Atrasados' },
  { key: 'proximos', label: 'Próximos' },
];

export function AlertsScreen({
  alerts,
  loadStatus,
  onRetryLoad,
  selectedAlertId,
  onSelectAlert,
  onClearSelectedAlert,
  onResolveAlert,
  onTabChange,
}: AlertsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('todos');
  const [hasNotificationPermission] = useState(false);
  const [isPermissionBannerVisible, setIsPermissionBannerVisible] = useState(true);

  const selectedAlert = alerts.find((alert) => alert.handlingId === selectedAlertId);
  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'atrasados') return alerts.filter((alert) => alert.severity === 'delayed');
    if (activeFilter === 'proximos') return alerts.filter((alert) => alert.severity === 'upcoming');
    return alerts;
  }, [activeFilter, alerts]);
  const delayedAlerts = filteredAlerts.filter((alert) => alert.severity === 'delayed');
  const upcomingAlerts = filteredAlerts.filter((alert) => alert.severity === 'upcoming');

  async function resolveAlert(alertId: string): Promise<boolean> {
    const saved = await onResolveAlert(alertId);
    if (saved) onClearSelectedAlert();
    return saved;
  }

  if (selectedAlert) {
    return (
      <HandlingAlertDetailScreen
        alert={selectedAlert}
        onBack={onClearSelectedAlert}
        onResolve={() => resolveAlert(selectedAlert.id)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <View style={styles.titleGroup}>
            <Text accessibilityRole="header" numberOfLines={1} style={styles.pageTitle}>Alertas do Rebanho</Text>
            <Text style={styles.totalCount}>{alerts.length} {alerts.length === 1 ? 'pendência' : 'pendências'}</Text>
          </View>
          <View style={styles.offlineBadge}>
            <CheckCircle2 color={colors.success} size={16} />
            <Text style={styles.offlineText}>Disponível offline</Text>
          </View>
        </View>

        {hasNotificationPermission || !isPermissionBannerVisible ? null : (
          <View style={styles.permissionBanner}>
            <View style={styles.permissionIcon}>
              <BellOff color="#D97706" size={21} />
            </View>
            <View style={styles.permissionContent}>
              <Text style={styles.permissionTitle}>Notificações externas desativadas</Text>
              <Text style={styles.permissionDescription}>
                Você continua vendo todos os alertas aqui no app. Para receber avisos na tela bloqueada do celular, ative as notificações nas configurações.
              </Text>
              <View style={styles.permissionActions}>
                <Pressable accessibilityRole="button" onPress={() => setIsPermissionBannerVisible(false)} style={styles.permissionAction}>
                  <Text style={styles.permissionActionText}>Dispensar aviso</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const count = filter.key === 'todos'
              ? alerts.length
              : alerts.filter((alert) => alert.severity === (filter.key === 'atrasados' ? 'delayed' : 'upcoming')).length;
            const active = activeFilter === filter.key;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={[styles.filterPill, active && styles.filterPillActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter.label} ({count})</Text>
              </Pressable>
            );
          })}
        </View>

        {loadStatus !== 'ready' ? (
          <ListLoadState onRetry={onRetryLoad} status={loadStatus} />
        ) : (
          <ScrollView contentContainerStyle={styles.alertList} showsVerticalScrollIndicator={false}>
            {delayedAlerts.length > 0 ? (
              <AlertSection
                alerts={delayedAlerts}
                onSelectAlert={onSelectAlert}
                subtitle="Ações que ultrapassaram a data prevista"
                title="Manejos Atrasados"
                tone="delayed"
              />
            ) : null}
            {upcomingAlerts.length > 0 ? (
              <AlertSection
                alerts={upcomingAlerts}
                onSelectAlert={onSelectAlert}
                subtitle="Atividades programadas para os próximos 7 dias"
                title="Próximos Manejos"
                tone="upcoming"
              />
            ) : null}
            {filteredAlerts.length === 0 ? <EmptyAlerts /> : null}
          </ScrollView>
        )}

        <BottomNavigation activeTab={2} alertCount={alerts.length} onTabChange={onTabChange} />
      </View>
    </SafeAreaView>
  );
}

function AlertSection({
  alerts,
  onSelectAlert,
  subtitle,
  title,
  tone,
}: {
  alerts: AlertItem[];
  onSelectAlert: (handlingId: string) => void;
  subtitle: string;
  title: string;
  tone: AlertSeverity;
}) {
  const Icon = tone === 'delayed' ? AlertTriangle : Clock;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Icon color={tone === 'delayed' ? '#DC2626' : '#D97706'} size={22} strokeWidth={2.3} />
        <View style={styles.sectionHeadingText}>
          <Text style={[styles.sectionTitle, tone === 'delayed' ? styles.delayedTitle : styles.upcomingTitle]}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {alerts.map((alert) => (
        <AlertCard alert={alert} key={alert.id} onPress={() => onSelectAlert(alert.handlingId)} />
      ))}
    </View>
  );
}

function AlertCard({ alert, onPress }: { alert: AlertItem; onPress: () => void }) {
  const isDelayed = alert.severity === 'delayed';
  const Icon = alert.handlingType === 'Vermifugação'
    ? Pill
    : alert.handlingType === 'Parto'
      ? Baby
      : alert.handlingType === 'Secagem'
        ? Calendar
        : Syringe;

  return (
    <Pressable
      accessibilityLabel={`${alert.handlingType}. ${alert.targetSummary}. ${alert.daysNoticeText}. Abrir manejo.`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.alertCard,
        isDelayed ? styles.delayedCard : styles.upcomingCard,
        pressed && styles.alertCardPressed,
      ]}
    >
      <View style={[styles.alertIcon, isDelayed ? styles.delayedIcon : styles.upcomingIcon]}>
        <Icon color={isDelayed ? '#DC2626' : '#D97706'} size={22} strokeWidth={2.2} />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>
          {alert.title || `${alert.handlingType}${alert.scope === 'coletivo' ? ' • Coletiva' : ''}`}
        </Text>
        <Text style={styles.targetSummary}>{alert.targetSummary}</Text>
        <Text style={[styles.deadline, isDelayed ? styles.deadlineDelayed : styles.deadlineUpcoming]}>
          {alert.daysNoticeText} (Previsto: {formatDueDate(alert.dueDate)})
        </Text>
      </View>
      <ChevronRight color={colors.muted} size={21} />
    </Pressable>
  );
}

function HandlingAlertDetailScreen({
  alert,
  onBack,
  onResolve,
}: {
  alert: AlertItem;
  onBack: () => void;
  onResolve: () => Promise<boolean>;
}) {
  const isDelayed = alert.severity === 'delayed';
  const Icon = alert.handlingType === 'Vermifugação'
    ? Pill
    : alert.handlingType === 'Parto'
      ? Baby
      : alert.handlingType === 'Secagem'
        ? Calendar
        : Syringe;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.detailTopBar}>
          <Pressable accessibilityLabel="Voltar para alertas" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </Pressable>
          <Text accessibilityRole="header" style={styles.detailTopTitle}>Detalhes do Manejo</Text>
          <View style={styles.topBarSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.detailContent}>
          <View style={[styles.detailIcon, isDelayed ? styles.delayedIcon : styles.upcomingIcon]}>
            <Icon color={isDelayed ? '#DC2626' : '#D97706'} size={32} />
          </View>
          <Text style={styles.detailTitle}>{alert.title || alert.handlingType}</Text>
          <Text style={styles.detailSubtitle}>Atividade vinculada a este alerta</Text>

          <View style={styles.detailCard}>
            <DetailRow icon={Tag} label="Identificação" value={alert.handlingId} />
            <DetailRow icon={alert.scope === 'coletivo' ? PawPrint : Bell} label="Escopo" value={alert.scope === 'coletivo' ? 'Coletivo' : 'Individual'} />
            <DetailRow icon={PawPrint} label="Animais" value={alert.targetSummary} />
            <DetailRow icon={Calendar} label="Data prevista" value={formatDueDate(alert.dueDate)} />
            <DetailRow icon={Clock} label="Situação" value={isDelayed ? alert.daysNoticeText : `Agendado · ${alert.daysNoticeText}`} />
          </View>

          <View style={[styles.detailNotice, isDelayed ? styles.delayedNotice : styles.upcomingNotice]}>
            {isDelayed ? <AlertTriangle color="#991B1B" size={20} /> : <Info color="#92400E" size={20} />}
            <Text style={[styles.detailNoticeText, isDelayed ? styles.detailNoticeDelayedText : styles.detailNoticeUpcomingText]}>
              {isDelayed
                ? 'Este manejo está atrasado. Confira os participantes e atualize a situação da atividade.'
                : 'Este manejo está programado. Confira os dados e acompanhe a atividade na data prevista.'}
            </Text>
          </View>
        </ScrollView>
        <View style={styles.detailFooter}>
          <Pressable accessibilityRole="button" onPress={onResolve} style={styles.resolveButton}>
            <Check color={colors.white} size={20} strokeWidth={2.5} />
            <Text style={styles.resolveButtonText}>Marcar como concluído</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backToAlertsButton}>
            <Text style={styles.backToAlertsText}>Voltar para alertas</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailRowIcon}><Icon color={colors.primary} size={19} /></View>
      <View style={styles.detailRowText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function EmptyAlerts() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><CheckCircle2 color={colors.primary} size={43} strokeWidth={2} /></View>
      <Text style={styles.emptyTitle}>Nenhum alerta pendente</Text>
      <Text style={styles.emptyDescription}>Todos os manejos e vacinações do rebanho estão em dia.</Text>
    </View>
  );
}

function formatDueDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

const styles = StyleSheet.create({
  safeArea: { alignItems: 'center', backgroundColor: colors.page, flex: 1 },
  screen: { backgroundColor: colors.page, flex: 1, maxWidth: 390, width: '100%' },
  topBar: { alignItems: 'center', backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 8, minHeight: 68, paddingHorizontal: 13 },
  titleGroup: { flex: 1, gap: 1, minWidth: 0 },
  pageTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, lineHeight: 27 },
  totalCount: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, lineHeight: 21 },
  offlineBadge: { alignItems: 'center', backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 4, minHeight: 36, paddingHorizontal: 7 },
  offlineText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 13 },
  permissionBanner: { alignItems: 'flex-start', backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 9, marginHorizontal: 14, marginTop: 11, padding: 11 },
  permissionIcon: { alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  permissionContent: { flex: 1, gap: 4 },
  permissionTitle: { color: '#92400E', fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  permissionDescription: { color: '#92400E', fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  permissionActions: { alignItems: 'center', flexDirection: 'row', gap: 14, marginTop: 2, minHeight: 42 },
  permissionAction: { justifyContent: 'center', minHeight: 42 },
  permissionActionText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 16 },
  filterRow: { flexDirection: 'row', gap: 7, paddingHorizontal: 14, paddingVertical: 11 },
  filterPill: { alignItems: 'center', backgroundColor: colors.input, borderColor: '#CBD5E1', borderRadius: 22, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 4 },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 15, textAlign: 'center' },
  filterTextActive: { color: colors.white },
  alertList: { gap: 18, paddingHorizontal: 14, paddingTop: 5, paddingBottom: 18 },
  section: { gap: 9 },
  sectionHeading: { alignItems: 'flex-start', flexDirection: 'row', gap: 8, paddingBottom: 1 },
  sectionHeadingText: { flex: 1, gap: 1 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 25 },
  delayedTitle: { color: '#991B1B' },
  upcomingTitle: { color: '#92400E' },
  sectionSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  alertCard: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, borderRightColor: '#E2E8F0', borderRightWidth: 1, borderTopColor: '#E2E8F0', borderTopWidth: 1, borderBottomColor: '#E2E8F0', borderBottomWidth: 1, borderLeftWidth: 4, flexDirection: 'row', gap: 9, minHeight: 94, paddingHorizontal: 10, paddingVertical: 10 },
  delayedCard: { borderLeftColor: '#DC2626' },
  upcomingCard: { borderLeftColor: '#F59E0B' },
  alertCardPressed: { opacity: 0.78 },
  alertIcon: { alignItems: 'center', borderRadius: 24, height: 44, justifyContent: 'center', width: 44 },
  delayedIcon: { backgroundColor: '#FEE2E2' },
  upcomingIcon: { backgroundColor: '#FEF3C7' },
  alertContent: { flex: 1, gap: 2 },
  alertTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, lineHeight: 23 },
  targetSummary: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  deadline: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, marginTop: 2 },
  deadlineDelayed: { color: '#DC2626' },
  deadlineUpcoming: { color: '#92400E' },
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 300, paddingHorizontal: 20 },
  emptyIcon: { alignItems: 'center', backgroundColor: colors.successBackground, borderRadius: 38, height: 76, justifyContent: 'center', marginBottom: 13, width: 76 },
  emptyTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 19, lineHeight: 26 },
  emptyDescription: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, marginTop: 5, textAlign: 'center' },
  detailTopBar: { alignItems: 'center', backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', minHeight: 64, paddingHorizontal: 12 },
  backButton: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  detailTopTitle: { color: colors.text, flex: 1, fontFamily: fonts.bold, fontSize: 19, textAlign: 'center' },
  topBarSpacer: { width: 48 },
  detailContent: { alignItems: 'center', gap: 11, padding: 18, paddingBottom: 25 },
  detailIcon: { alignItems: 'center', borderRadius: 32, height: 64, justifyContent: 'center', marginTop: 8, width: 64 },
  detailTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, lineHeight: 29 },
  detailSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  detailCard: { alignSelf: 'stretch', backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, marginTop: 7, padding: 12 },
  detailRow: { alignItems: 'center', flexDirection: 'row', gap: 9, minHeight: 63, paddingVertical: 6 },
  detailRowIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 20, height: 39, justifyContent: 'center', width: 39 },
  detailRowText: { flex: 1, gap: 2 },
  detailLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, lineHeight: 21 },
  detailValue: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  detailNotice: { alignItems: 'flex-start', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 9, padding: 12 },
  delayedNotice: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  upcomingNotice: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  detailNoticeText: { flex: 1, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  detailNoticeDelayedText: { color: '#991B1B' },
  detailNoticeUpcomingText: { color: '#92400E' },
  detailFooter: { backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: 1, gap: 8, paddingBottom: 12, paddingHorizontal: 18, paddingTop: 12 },
  resolveButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 52 },
  resolveButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16 },
  backToAlertsButton: { alignItems: 'center', borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 48 },
  backToAlertsText: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 16 },
});
