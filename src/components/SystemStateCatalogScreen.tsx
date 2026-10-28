import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUp,
  BellOff,
  CheckCircle2,
  ChevronRight,
  CloudOff,
  Database,
  Filter,
  RefreshCw,
  WifiOff,
  X,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MOCK_ANIMALS } from './AnimalListScreen';
import { colors, fonts } from '../theme';
import { ScreenSafeArea as SafeAreaView } from './ScreenSafeArea';

export type SystemStateKey =
  | 'loading'
  | 'offline'
  | 'cache'
  | 'permission_denied'
  | 'extreme_content'
  | 'concurrency_conflict';

export interface StateCatalogProps {
  initialState?: SystemStateKey;
  onRetryConnection?: () => void;
  onContinueOffline?: () => void;
  onOpenSettings?: () => void;
  onRefreshConflictData?: () => void;
  onCancelAction?: () => void;
}

const STATE_OPTIONS: { key: SystemStateKey; label: string }[] = [
  { key: 'loading', label: 'Carregando' },
  { key: 'offline', label: 'Sem conexão' },
  { key: 'cache', label: 'Dados em cache' },
  { key: 'permission_denied', label: 'Permissão negada' },
  { key: 'extreme_content', label: 'Conteúdo extremo' },
  { key: 'concurrency_conflict', label: 'Conflito' },
];

const EXTREME_NOTE =
  'Animal apresentou leve sensibilidade podal pós-manejo na invernada baixa durante o período de chuvas intensas. Realizada limpeza com solução antisséptica tópica no membro anterior esquerdo e isolamento temporário para repouso na baia de recuperação. Avaliação veterinária preventiva agendada para 28/09. Produtor orientou reforço de suplementação mineral e conferência rigorosa da ingestão hídrica durante o turno matutino, garantindo estabilidade e acompanhamento diário sem desvios do protocolo sanitário estabelecido para o plantel.';

export function SystemStateCatalogScreen({
  initialState = 'loading',
  onRetryConnection,
  onContinueOffline,
  onOpenSettings,
  onRefreshConflictData,
  onCancelAction,
}: StateCatalogProps) {
  const [selectedState, setSelectedState] = useState<SystemStateKey>(initialState);
  const [isLoading, setIsLoading] = useState(initialState === 'loading');
  const [showReducedHerd, setShowReducedHerd] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(true);
  const listRef = useRef<ScrollView>(null);

  function selectState(state: SystemStateKey) {
    setSelectedState(state);
    setIsLoading(state === 'loading');
    setShowReducedHerd(false);
  }

  function retryLoading() {
    onRetryConnection?.();
    setIsLoading(true);
  }

  function cancelLoading() {
    setIsLoading(false);
    onCancelAction?.();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.catalogHeader}>
          <Text accessibilityRole="header" style={styles.catalogTitle}>Estados do Sistema</Text>
          <Text style={styles.catalogSubtitle}>Selecione um estado para visualizar</Text>
          <ScrollView horizontal contentContainerStyle={styles.stateSelector} showsHorizontalScrollIndicator={false}>
            {STATE_OPTIONS.map((option) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedState === option.key }}
                key={option.key}
                onPress={() => selectState(option.key)}
                style={[styles.stateChip, selectedState === option.key && styles.stateChipActive]}
              >
                <Text style={[styles.stateChipText, selectedState === option.key && styles.stateChipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {selectedState === 'extreme_content' ? (
          <View style={styles.extremeLayout}>
            <ScrollView
              contentContainerStyle={styles.extremeContent}
              ref={listRef}
              showsVerticalScrollIndicator={false}
            >
              <ExtremeContentState showReducedHerd={showReducedHerd} />
            </ScrollView>
            <View style={styles.extremeActions}>
              <PrimaryButton icon={ArrowUp} label="Voltar ao topo da lista" onPress={() => listRef.current?.scrollTo({ y: 0, animated: true })} />
              <SecondaryButton
                icon={Filter}
                label={showReducedHerd ? 'Mostrar plantel completo' : 'Filtrar para reduzir volume'}
                onPress={() => setShowReducedHerd((current) => !current)}
              />
            </View>
          </View>
        ) : selectedState === 'concurrency_conflict' ? (
          <ConflictState
            onCancel={onCancelAction}
            onRefresh={onRefreshConflictData}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.stateContent} showsVerticalScrollIndicator={false}>
            {selectedState === 'loading' ? (
              <LoadingState
                isLoading={isLoading}
                onCancel={cancelLoading}
                onRetry={retryLoading}
              />
            ) : null}
            {selectedState === 'offline' ? (
              <OfflineState onContinue={onContinueOffline} onRetry={onRetryConnection} />
            ) : null}
            {selectedState === 'cache' ? <CacheState onContinue={onContinueOffline} /> : null}
            {selectedState === 'permission_denied' ? (
              <PermissionDeniedState
                onContinue={onCancelAction}
                onOpenSettings={onOpenSettings}
                showBanner={showPermissionBanner}
                onDismissBanner={() => setShowPermissionBanner(false)}
              />
            ) : null}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function LoadingState({
  isLoading,
  onCancel,
  onRetry,
}: {
  isLoading: boolean;
  onCancel: () => void;
  onRetry: () => void;
}) {
  const shimmerOpacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
        Animated.timing(shimmerOpacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
      ]),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerOpacity]);

  return (
    <View style={styles.loadingState}>
      <View style={styles.skeletonHeader}>
        <Animated.View style={[styles.skeletonAvatar, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.skeletonTitle, { opacity: shimmerOpacity }]} />
      </View>
      <Animated.View style={[styles.skeletonBlock, styles.skeletonMetric, { opacity: shimmerOpacity }]} />
      {[0, 1, 2].map((item) => (
        <Animated.View key={item} style={[styles.skeletonBlock, styles.skeletonHandling, { opacity: shimmerOpacity }]} />
      ))}
      <View style={styles.loadingFeedback}>
        {isLoading ? <ActivityIndicator color={colors.primary} size="large" /> : <CloudOff color={colors.muted} size={30} />}
        <Text style={styles.loadingTitle}>
          {isLoading ? 'Carregando registros do rebanho...' : 'Carregamento cancelado'}
        </Text>
        <Text style={styles.loadingDescription}>
          Lendo dados salvos no armazenamento local do aparelho.
        </Text>
      </View>
      <View style={styles.actionStack}>
        <SecondaryButton label="Cancelar carregamento" onPress={onCancel} />
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.actionLinkButton}>
          <Text style={styles.actionLink}>Tentar novamente mais tarde</Text>
        </Pressable>
      </View>
    </View>
  );
}

function OfflineState({
  onContinue,
  onRetry,
}: {
  onContinue?: () => void;
  onRetry?: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
  }, []);

  function retry() {
    setIsRetrying(true);
    onRetry?.();
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = setTimeout(() => {
      setIsRetrying(false);
      retryTimer.current = null;
    }, 900);
  }

  return (
    <View style={styles.centeredState}>
      <View style={styles.largeIcon}><WifiOff color={colors.muted} size={38} strokeWidth={2} /></View>
      <Text style={styles.stateTitle}>Sem sinal de internet no momento</Text>
      <Text style={styles.stateDescription}>
        O RebanhoSmart continua funcionando normalmente. Novos cadastros, pesagens e manejos realizados agora serão salvos diretamente no aparelho com o selo Pendente de sincronização.
      </Text>
      <View style={styles.guaranteeCard}>
        <CheckCircle2 color={colors.primary} size={22} />
        <Text style={styles.guaranteeText}>
          Seus dados locais estão protegidos e serão sincronizados automaticamente assim que o sinal de internet retornar.
        </Text>
      </View>
      <View style={styles.actionStack}>
        <PrimaryButton label="Trabalhar em modo offline" onPress={onContinue} />
        <SecondaryButton icon={isRetrying ? undefined : RefreshCw} label={isRetrying ? 'Verificando conexão...' : 'Tentar reconectar'} onPress={retry} />
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.actionLinkButton}>
          <Text style={styles.actionLink}>Verificar configurações de rede</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CacheState({ onContinue }: { onContinue?: () => void }) {
  return (
    <View style={styles.cacheState}>
      <View style={styles.cacheBanner}>
        <Database color="#B45309" size={23} />
        <View style={styles.flexContent}>
          <Text style={styles.cacheTitle}>ESTADO: DADOS EM CACHE (OFFLINE)</Text>
          <Text style={styles.cacheSubtitle}>Última atualização registrada: Hoje às 08:35</Text>
        </View>
      </View>
      <CacheRecord title="Manejo #104 - Vacinação Febre Aftosa" status="Disponível offline" tone="offline" />
      <CacheRecord title="Novo animal cadastrado #041 - Brisa" status="Pendente de sincronização" tone="pending" />
      <CacheRecord title="Pesagem animal #024 - 420 kg" status="Sincronizado" tone="synced" />
      <View style={styles.actionStack}>
        <PrimaryButton label="Continuar operando no campo" onPress={onContinue} />
        <Text style={styles.cacheFooter}>
          Os lançamentos feitos no campo permanecem gravados com segurança no seu aparelho.
        </Text>
      </View>
    </View>
  );
}

function CacheRecord({
  title,
  status,
  tone,
}: {
  title: string;
  status: string;
  tone: 'offline' | 'pending' | 'synced';
}) {
  const badgeStyle = tone === 'pending' ? styles.pendingBadge : tone === 'synced' ? styles.syncedBadge : styles.availableBadge;
  const textStyle = tone === 'pending' ? styles.pendingText : tone === 'synced' ? styles.syncedText : styles.availableText;

  return (
    <View style={styles.cacheRecord}>
      <View style={styles.cacheRecordText}>
        <Text style={styles.cacheRecordTitle}>{title}</Text>
        <View style={[styles.cacheBadge, badgeStyle]}>
          <Text style={[styles.cacheBadgeText, textStyle]}>{status}</Text>
        </View>
      </View>
      <ChevronRight color={colors.muted} size={20} />
    </View>
  );
}

function PermissionDeniedState({
  onContinue,
  onOpenSettings,
  showBanner,
  onDismissBanner,
}: {
  onContinue?: () => void;
  onOpenSettings?: () => void;
  showBanner: boolean;
  onDismissBanner: () => void;
}) {
  return (
    <View style={styles.centeredState}>
      <View style={styles.permissionLargeIcon}><BellOff color="#D97706" size={38} strokeWidth={2} /></View>
      <Text style={styles.stateTitle}>Notificações do sistema desativadas</Text>
      <Text style={styles.stateDescription}>As notificações externas estão desativadas nas configurações do celular.</Text>
      {showBanner ? (
        <View style={styles.alertsGuarantee}>
          <CheckCircle2 color="#1D4ED8" size={23} />
          <Text style={styles.alertsGuaranteeText}>
            Fique tranquilo: todos os alertas de vacinação e manejos atrasados continuam 100% visíveis dentro da aba Alertas do aplicativo.
          </Text>
          <Pressable accessibilityLabel="Dispensar aviso" onPress={onDismissBanner} style={styles.dismissButton}>
            <X color={colors.muted} size={19} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>Para reativar, se desejar:</Text>
        <Text style={styles.stepText}>1. Abra as Configurações do seu aparelho.</Text>
        <Text style={styles.stepText}>2. Acesse Notificações &gt; RebanhoSmart e marque “Permitir”.</Text>
      </View>
      <View style={styles.actionStack}>
        <PrimaryButton icon={RefreshCw} label="Abrir configurações do celular" onPress={onOpenSettings} />
        <SecondaryButton label="Continuar sem notificações externas" onPress={onContinue} />
      </View>
    </View>
  );
}

function ExtremeContentState({ showReducedHerd }: { showReducedHerd: boolean }) {
  const visibleAnimals = showReducedHerd ? MOCK_ANIMALS.slice(0, 8) : MOCK_ANIMALS;

  return (
    <View style={styles.extremeState}>
      <View style={styles.extremeTopBar}>
        <Text style={styles.extremeTitle}>Prontuário — Conteúdo Extremo</Text>
        <Text style={styles.extremeSubtitle}>#024 - Mimosa</Text>
      </View>
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Observações</Text>
        <Text style={styles.noteText}>{EXTREME_NOTE}</Text>
      </View>
      <Text style={styles.rosterTitle}>Plantel ativo ({visibleAnimals.length})</Text>
      {visibleAnimals.map((animal) => (
        <View key={animal.id} style={styles.rosterItem}>
          <View style={styles.rosterTag}><Text style={styles.rosterTagText}>{animal.brinco}</Text></View>
          <View style={styles.flexContent}>
            <Text style={styles.rosterName}>{animal.nome || 'Sem nome registrado'}</Text>
            <Text style={styles.rosterMeta}>{animal.categoria} • {animal.raca}</Text>
          </View>
          <ChevronRight color={colors.muted} size={19} />
        </View>
      ))}
    </View>
  );
}

function ConflictState({
  onCancel,
  onRefresh,
}: {
  onCancel?: () => void;
  onRefresh?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRefreshed, setIsRefreshed] = useState(false);

  function refresh() {
    onRefresh?.();
    setIsRefreshed(true);
    setIsOpen(false);
  }

  function cancel() {
    onCancel?.();
    setIsOpen(false);
  }

  return (
    <View style={styles.conflictBackground}>
      <View style={styles.conflictPreview}>
        <Text style={styles.previewTitle}>Editar animal</Text>
        <View style={styles.previewField} />
        <View style={styles.previewField} />
        <View style={styles.previewField} />
        <Text style={styles.previewSaved}>{isRefreshed ? 'Dados atualizados. Revise antes de salvar novamente.' : 'Alterações pendentes'}</Text>
      </View>
      <Modal animationType="fade" onRequestClose={cancel} transparent visible={isOpen}>
        <View style={styles.modalOverlay}>
          <Pressable accessibilityLabel="Fechar diálogo" onPress={cancel} style={StyleSheet.absoluteFill} />
          <View accessibilityViewIsModal style={styles.conflictModal}>
            <View style={styles.conflictIcon}><AlertTriangle color="#DC2626" size={28} strokeWidth={2.2} /></View>
            <Text accessibilityRole="header" style={styles.conflictTitle}>Conflito de alteração</Text>
            <Text style={styles.conflictMessage}>
              Este registro foi alterado em outra sessão. Atualize os dados antes de salvar novamente.
            </Text>
            <Text style={styles.conflictExplanation}>
              Para evitar a perda de informações recentes, recarregue os dados mais atuais do animal antes de tentar gravar.
            </Text>
            <View style={styles.actionStack}>
              <PrimaryButton icon={RefreshCw} label="Atualizar dados" onPress={refresh} />
              <SecondaryButton label="Cancelar" onPress={cancel} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PrimaryButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon?: typeof RefreshCw;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}>
      {Icon ? <Icon color={colors.white} size={19} strokeWidth={2.4} /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon?: typeof RefreshCw;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}>
      {Icon ? <Icon color={colors.text} size={19} /> : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { alignItems: 'center', backgroundColor: colors.page, flex: 1 },
  screen: { backgroundColor: colors.page, flex: 1, maxWidth: 390, width: '100%' },
  catalogHeader: { backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, paddingTop: 12 },
  catalogTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, paddingHorizontal: 16 },
  catalogSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, paddingHorizontal: 16 },
  stateSelector: { gap: 7, paddingHorizontal: 14, paddingVertical: 10 },
  stateChip: { alignItems: 'center', backgroundColor: colors.input, borderColor: colors.border, borderRadius: 19, borderWidth: 1, justifyContent: 'center', minHeight: 42, paddingHorizontal: 12 },
  stateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stateChipText: { color: colors.primary, fontFamily: fonts.medium, fontSize: 15 },
  stateChipTextActive: { color: colors.white, fontFamily: fonts.bold },
  stateContent: { flexGrow: 1, padding: 18, paddingBottom: 24 },
  loadingState: { flex: 1, gap: 12 },
  skeletonHeader: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 3 },
  skeletonAvatar: { backgroundColor: '#CBD5E1', borderRadius: 22, height: 44, width: 44 },
  skeletonTitle: { backgroundColor: '#CBD5E1', borderRadius: 6, height: 20, width: '55%' },
  skeletonBlock: { backgroundColor: '#E2E8F0', borderRadius: 11 },
  skeletonMetric: { height: 110 },
  skeletonHandling: { height: 74 },
  loadingFeedback: { alignItems: 'center', gap: 9, paddingVertical: 16 },
  loadingTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 23, textAlign: 'center' },
  loadingDescription: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  actionStack: { gap: 8, marginTop: 8, width: '100%' },
  primaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 52, paddingHorizontal: 12 },
  primaryButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  primaryPressed: { backgroundColor: colors.primaryActive },
  secondaryButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 48, paddingHorizontal: 12 },
  secondaryButtonText: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  secondaryPressed: { backgroundColor: '#F1F5F9' },
  actionLinkButton: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  actionLink: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, textAlign: 'center', textDecorationLine: 'underline' },
  centeredState: { alignItems: 'center', flexGrow: 1, gap: 14, justifyContent: 'center', paddingVertical: 18 },
  largeIcon: { alignItems: 'center', backgroundColor: '#E2E8F0', borderRadius: 42, height: 84, justifyContent: 'center', width: 84 },
  stateTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, lineHeight: 29, textAlign: 'center' },
  stateDescription: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  guaranteeCard: { alignItems: 'flex-start', alignSelf: 'stretch', backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 9, padding: 13 },
  guaranteeText: { color: colors.success, flex: 1, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  cacheState: { flex: 1, gap: 11 },
  cacheBanner: { alignItems: 'flex-start', backgroundColor: colors.warningBackground, borderBottomColor: colors.warningBorder, borderBottomWidth: 2, borderRadius: 10, flexDirection: 'row', gap: 10, padding: 13 },
  flexContent: { flex: 1 },
  cacheTitle: { color: colors.warning, fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 },
  cacheSubtitle: { color: colors.warning, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, marginTop: 3 },
  cacheRecord: { alignItems: 'center', backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 80, padding: 12 },
  cacheRecordText: { flex: 1, gap: 7 },
  cacheRecordTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  cacheBadge: { alignSelf: 'flex-start', borderRadius: 7, minHeight: 29, justifyContent: 'center', paddingHorizontal: 9 },
  cacheBadgeText: { fontFamily: fonts.bold, fontSize: 15 },
  availableBadge: { backgroundColor: colors.input },
  availableText: { color: '#1E3A8A' },
  pendingBadge: { backgroundColor: colors.warningBackground },
  pendingText: { color: '#B45309' },
  syncedBadge: { backgroundColor: colors.successBackground },
  syncedText: { color: colors.success },
  cacheFooter: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  permissionLargeIcon: { alignItems: 'center', backgroundColor: colors.warningBackground, borderRadius: 42, height: 84, justifyContent: 'center', width: 84 },
  alertsGuarantee: { alignItems: 'flex-start', alignSelf: 'stretch', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 9, padding: 12 },
  alertsGuaranteeText: { color: '#1E3A8A', flex: 1, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  dismissButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 },
  stepsCard: { alignSelf: 'stretch', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 10, borderWidth: 1, gap: 6, padding: 13 },
  stepsTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  stepText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  extremeLayout: { flex: 1 },
  extremeContent: { gap: 12, padding: 16, paddingBottom: 20 },
  extremeState: { gap: 12 },
  extremeTopBar: { backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, borderRadius: 10, gap: 4, padding: 14 },
  extremeTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 19, lineHeight: 26 },
  extremeSubtitle: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  noteCard: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 11, borderWidth: 1, gap: 7, padding: 16 },
  noteTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  noteText: { color: colors.text, fontFamily: fonts.regular, fontSize: 16, lineHeight: 25 },
  rosterTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 19, lineHeight: 26, marginTop: 3 },
  rosterItem: { alignItems: 'center', backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 9, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 66, padding: 10 },
  rosterTag: { backgroundColor: '#FEF3C7', borderRadius: 6, justifyContent: 'center', minHeight: 30, paddingHorizontal: 8 },
  rosterTagText: { color: '#92400E', fontFamily: fonts.bold, fontSize: 16 },
  rosterName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  rosterMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  extremeActions: { backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: 1, gap: 8, padding: 12, paddingHorizontal: 16 },
  conflictBackground: { backgroundColor: '#E2E8F0', flex: 1, justifyContent: 'center', padding: 18 },
  conflictPreview: { backgroundColor: colors.page, borderRadius: 12, gap: 14, padding: 18 },
  previewTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 },
  previewField: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 9, borderWidth: 1, height: 52 },
  previewSaved: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  modalOverlay: { alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  conflictModal: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, gap: 11, maxWidth: 360, padding: 22, width: '100%' },
  conflictIcon: { alignItems: 'center', backgroundColor: colors.errorBackground, borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  conflictTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, lineHeight: 27, textAlign: 'center' },
  conflictMessage: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  conflictExplanation: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, textAlign: 'center' },
});
