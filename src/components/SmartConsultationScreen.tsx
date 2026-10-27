import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  Home,
  Info,
  MessageSquare,
  PawPrint,
  RefreshCw,
  Scale,
  Search,
  Send,
  Sparkles,
  Syringe,
  Wifi,
  WifiOff,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';

export interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedAnimals?: {
    tagNumber: string;
    name?: string;
    category: string;
    detail: string;
  }[];
}

type TabIndex = 0 | 1 | 2 | 3;

interface SmartConsultationScreenProps {
  onTabChange: (tabIndex: number) => void;
}

const QUICK_QUESTIONS = [
  'Quais animais estão com vacinação atrasada?',
  'Quais vacas têm parto próximo?',
  'Quais animais tiveram maior ganho de peso?',
  'Quais manejos estão pendentes esta semana?',
];

const MOCK_AI_RESPONSES: Record<string, Omit<MessageItem, 'id'>> = {
  vacinas: {
    sender: 'assistant',
    text: 'Identifiquei 3 animais com vacinação contra Febre Aftosa em atraso no seu rebanho:',
    timestamp: 'Agora',
    relatedAnimals: [
      { tagNumber: '#024', name: 'Mimosa', category: 'Vaca • Holandesa', detail: 'Atrasada há 5 dias' },
      { tagNumber: '#031', name: 'Estrela', category: 'Vaca • Jersey', detail: 'Atrasada há 3 dias' },
      { tagNumber: '#044', name: 'Aurora', category: 'Novilha • Girolando', detail: 'Atrasada há 1 dia' },
    ],
  },
  partos: {
    sender: 'assistant',
    text: 'Há 1 previsão de parto registrada para os próximos dias:',
    timestamp: 'Agora',
    relatedAnimals: [
      { tagNumber: '#024', name: 'Mimosa', category: 'Vaca • Holandesa', detail: 'Previsão de parto em 7 dias (30/09/2026)' },
    ],
  },
  peso: {
    sender: 'assistant',
    text: 'Com base nas últimas pesagens cadastradas no sistema, os animais com maior evolução foram:',
    timestamp: 'Agora',
    relatedAnimals: [
      { tagNumber: '#018', name: 'Campeão', category: 'Touro • Nelore', detail: 'Última pesagem: 710 kg (+25 kg em relação ao registro anterior)' },
      { tagNumber: '#035', name: 'Trovão', category: 'Bezerro • Nelore', detail: 'Última pesagem: 185 kg (+18 kg)' },
    ],
  },
  manejos: {
    sender: 'assistant',
    text: 'Há 2 manejos pendentes registrados para esta semana:',
    timestamp: 'Agora',
    relatedAnimals: [
      { tagNumber: '#024', name: 'Mimosa', category: 'Vaca • Holandesa', detail: 'Vacinação Febre Aftosa · 25/09/2026' },
      { tagNumber: '#031', name: 'Estrela', category: 'Vaca • Jersey', detail: 'Vermifugação · 27/09/2026' },
    ],
  },
};

export function SmartConsultationScreen({ onTabChange }: SmartConsultationScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [queryHistory, setQueryHistory] = useState<MessageItem[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [queryHistory, isLoading, isOffline]);

  useEffect(() => () => {
    if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
  }, []);

  function onSendQuery(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading || isOffline) return;

    Keyboard.dismiss();
    setSearchQuery('');
    setQueryHistory((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: trimmedQuery,
        timestamp: 'Agora',
      },
    ]);
    setIsLoading(true);

    responseTimerRef.current = setTimeout(() => {
      const assistantResponse = getMockResponse(trimmedQuery);
      setQueryHistory((current) => [
        ...current,
        { ...assistantResponse, id: `assistant-${Date.now()}` },
      ]);
      setIsLoading(false);
      responseTimerRef.current = null;
    }, 700);
  }

  function onSelectQuickChip(chipText: string) {
    if (isOffline || isLoading) return;
    setSearchQuery(chipText);
    onSendQuery(chipText);
  }

  function onToggleConnection(status: boolean) {
    setIsOffline(status);
    if (status && responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
      setIsLoading(false);
    }
  }

  const canSend = searchQuery.trim().length > 0 && !isLoading && !isOffline;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <View style={styles.logoMark}>
            <Sparkles color={colors.white} size={20} strokeWidth={2.4} />
          </View>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.topBarTitle}>
            Consulta Inteligente
          </Text>
          <Pressable
            accessibilityLabel={isOffline ? 'Conexão offline. Toque para testar online' : 'Serviço ativo. Toque para testar offline'}
            accessibilityRole="button"
            onPress={() => onToggleConnection(!isOffline)}
            style={[styles.connectionBadge, isOffline && styles.connectionBadgeOffline]}
          >
            {isOffline ? <WifiOff color={colors.warning} size={16} /> : <Wifi color={colors.success} size={16} />}
            <Text style={[styles.connectionText, isOffline && styles.connectionTextOffline]}>
              {isOffline ? 'Offline' : 'Serviço ativo'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.scopeBanner}>
          <Info color={colors.primary} size={20} strokeWidth={2.2} />
          <Text style={styles.scopeText}>
            Pesquise em linguagem natural sobre o histórico, vacinas, pesagens e manejos do seu rebanho cadastrado.
          </Text>
        </View>

        <View style={styles.quickQuestions}>
          <Text style={styles.quickTitle}>Perguntas sugeridas</Text>
          <ScrollView horizontal contentContainerStyle={styles.chipsContent} showsHorizontalScrollIndicator={false}>
            {QUICK_QUESTIONS.map((question) => (
              <Pressable
                accessibilityRole="button"
                disabled={isOffline || isLoading}
                key={question}
                onPress={() => onSelectQuickChip(question)}
                style={({ pressed }) => [styles.questionChip, pressed && styles.chipPressed, (isOffline || isLoading) && styles.disabled]}
              >
                <Text style={styles.questionChipText}>{question}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          contentContainerStyle={styles.conversationContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          {isOffline ? (
            <OfflineCard onSeeAnimals={() => onTabChange(1)} onRetry={() => onToggleConnection(false)} />
          ) : null}

          {queryHistory.length === 0 && !isOffline ? <WelcomeCard /> : null}

          {queryHistory.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.loadingText}>Consultando registros cadastrados do rebanho...</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.composer}>
          <View style={styles.inputShell}>
            <Search color={colors.muted} size={20} />
            <TextInput
              accessibilityLabel="Pergunte sobre seu rebanho"
              editable={!isOffline && !isLoading}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => onSendQuery(searchQuery)}
              placeholder="Pergunte sobre seu rebanho..."
              placeholderTextColor={colors.muted}
              returnKeyType="send"
              style={styles.queryInput}
              value={searchQuery}
            />
            <Pressable
              accessibilityLabel="Enviar consulta"
              accessibilityRole="button"
              disabled={!canSend}
              onPress={() => onSendQuery(searchQuery)}
              style={({ pressed }) => [styles.sendButton, !canSend && styles.sendButtonDisabled, pressed && canSend && styles.sendButtonPressed]}
            >
              <Send color={colors.white} size={20} strokeWidth={2.4} />
            </Pressable>
          </View>
          <Text style={styles.consultOnlyNote}>Respostas informativas com base nos registros do rebanho.</Text>
        </View>

        <BottomTabBar activeTab={3} onTabChange={onTabChange} />
      </View>
    </SafeAreaView>
  );
}

function getMockResponse(query: string): Omit<MessageItem, 'id'> {
  const normalized = query.toLocaleLowerCase('pt-BR');
  if (normalized.includes('vacina') || normalized.includes('aftosa')) return MOCK_AI_RESPONSES.vacinas;
  if (normalized.includes('parto') || normalized.includes('parir')) return MOCK_AI_RESPONSES.partos;
  if (normalized.includes('peso') || normalized.includes('ganho')) return MOCK_AI_RESPONSES.peso;
  if (normalized.includes('manejo') || normalized.includes('pendente')) return MOCK_AI_RESPONSES.manejos;

  return {
    sender: 'assistant',
    text: 'Não encontrei uma resposta pronta para essa pergunta nos registros de demonstração. Tente consultar vacinações, partos, pesagens ou manejos pendentes.',
    timestamp: 'Agora',
  };
}

function WelcomeCard() {
  return (
    <View style={styles.welcome}>
      <View style={styles.welcomeIcon}>
        <MessageSquare color={colors.primary} size={30} strokeWidth={2} />
      </View>
      <Text style={styles.welcomeTitle}>Como posso ajudar com o rebanho?</Text>
      <Text style={styles.welcomeText}>Toque em uma pergunta sugerida acima ou digite sua dúvida no campo abaixo.</Text>
    </View>
  );
}

function OfflineCard({ onRetry, onSeeAnimals }: { onRetry: () => void; onSeeAnimals: () => void }) {
  return (
    <View style={styles.offlineCard}>
      <View style={styles.offlineIcon}>
        <WifiOff color={colors.warning} size={25} strokeWidth={2.2} />
      </View>
      <Text accessibilityRole="header" style={styles.offlineTitle}>Consulta Inteligente indisponível no momento.</Text>
      <Text style={styles.offlineMessage}>
        Você ainda pode consultar animais, manejos, pesagens e alertas normalmente no aparelho.
      </Text>
      <View style={styles.offlineActions}>
        <Pressable accessibilityRole="button" onPress={onSeeAnimals} style={styles.secondaryButton}>
          <PawPrint color={colors.muted} size={18} />
          <Text style={styles.secondaryButtonText}>Ver Animais Offline</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
          <RefreshCw color={colors.warning} size={18} />
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MessageBubble({ message }: { message: MessageItem }) {
  if (message.sender === 'user') {
    return (
      <View style={styles.userMessage}>
        <Text style={styles.userMessageText}>{message.text}</Text>
        <Text style={styles.userTimestamp}>{message.timestamp}</Text>
      </View>
    );
  }

  return (
    <View style={styles.answerCard}>
      <View style={styles.answerHeader}>
        <View style={styles.answerLogo}><Sparkles color={colors.primary} size={18} /></View>
        <Text style={styles.answerLabel}>RebanhoSmart IA</Text>
        <Text style={styles.answerTimestamp}>{message.timestamp}</Text>
      </View>
      <Text style={styles.answerText}>{message.text}</Text>
      {message.relatedAnimals?.map((animal) => (
        <View key={`${animal.tagNumber}-${animal.detail}`} style={styles.relatedAnimal}>
          <View style={styles.animalHeading}>
            <Text style={styles.animalTag}>{animal.tagNumber}</Text>
            {animal.name ? <Text style={styles.animalName}>{animal.name}</Text> : null}
          </View>
          <Text style={styles.animalCategory}>{animal.category}</Text>
          <View style={styles.animalDetail}>
            <DetailIcon detail={animal.detail} />
            <Text style={styles.animalDetailText}>{animal.detail}</Text>
          </View>
        </View>
      ))}
      <Text style={styles.answerFooter}>
        Você pode visualizar o prontuário completo desses animais na aba Animais ou consultar manejos pela navegação do aplicativo.
      </Text>
    </View>
  );
}

function DetailIcon({ detail }: { detail: string }) {
  if (detail.toLocaleLowerCase('pt-BR').includes('kg')) return <Scale color={colors.muted} size={17} />;
  if (detail.toLocaleLowerCase('pt-BR').includes('vacina')) return <Syringe color={colors.muted} size={17} />;
  if (detail.toLocaleLowerCase('pt-BR').includes('parto') || detail.toLocaleLowerCase('pt-BR').includes('previsão')) {
    return <Calendar color={colors.muted} size={17} />;
  }
  return <Clock color={colors.muted} size={17} />;
}

function BottomTabBar({ activeTab, onTabChange }: { activeTab: TabIndex; onTabChange: (tabIndex: number) => void }) {
  const tabs = [
    { icon: Home, label: 'Início' },
    { icon: PawPrint, label: 'Animais' },
    { icon: Bell, label: 'Alertas' },
    { icon: Sparkles, label: 'Consulta' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const active = activeTab === index;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={tab.label}
            onPress={() => onTabChange(index)}
            style={({ pressed }) => [styles.tabItem, pressed && styles.tabPressed]}
          >
            <View>
              <Icon color={active ? colors.primary : colors.muted} size={22} strokeWidth={active ? 2.5 : 2} />
              {index === 2 ? <View style={styles.alertDot} /> : null}
            </View>
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { alignItems: 'center', backgroundColor: colors.page, flex: 1 },
  screen: { backgroundColor: colors.page, flex: 1, maxWidth: 390, width: '100%' },
  topBar: { alignItems: 'center', backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 9, minHeight: 62, paddingHorizontal: 14 },
  logoMark: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 10, height: 38, justifyContent: 'center', width: 38 },
  topBarTitle: { color: colors.text, flex: 1, fontFamily: fonts.bold, fontSize: 20, lineHeight: 27 },
  connectionBadge: { alignItems: 'center', backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 5, justifyContent: 'center', minHeight: 34, paddingHorizontal: 9 },
  connectionBadgeOffline: { backgroundColor: colors.warningBackground, borderColor: colors.warningBorder },
  connectionText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 14 },
  connectionTextOffline: { color: colors.warning },
  scopeBanner: { alignItems: 'flex-start', backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 12, padding: 12 },
  scopeText: { color: colors.muted, flex: 1, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  quickQuestions: { gap: 7, paddingTop: 13 },
  quickTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 17, lineHeight: 23, paddingHorizontal: 16 },
  chipsContent: { gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  questionChip: { alignItems: 'center', backgroundColor: colors.input, borderColor: '#CBD5E1', borderRadius: 22, borderWidth: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: 14 },
  questionChipText: { color: colors.primary, fontFamily: fonts.medium, fontSize: 16 },
  chipPressed: { backgroundColor: '#DCE7FB' },
  disabled: { opacity: 0.6 },
  conversationContent: { flexGrow: 1, gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  welcome: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 210, paddingHorizontal: 15 },
  welcomeIcon: { alignItems: 'center', backgroundColor: colors.input, borderRadius: 36, height: 72, justifyContent: 'center', marginBottom: 13, width: 72 },
  welcomeTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 18, lineHeight: 25, textAlign: 'center' },
  welcomeText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, marginTop: 6, textAlign: 'center' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderRadius: 14, borderBottomRightRadius: 4, maxWidth: '88%', paddingHorizontal: 14, paddingVertical: 10 },
  userMessageText: { color: colors.white, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  userTimestamp: { color: '#E2F5E4', fontFamily: fonts.regular, fontSize: 14, marginTop: 4, textAlign: 'right' },
  answerCard: { alignSelf: 'stretch', backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, gap: 10, padding: 13 },
  answerHeader: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  answerLogo: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 14, height: 28, justifyContent: 'center', width: 28 },
  answerLabel: { color: colors.primary, flex: 1, fontFamily: fonts.semibold, fontSize: 16 },
  answerTimestamp: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14 },
  answerText: { color: colors.text, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  relatedAnimal: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderRadius: 9, borderWidth: 1, gap: 3, padding: 10 },
  animalHeading: { alignItems: 'center', flexDirection: 'row', gap: 7 },
  animalTag: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  animalName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16 },
  animalCategory: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  animalDetail: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 2 },
  animalDetailText: { color: colors.muted, flex: 1, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  answerFooter: { borderTopColor: '#E2E8F0', borderTopWidth: 1, color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, paddingTop: 9 },
  loadingCard: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 9, minHeight: 48, paddingHorizontal: 12 },
  loadingText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16 },
  offlineCard: { alignItems: 'center', backgroundColor: colors.warningBackground, borderColor: colors.warningBorder, borderRadius: 12, borderWidth: 1, gap: 9, marginTop: 6, padding: 16 },
  offlineIcon: { alignItems: 'center', backgroundColor: '#FDE68A', borderRadius: 26, height: 52, justifyContent: 'center', width: 52 },
  offlineTitle: { color: colors.warning, fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, textAlign: 'center' },
  offlineMessage: { color: colors.warning, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  offlineActions: { alignSelf: 'stretch', gap: 8, marginTop: 4 },
  secondaryButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: '#D6A63B', borderRadius: 9, borderWidth: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 48 },
  secondaryButtonText: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 16 },
  retryButton: { alignItems: 'center', flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 48 },
  retryButtonText: { color: colors.warning, fontFamily: fonts.semibold, fontSize: 16 },
  composer: { backgroundColor: colors.page, gap: 5, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 7 },
  inputShell: { alignItems: 'center', backgroundColor: colors.white, borderColor: '#CBD5E1', borderRadius: 28, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 54, paddingLeft: 15, paddingRight: 4 },
  queryInput: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 16, minHeight: 50 },
  sendButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 24, height: 46, justifyContent: 'center', width: 46 },
  sendButtonDisabled: { backgroundColor: '#94A3B8' },
  sendButtonPressed: { backgroundColor: colors.primaryActive },
  consultOnlyNote: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, textAlign: 'center' },
  tabBar: { backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', height: 66, paddingBottom: 3 },
  tabItem: { alignItems: 'center', flex: 1, gap: 3, justifyContent: 'center' },
  tabPressed: { opacity: 0.7 },
  tabLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
  tabLabelActive: { color: colors.primary, fontFamily: fonts.bold },
  alertDot: { backgroundColor: '#B91C1C', borderColor: colors.white, borderRadius: 5, borderWidth: 1, height: 9, position: 'absolute', right: -4, top: -2, width: 9 },
});
