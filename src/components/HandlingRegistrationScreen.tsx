import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Baby,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Droplets,
  Heart,
  Info,
  Pill,
  RotateCcw,
  Search,
  Square,
  Syringe,
  User,
  Users,
  X,
} from 'lucide-react-native';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';
import { ScreenSafeArea as SafeAreaView } from './ScreenSafeArea';

export type HandlingType = 'Vacinação' | 'Vermifugação' | 'Inseminação' | 'Parto' | 'Secagem';
export type HandlingScope = 'individual' | 'coletivo';
export type HandlingStatus = 'Agendado' | 'Realizado';

export interface HandlingAnimal {
  id: string;
  tagNumber: string;
  name?: string;
  category: 'Vaca' | 'Novilha' | 'Bezerro' | 'Touro';
  breed: string;
  hasPendingAlert?: boolean;
}

export interface HandlingFormData {
  type: HandlingType;
  scope: HandlingScope;
  targetAnimalIds: string[];
  scheduledDate: string;
  status: HandlingStatus;
  notes: string;
  executionSummary?: {
    total: number;
    completed: number;
    pendingTags: string[];
  };
}

interface HandlingRegistrationScreenProps {
  animals: HandlingAnimal[];
  initialAnimalId: string;
  onCancel: () => void;
  onConfirmHandlingSave: (formData: HandlingFormData) => Promise<boolean>;
  onReturnToDashboard: () => void;
  onViewHandlingDetails: () => void;
}

type FlowStep = 'form' | 'selection' | 'review' | 'success';
type CategoryFilter = 'Todos' | HandlingAnimal['category'];
type HandlingIcon = typeof Syringe;

const HANDLING_OPTIONS: { type: HandlingType; icon: HandlingIcon }[] = [
  { type: 'Vacinação', icon: Syringe },
  { type: 'Vermifugação', icon: Pill },
  { type: 'Inseminação', icon: Heart },
  { type: 'Parto', icon: Baby },
  { type: 'Secagem', icon: Droplets },
];

const CATEGORIES: CategoryFilter[] = ['Todos', 'Vaca', 'Novilha', 'Bezerro', 'Touro'];

export function HandlingRegistrationScreen({
  animals,
  initialAnimalId,
  onCancel,
  onConfirmHandlingSave,
  onReturnToDashboard,
  onViewHandlingDetails,
}: HandlingRegistrationScreenProps) {
  const [step, setStep] = useState<FlowStep>('form');
  const [type, setType] = useState<HandlingType>('Vacinação');
  const [scope, setScope] = useState<HandlingScope>('individual');
  const [targetAnimalIds, setTargetAnimalIds] = useState<string[]>([initialAnimalId]);
  const [pendingAnimalIds, setPendingAnimalIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState(getTodayDate());
  const [status, setStatus] = useState<HandlingStatus>('Agendado');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Todos');
  const [formError, setFormError] = useState<string | null>(null);
  const [savedForm, setSavedForm] = useState<HandlingFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedAnimals = useMemo(
    () => animals.filter((animal) => targetAnimalIds.includes(animal.id)),
    [animals, targetAnimalIds],
  );

  function updateScope(nextScope: HandlingScope) {
    setScope(nextScope);
    if (nextScope === 'individual') {
      const selectedId = targetAnimalIds.includes(initialAnimalId) ? initialAnimalId : targetAnimalIds[0];
      setTargetAnimalIds(selectedId ? [selectedId] : []);
    }
    setFormError(null);
  }

  function toggleAnimal(id: string) {
    setTargetAnimalIds((current) => {
      if (current.includes(id)) {
        return current.filter((animalId) => animalId !== id);
      }
      return scope === 'individual' ? [id] : [...current, id];
    });
  }

  function togglePendingAnimal(id: string) {
    setPendingAnimalIds((current) =>
      current.includes(id) ? current.filter((animalId) => animalId !== id) : [...current, id],
    );
  }

  function handleContinue() {
    if (!isValidDate(scheduledDate)) {
      setFormError('Informe uma data válida no formato DD/MM/AAAA.');
      return;
    }
    if (targetAnimalIds.length === 0) {
      setFormError('Selecione pelo menos um animal para o manejo.');
      return;
    }

    setFormError(null);
    setStep('review');
  }

  async function handleConfirm() {
    if (isSaving) return;
    const pendingTags = status === 'Realizado'
      ? selectedAnimals.filter((animal) => pendingAnimalIds.includes(animal.id)).map((animal) => animal.tagNumber)
      : [];
    const formData: HandlingFormData = {
      type,
      scope,
      targetAnimalIds,
      scheduledDate: toIsoDate(scheduledDate),
      status,
      notes: notes.trim(),
      ...(status === 'Realizado'
        ? {
            executionSummary: {
              total: selectedAnimals.length,
              completed: selectedAnimals.length - pendingTags.length,
              pendingTags,
            },
          }
        : {}),
    };

    setIsSaving(true);
    const saved = await onConfirmHandlingSave(formData);
    if (saved) {
      setSavedForm(formData);
      setStep('success');
    }
    setIsSaving(false);
  }

  function goBack() {
    if (step === 'selection') {
      setStep('form');
    } else if (step === 'review') {
      setStep('form');
    } else {
      onCancel();
    }
  }

  if (step === 'selection') {
    return (
      <AnimalSelectionStep
        animals={animals}
        category={selectedCategory}
        onBack={goBack}
        onChangeCategory={setSelectedCategory}
        onConfirm={() => {
          setStep('form');
          setFormError(null);
        }}
        onToggleAnimal={toggleAnimal}
        scope={scope}
        searchTerm={searchTerm}
        selectedIds={targetAnimalIds}
        setSearchTerm={setSearchTerm}
      />
    );
  }

  if (step === 'review') {
    return (
      <ReviewStep
        animals={selectedAnimals}
        form={{ type, scope, scheduledDate, status, notes }}
        onBack={goBack}
        onConfirm={handleConfirm}
        onTogglePending={togglePendingAnimal}
        pendingAnimalIds={pendingAnimalIds}
      />
    );
  }

  if (step === 'success' && savedForm) {
    return (
      <SuccessStep
        animals={selectedAnimals}
        form={savedForm}
        onReturnToDashboard={onReturnToDashboard}
        onViewHandlingDetails={onViewHandlingDetails}
      />
    );
  }

  const currentAnimal = selectedAnimals[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <TopBar onBack={goBack} title="Registrar Manejo" />
        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tipo de manejo *</Text>
            <Text style={styles.sectionHint}>Selecione uma opção</Text>
          </View>
          <Text style={styles.groupLabel}>Sanitários</Text>
          <View style={styles.typeRow}>
            {HANDLING_OPTIONS.slice(0, 2).map((option) => (
              <HandlingTypeButton
                active={type === option.type}
                icon={option.icon}
                key={option.type}
                onPress={() => setType(option.type)}
                title={option.type}
              />
            ))}
          </View>
          <Text style={styles.groupLabel}>Reprodutivos</Text>
          <View style={styles.typeRow}>
            {HANDLING_OPTIONS.slice(2).map((option) => (
              <HandlingTypeButton
                active={type === option.type}
                icon={option.icon}
                key={option.type}
                onPress={() => setType(option.type)}
                title={option.type}
              />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Escopo da aplicação</Text>
          <View style={styles.segment}>
            <SegmentButton active={scope === 'individual'} icon={User} label="Individual" onPress={() => updateScope('individual')} />
            <SegmentButton active={scope === 'coletivo'} icon={Users} label="Coletivo" onPress={() => updateScope('coletivo')} />
          </View>

          <Text style={styles.sectionTitle}>Animais alvo</Text>
          <View style={styles.targetCard}>
            {scope === 'coletivo' ? (
              <>
                <View style={styles.targetSummary}>
                  <Users color={colors.primary} size={22} />
                  <View style={styles.targetText}>
                    <Text style={styles.targetTitle}>{targetAnimalIds.length} animais selecionados</Text>
                    <Text style={styles.targetHint}>Participantes do manejo coletivo</Text>
                  </View>
                </View>
                <ActionButton label="Alterar lista coletiva" onPress={() => setStep('selection')} />
              </>
            ) : (
              <>
                <View style={styles.targetSummary}>
                  <User color={colors.primary} size={22} />
                  <View style={styles.targetText}>
                    <Text style={styles.targetTitle}>
                      {currentAnimal ? `${currentAnimal.tagNumber}${currentAnimal.name ? ` - ${currentAnimal.name}` : ''}` : 'Nenhum animal selecionado'}
                    </Text>
                    <Text style={styles.targetHint}>
                      {currentAnimal ? `${currentAnimal.category} • ${currentAnimal.breed}` : 'Escolha um animal do rebanho'}
                    </Text>
                  </View>
                </View>
                <ActionButton label="Trocar animal" onPress={() => setStep('selection')} />
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>Data prevista *</Text>
          <View style={styles.dateField}>
            <Calendar color={colors.primary} size={20} />
            <TextInput
              accessibilityLabel="Data prevista do manejo"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              onChangeText={(value) => {
                setScheduledDate(value);
                setFormError(null);
              }}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.muted}
              style={styles.dateInput}
              value={scheduledDate}
            />
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: status === 'Realizado' }}
            onPress={() => {
              setStatus((current) => current === 'Realizado' ? 'Agendado' : 'Realizado');
              setScheduledDate(getTodayDate());
            }}
            style={styles.todayOption}
          >
            {status === 'Realizado' ? <CheckSquare color={colors.primary} size={22} /> : <Square color={colors.muted} size={22} />}
            <Text style={styles.todayText}>Marcar como realizado hoje</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Situação do registro</Text>
          <View style={styles.segment}>
            <SegmentButton
              active={status === 'Agendado'}
              icon={Clock}
              label="Agendado / Pendente"
              onPress={() => setStatus('Agendado')}
              tone="warning"
            />
            <SegmentButton
              active={status === 'Realizado'}
              icon={CheckCircle2}
              label="Realizado"
              onPress={() => setStatus('Realizado')}
              tone="success"
            />
          </View>

          <Text style={styles.sectionTitle}>Observações de campo</Text>
          <TextInput
            accessibilityLabel="Observações de campo"
            multiline
            onChangeText={setNotes}
            placeholder="Ex: Aplicação programada para o plantel..."
            placeholderTextColor={colors.muted}
            style={styles.notesInput}
            textAlignVertical="top"
            value={notes}
          />
          {formError ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{formError}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label="Continuar" onPress={handleContinue} />
          <SecondaryButton label="Cancelar" onPress={onCancel} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function AnimalSelectionStep({
  animals,
  category,
  onBack,
  onChangeCategory,
  onConfirm,
  onToggleAnimal,
  scope,
  searchTerm,
  selectedIds,
  setSearchTerm,
}: {
  animals: HandlingAnimal[];
  category: CategoryFilter;
  onBack: () => void;
  onChangeCategory: (category: CategoryFilter) => void;
  onConfirm: () => void;
  onToggleAnimal: (id: string) => void;
  scope: HandlingScope;
  searchTerm: string;
  selectedIds: string[];
  setSearchTerm: (value: string) => void;
}) {
  const filteredAnimals = useMemo(() => animals.filter((animal) => {
    const matchesCategory = category === 'Todos' || animal.category === category;
    const query = searchTerm.trim().toLocaleLowerCase('pt-BR');
    const matchesSearch = !query
      || animal.tagNumber.toLocaleLowerCase('pt-BR').includes(query)
      || (animal.name || '').toLocaleLowerCase('pt-BR').includes(query);
    return matchesCategory && matchesSearch;
  }), [animals, category, searchTerm]);

  function toggleAll() {
    const allSelected = selectedIds.length === animals.length;
    if (allSelected) {
      animals.forEach((animal) => {
        if (selectedIds.includes(animal.id)) onToggleAnimal(animal.id);
      });
      return;
    }
    if (scope === 'individual') return;
    animals.forEach((animal) => {
      if (!selectedIds.includes(animal.id)) onToggleAnimal(animal.id);
    });
  }

  function clearAll() {
    selectedIds.forEach(onToggleAnimal);
  }

  const selectedLabel = selectedIds.length === 1 ? 'animal selecionado' : 'animais selecionados';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <TopBar onBack={onBack} title="Seleção de Animais" />
        <View style={styles.selectionHeader}>
          <View style={styles.selectionSummary}>
            <CheckCircle2 color={colors.success} size={24} />
            <View style={styles.targetText}>
              <Text style={styles.selectionCount}>{selectedIds.length} {selectedLabel}</Text>
              <Text style={styles.targetHint}>Prontos para manejo {scope === 'coletivo' ? 'coletivo' : 'individual'}</Text>
            </View>
          </View>
          <View style={styles.searchField}>
            <Search color={colors.muted} size={20} />
            <TextInput
              accessibilityLabel="Buscar por brinco ou nome"
              onChangeText={setSearchTerm}
              placeholder="Buscar por brinco ou nome..."
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              value={searchTerm}
            />
            {searchTerm ? (
              <Pressable accessibilityLabel="Limpar busca" onPress={() => setSearchTerm('')} style={styles.clearSearch}>
                <X color={colors.muted} size={18} />
              </Pressable>
            ) : null}
          </View>
          {scope === 'coletivo' ? (
            <View style={styles.massActions}>
              <ActionButton icon={CheckSquare} label="Marcar todos" onPress={toggleAll} />
              <ActionButton icon={RotateCcw} label="Desmarcar todos" onPress={clearAll} />
            </View>
          ) : null}
          <ScrollView horizontal contentContainerStyle={styles.filterRow} showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((item) => {
              const count = item === 'Todos'
                ? animals.length
                : animals.filter((animal) => animal.category === item).length;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: category === item }}
                  key={item}
                  onPress={() => onChangeCategory(item)}
                  style={[styles.filterPill, category === item && styles.filterPillSelected]}
                >
                  <Text style={[styles.filterText, category === item && styles.filterTextSelected]}>{categoryLabel(item)} ({count})</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        <FlatList
          contentContainerStyle={styles.animalList}
          data={filteredAnimals}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum animal encontrado.</Text>}
          renderItem={({ item }) => {
            const selected = selectedIds.includes(item.id);
            return (
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => onToggleAnimal(item.id)} style={styles.animalRow}>
                <View style={styles.checkboxTarget}>
                  {selected
                    ? <CheckSquare color={colors.primary} size={25} />
                    : <Square color="#94A3B8" size={25} />}
                </View>
                <View style={styles.tagBadge}><Text style={styles.tagText}>{item.tagNumber}</Text></View>
                <View style={styles.animalRowInfo}>
                  <Text numberOfLines={1} style={[styles.animalRowName, !item.name && styles.missingAnimalName]}>
                    {item.name || 'Sem nome registrado'}
                  </Text>
                  <Text numberOfLines={1} style={styles.animalRowMeta}>{item.category} • {item.breed}</Text>
                </View>
                {item.hasPendingAlert ? <AlertCircle color="#C2410C" size={19} /> : null}
              </Pressable>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.selectionFooter}>
          <Text style={styles.selectionFooterHint}>
            Exibindo animais do rebanho • Total {selectedIds.length} selecionados de {animals.length}
          </Text>
          <PrimaryButton
            disabled={selectedIds.length === 0}
            label={`Continuar com ${selectedIds.length} ${selectedIds.length === 1 ? 'animal' : 'animais'}`}
            onPress={onConfirm}
            icon={Check}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ReviewStep({
  animals,
  form,
  onBack,
  onConfirm,
  onTogglePending,
  pendingAnimalIds,
}: {
  animals: HandlingAnimal[];
  form: Pick<HandlingFormData, 'type' | 'scope' | 'scheduledDate' | 'status' | 'notes'>;
  onBack: () => void;
  onConfirm: () => void;
  onTogglePending: (id: string) => void;
  pendingAnimalIds: string[];
}) {
  const option = HANDLING_OPTIONS.find((item) => item.type === form.type) || HANDLING_OPTIONS[0];
  const Icon = option.icon;
  const formattedDate = formatDate(form.scheduledDate);
  const participantText = form.scope === 'coletivo'
    ? `${animals.length} ${animals.length === 1 ? 'animal' : 'animais'}`
    : animals[0]
      ? `${animals[0].tagNumber}${animals[0].name ? ` - ${animals[0].name}` : ''}`
      : 'Nenhum animal';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <TopBar onBack={onBack} title="Confirmar Manejo" />
        <ScrollView contentContainerStyle={styles.reviewContent}>
          <View style={styles.reviewHeading}>
            <Text style={styles.reviewTitle}>Confirmar Manejo</Text>
            <Text style={styles.reviewSubtitle}>Revise as informações antes de registrar o manejo.</Text>
          </View>
          <View style={styles.reviewCard}>
            <ReviewRow icon={Icon} label="Tipo de manejo">
              <View style={styles.typeBadge}>
                <Icon color={colors.primary} size={19} />
                <Text style={styles.typeBadgeText}>{form.type}</Text>
              </View>
            </ReviewRow>
            <ReviewRow icon={form.scope === 'coletivo' ? Users : User} label="Aplicação">
              <Text style={styles.reviewValue}>{form.scope === 'coletivo' ? 'Coletiva' : 'Individual'} · {participantText}</Text>
            </ReviewRow>
            <ReviewRow icon={Calendar} label="Data prevista / realização">
              <Text style={styles.reviewValue}>{formattedDate}</Text>
            </ReviewRow>
            <ReviewRow icon={form.status === 'Realizado' ? CheckCircle2 : Clock} label="Situação">
              <View style={[styles.statusBadge, form.status === 'Realizado' ? styles.statusComplete : styles.statusPending]}>
                <Text style={[styles.statusBadgeText, form.status === 'Realizado' ? styles.statusCompleteText : styles.statusPendingText]}>
                  {form.status === 'Realizado' ? 'Realizado' : 'Agendado / Pendente'}
                </Text>
              </View>
            </ReviewRow>
            <View style={styles.observations}>
              <Text style={styles.reviewLabel}>Observações</Text>
              <Text style={styles.reviewValue}>{form.notes.trim() || 'Nenhuma observação informada.'}</Text>
            </View>
          </View>
          {form.status === 'Realizado' ? (
            <View style={styles.executionCard}>
              <Text style={styles.ruleTitle}>Situação individual dos animais</Text>
              <Text style={styles.targetHint}>Marque os animais que ficaram pendentes.</Text>
              {animals.map((animal) => {
                const isPending = pendingAnimalIds.includes(animal.id);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isPending }}
                    key={animal.id}
                    onPress={() => onTogglePending(animal.id)}
                    style={styles.executionAnimalRow}
                  >
                    {isPending ? <Square color="#C2410C" size={22} /> : <CheckSquare color={colors.success} size={22} />}
                    <Text style={styles.reviewValue}>
                      {animal.tagNumber}{animal.name ? ` - ${animal.name}` : ''}
                    </Text>
                    <View style={[styles.executionStatus, isPending ? styles.statusPending : styles.statusComplete]}>
                      <Text style={[styles.executionStatusText, isPending ? styles.statusPendingText : styles.statusCompleteText]}>
                        {isPending ? 'Pendente' : 'Concluído'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <View style={styles.ruleCard}>
            <Info color="#1D4ED8" size={22} />
            <View style={styles.ruleText}>
              <Text style={styles.ruleTitle}>Como funciona o registro</Text>
              <Text style={styles.ruleDescription}>
                O sistema cria UMA única atividade de manejo, mantendo a situação individual de cada animal participante.
              </Text>
              <Text style={styles.offlineText}>Disponível para execução offline</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label="Confirmar Manejo" onPress={onConfirm} icon={Check} />
          <SecondaryButton icon={ArrowLeft} label="Voltar e editar" onPress={onBack} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SuccessStep({
  animals,
  form,
  onReturnToDashboard,
  onViewHandlingDetails,
}: {
  animals: HandlingAnimal[];
  form: HandlingFormData;
  onReturnToDashboard: () => void;
  onViewHandlingDetails: () => void;
}) {
  const isScheduled = form.status === 'Agendado';
  const pendingTags = form.executionSummary?.pendingTags || [];
  const total = form.executionSummary?.total || animals.length;
  const completed = form.executionSummary?.completed || 0;
  const participle = form.type === 'Parto'
    ? (isScheduled ? 'agendado' : 'realizado')
    : (isScheduled ? 'agendada' : 'realizada');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <TopBar onBack={onReturnToDashboard} title="Confirmação de Registro" />
        <ScrollView contentContainerStyle={styles.successContent}>
          <View style={styles.successIcon}><CheckCircle2 color={colors.primary} size={52} strokeWidth={2.3} /></View>
          <Text accessibilityRole="header" style={styles.successTitle}>
            {isScheduled ? 'Manejo agendado com sucesso!' : 'Manejo registrado com sucesso!'}
          </Text>
          <Text style={styles.successSubtitle}>
            {form.type} {participle} para {total} {total === 1 ? 'animal' : 'animais'}.
          </Text>
          {isScheduled ? (
            <View style={styles.successCard}>
              <ReviewRow icon={Calendar} label="Data prevista">
                <Text style={styles.reviewValue}>{formatDate(form.scheduledDate)} · {formatDaysNotice(form.scheduledDate)}</Text>
              </ReviewRow>
              <ReviewRow icon={Users} label="Animais programados">
                <Text style={styles.reviewValue}>{total} {total === 1 ? 'animal' : 'animais'}</Text>
              </ReviewRow>
              <Text style={styles.successNote}>O alerta foi registrado e será exibido na aba Alertas na data prevista.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.executionHeading}>Execução do plantel</Text>
              <View style={styles.metrics}>
                <MetricCard label="Total" value={`${total}`} detail="envolvidos" tone="neutral" />
                <MetricCard label="Concluídos" value={`${completed}`} detail="concluídos" tone="success" />
                <MetricCard label="Pendentes" value={`${pendingTags.length}`} detail={pendingTags.length ? pendingTags.join(', ') : 'pendentes'} tone="warning" />
              </View>
              <View style={styles.successCard}>
                <Text style={styles.successNote}>
                  O manejo foi salvo no aparelho. {pendingTags.length
                    ? `Os ${pendingTags.length} animais pendentes continuam com alerta ativo na aba Alertas.`
                    : 'Todos os animais participantes foram concluídos.'}
                </Text>
              </View>
            </>
          )}
          <View style={styles.savedLocally}>
            <CheckCircle2 color={colors.success} size={18} />
            <Text style={styles.savedLocallyText}>Registro salvo localmente no aparelho</Text>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label="Voltar ao Início" onPress={onReturnToDashboard} />
          <SecondaryButton label="Ver Manejos" onPress={onViewHandlingDetails} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function TopBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.topBar}>
      <Pressable accessibilityLabel="Voltar" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
        <ArrowLeft color={colors.text} size={24} strokeWidth={2.3} />
      </Pressable>
      <Text accessibilityRole="header" numberOfLines={1} style={styles.topBarTitle}>{title}</Text>
      <View style={styles.offlineHeader}>
        <CheckCircle2 color={colors.success} size={16} />
        <Text style={styles.offlineHeaderText}>Offline</Text>
      </View>
    </View>
  );
}

function HandlingTypeButton({
  active,
  icon: Icon,
  onPress,
  title,
}: {
  active: boolean;
  icon: HandlingIcon;
  onPress: () => void;
  title: HandlingType;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.typeButton, active && styles.typeButtonActive]}
    >
      <Icon color={active ? colors.white : colors.primary} size={21} strokeWidth={2.2} />
      <Text style={[styles.typeButtonText, active && styles.typeButtonTextActive]}>{title}</Text>
    </Pressable>
  );
}

function SegmentButton({
  active,
  icon: Icon,
  label,
  onPress,
  tone,
}: {
  active: boolean;
  icon: typeof User;
  label: string;
  onPress: () => void;
  tone?: 'warning' | 'success';
}) {
  const activeStyle = tone === 'warning'
    ? styles.segmentWarning
    : tone === 'success'
      ? styles.segmentSuccess
      : styles.segmentSelected;
  const textStyle = tone === 'warning'
    ? styles.segmentWarningText
    : tone === 'success'
      ? styles.segmentSuccessText
      : styles.segmentSelectedText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.segmentButton, active && activeStyle]}
    >
      <Icon color={active ? colors.primary : colors.muted} size={19} />
      <Text style={[styles.segmentText, active && textStyle]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon?: typeof CheckSquare;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.actionButton}>
      {Icon ? <Icon color={colors.primary} size={18} /> : null}
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({
  disabled,
  icon: Icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon?: typeof Check;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, disabled && styles.buttonDisabled, pressed && !disabled && styles.buttonPressed]}
    >
      {Icon ? <Icon color={colors.white} size={20} strokeWidth={2.5} /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon?: typeof ArrowLeft;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}>
      {Icon ? <Icon color={colors.muted} size={19} /> : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function ReviewRow({
  children,
  icon: Icon,
  label,
}: {
  children: React.ReactNode;
  icon: typeof Calendar;
  label: string;
}) {
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewIcon}><Icon color={colors.primary} size={19} /></View>
      <View style={styles.reviewRowContent}>
        <Text style={styles.reviewLabel}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

function MetricCard({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: 'neutral' | 'success' | 'warning';
  value: string;
}) {
  const toneStyle = tone === 'success' ? styles.metricSuccess : tone === 'warning' ? styles.metricWarning : styles.metricNeutral;
  return (
    <View style={[styles.metricCard, toneStyle]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function categoryLabel(category: CategoryFilter) {
  return category === 'Todos' ? 'Todos' : `${category}s`;
}

function getTodayDate() {
  const today = new Date();
  return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
}

function isValidDate(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function toIsoDate(value: string) {
  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  if (value.includes('/')) return value;
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatDaysNotice(value: string) {
  const [day, month, year] = formatDate(value).split('/').map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Em 1 dia';
  if (days === -1) return 'Há 1 dia';
  return days > 0 ? `Em ${days} dias` : `Há ${Math.abs(days)} dias`;
}

const styles = StyleSheet.create({
  safeArea: { alignItems: 'center', backgroundColor: colors.page, flex: 1 },
  screen: { backgroundColor: colors.page, flex: 1, maxWidth: 390, width: '100%' },
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 10,
  },
  backButton: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  topBarTitle: { color: colors.text, flex: 1, fontFamily: fonts.bold, fontSize: 18, lineHeight: 25, textAlign: 'center' },
  offlineHeader: { alignItems: 'center', flexDirection: 'row', gap: 4, justifyContent: 'flex-end', minWidth: 65 },
  offlineHeaderText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 16 },
  formContent: { gap: 10, padding: 18, paddingBottom: 24 },
  sectionHeader: { gap: 2 },
  sectionTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 18, lineHeight: 25 },
  sectionHint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  groupLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, marginTop: 3 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  typeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeButtonText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16 },
  typeButtonTextActive: { color: colors.white },
  segment: { backgroundColor: '#E9EEF6', borderRadius: 11, flexDirection: 'row', gap: 5, padding: 4 },
  segmentButton: { alignItems: 'center', borderRadius: 8, flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 48, paddingHorizontal: 6 },
  segmentSelected: { backgroundColor: colors.white },
  segmentWarning: { backgroundColor: '#FFEDD5', borderColor: '#FDBA74', borderWidth: 1 },
  segmentSuccess: { backgroundColor: colors.successBackground, borderColor: colors.successBorder, borderWidth: 1 },
  segmentText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16 },
  segmentSelectedText: { color: colors.primary, fontFamily: fonts.bold },
  segmentWarningText: { color: '#C2410C', fontFamily: fonts.bold },
  segmentSuccessText: { color: colors.success, fontFamily: fonts.bold },
  targetCard: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 11, borderWidth: 1, gap: 10, padding: 12 },
  targetSummary: { alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 48 },
  targetText: { flex: 1, gap: 2 },
  targetTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, lineHeight: 23 },
  targetHint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  actionButton: { alignItems: 'center', alignSelf: 'flex-start', borderColor: colors.border, borderRadius: 9, borderWidth: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 48, paddingHorizontal: 12 },
  actionButtonText: { color: colors.primary, fontFamily: fonts.semibold, fontSize: 16 },
  dateField: { alignItems: 'center', backgroundColor: colors.input, borderColor: colors.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 52, paddingHorizontal: 14 },
  dateInput: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 16, minHeight: 50 },
  todayOption: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', gap: 8, minHeight: 48 },
  todayText: { color: colors.text, fontFamily: fonts.medium, fontSize: 16 },
  notesInput: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 10, borderWidth: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, minHeight: 90, padding: 12 },
  errorText: { color: colors.error, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  footer: { backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: 1, gap: 8, paddingBottom: 12, paddingHorizontal: 18, paddingTop: 12 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 52, paddingHorizontal: 12 },
  primaryButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  buttonPressed: { backgroundColor: colors.primaryActive },
  buttonDisabled: { opacity: 0.5 },
  secondaryButton: { alignItems: 'center', backgroundColor: colors.white, borderColor: '#CBD5E1', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', minHeight: 48 },
  secondaryButtonText: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  secondaryPressed: { backgroundColor: '#F1F5F9' },
  selectionHeader: { backgroundColor: colors.page, gap: 10, paddingHorizontal: 16, paddingTop: 14 },
  selectionSummary: { alignItems: 'center', backgroundColor: '#EFFDF5', borderColor: colors.successBorder, borderRadius: 11, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 68, paddingHorizontal: 14 },
  selectionCount: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  searchField: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 50, paddingHorizontal: 12 },
  searchInput: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 16, minHeight: 48 },
  clearSearch: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  massActions: { flexDirection: 'row', gap: 8 },
  filterRow: { gap: 7, paddingBottom: 8 },
  filterPill: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 18, borderWidth: 1, justifyContent: 'center', minHeight: 40, paddingHorizontal: 12 },
  filterPillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16 },
  filterTextSelected: { color: colors.white, fontFamily: fonts.bold },
  animalList: { paddingHorizontal: 12, paddingBottom: 10 },
  animalRow: { alignItems: 'center', backgroundColor: colors.white, borderBottomColor: '#E2E8F0', borderBottomWidth: 1, flexDirection: 'row', gap: 8, minHeight: 68, paddingHorizontal: 4 },
  checkboxTarget: { alignItems: 'center', height: 48, justifyContent: 'center', width: 44 },
  tagBadge: { alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 6, justifyContent: 'center', minHeight: 30, paddingHorizontal: 7 },
  tagText: { color: '#92400E', fontFamily: fonts.bold, fontSize: 16 },
  animalRowInfo: { flex: 1, gap: 2 },
  animalRowName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  missingAnimalName: { color: colors.muted, fontFamily: fonts.regular, fontStyle: 'italic' },
  animalRowMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 21 },
  emptyText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, padding: 22, textAlign: 'center' },
  selectionFooter: { backgroundColor: colors.white, borderTopColor: colors.border, borderTopWidth: 1, gap: 8, padding: 12, paddingHorizontal: 16 },
  selectionFooterHint: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  reviewContent: { gap: 16, padding: 18, paddingBottom: 24 },
  reviewHeading: { gap: 5 },
  reviewTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 24, lineHeight: 31 },
  reviewSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  reviewCard: { backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, padding: 14 },
  reviewRow: { alignItems: 'center', flexDirection: 'row', gap: 10, minHeight: 68, paddingVertical: 8 },
  reviewIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 22, height: 42, justifyContent: 'center', width: 42 },
  reviewRowContent: { flex: 1, gap: 3 },
  reviewLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  reviewValue: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  typeBadge: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 8, flexDirection: 'row', gap: 6, minHeight: 34, paddingHorizontal: 9 },
  typeBadgeText: { color: colors.primary, fontFamily: fonts.bold, fontSize: 16 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 8, justifyContent: 'center', minHeight: 34, paddingHorizontal: 10 },
  statusComplete: { backgroundColor: colors.successBackground, borderColor: colors.successBorder, borderWidth: 1 },
  statusPending: { backgroundColor: '#FFEDD5', borderColor: '#FDBA74', borderWidth: 1 },
  statusBadgeText: { fontFamily: fonts.bold, fontSize: 16 },
  statusCompleteText: { color: colors.success },
  statusPendingText: { color: '#C2410C' },
  observations: { borderTopColor: '#E2E8F0', borderTopWidth: 1, gap: 5, paddingTop: 12 },
  executionCard: { backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, gap: 7, padding: 14 },
  executionAnimalRow: { alignItems: 'center', borderBottomColor: '#E2E8F0', borderBottomWidth: 1, flexDirection: 'row', gap: 8, minHeight: 50, paddingVertical: 5 },
  executionStatus: { borderRadius: 7, justifyContent: 'center', minHeight: 30, paddingHorizontal: 8 },
  executionStatusText: { fontFamily: fonts.bold, fontSize: 16 },
  ruleCard: { alignItems: 'flex-start', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, padding: 14 },
  ruleText: { flex: 1, gap: 6 },
  ruleTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  ruleDescription: { color: colors.text, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  offlineText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, marginTop: 2 },
  successContent: { alignItems: 'center', gap: 14, padding: 18, paddingBottom: 24 },
  successIcon: { alignItems: 'center', backgroundColor: colors.successBackground, borderRadius: 46, height: 92, justifyContent: 'center', marginTop: 12, width: 92 },
  successTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 24, lineHeight: 31, textAlign: 'center' },
  successSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  successCard: { alignSelf: 'stretch', backgroundColor: colors.white, borderColor: '#E2E8F0', borderRadius: 12, borderWidth: 1, gap: 6, padding: 14 },
  successNote: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, paddingTop: 7 },
  executionHeading: { alignSelf: 'flex-start', color: colors.text, fontFamily: fonts.semibold, fontSize: 18, lineHeight: 25, marginTop: 4 },
  metrics: { alignSelf: 'stretch', flexDirection: 'row', gap: 7 },
  metricCard: { alignItems: 'center', borderRadius: 10, flex: 1, justifyContent: 'center', minHeight: 105, padding: 7 },
  metricNeutral: { backgroundColor: '#EFF4FF', borderColor: colors.border, borderWidth: 1 },
  metricSuccess: { backgroundColor: colors.successBackground, borderColor: colors.successBorder, borderWidth: 1 },
  metricWarning: { backgroundColor: '#FFEDD5', borderColor: '#FDBA74', borderWidth: 1 },
  metricLabel: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  metricValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, lineHeight: 29 },
  metricDetail: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 21, textAlign: 'center' },
  savedLocally: { alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 18, flexDirection: 'row', gap: 7, minHeight: 38, paddingHorizontal: 12 },
  savedLocallyText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
});
