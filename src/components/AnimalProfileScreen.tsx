import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  PawPrint,
  Pill,
  Scale,
  Syringe,
  Tag,
  Trash2,
  X,
} from 'lucide-react-native';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';

export interface HistoryItem {
  id: string;
  type: 'weight' | 'vaccine' | 'deworming' | 'breeding' | 'birth' | 'drying';
  title: string;
  date: string;
  status: 'Realizado' | 'Concluído' | 'Agendado';
  details?: string;
}

export interface AnimalProfile {
  tagNumber: string;
  name?: string;
  photoUri?: string | null;
  category: string;
  breed: string;
  gender: string;
  birthDate: string;
  origin: string;
  status: 'Ativa' | 'Inativa';
  currentWeight: number;
  lastWeightDate: string;
  nextHandling?: {
    title: string;
    date: string;
    daysNotice: string;
  };
  history: HistoryItem[];
  notes?: string;
}

interface AnimalProfileScreenProps {
  animal: AnimalProfile;
  onBack: () => void;
  onDeleteConfirm: (tagNumber: string) => void;
  onEdit: (tagNumber: string) => void;
  onNavigateToHandling: (tagNumber: string) => void;
  onSaveWeight: (weight: number, date: string) => void;
}

const HISTORY_ICONS = {
  breeding: Clock,
  birth: Calendar,
  deworming: Pill,
  drying: Calendar,
  vaccine: Syringe,
  weight: Scale,
} as const;

export function AnimalProfileScreen({
  animal,
  onBack,
  onDeleteConfirm,
  onEdit,
  onNavigateToHandling,
  onSaveWeight,
}: AnimalProfileScreenProps) {
  const [history, setHistory] = useState<HistoryItem[]>(animal.history);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [lastWeight, setLastWeight] = useState({
    date: animal.lastWeightDate,
    value: animal.currentWeight,
  });
  const [newWeightInput, setNewWeightInput] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(getTodayDate());
  const [weightError, setWeightError] = useState<string | null>(null);

  function closeWeightModal() {
    setIsWeightModalOpen(false);
    setNewWeightInput('');
    setNewWeightDate(getTodayDate());
    setWeightError(null);
  }

  function handleSaveWeight() {
    const weight = Number(newWeightInput.replace(',', '.'));
    const date = newWeightDate.trim();

    if (!Number.isFinite(weight) || weight <= 0) {
      setWeightError('Informe um peso válido em kg.');
      return;
    }

    if (!isValidDate(date)) {
      setWeightError('Informe a data no formato DD/MM/AAAA.');
      return;
    }

    const nextHistoryItem: HistoryItem = {
      id: `weight-${Date.now()}`,
      type: 'weight',
      title: 'Pesagem',
      date,
      details: `${formatWeight(weight)} kg`,
      status: 'Concluído',
    };

    setHistory((currentHistory) =>
      [...currentHistory, nextHistoryItem].sort((first, second) => dateValue(second.date) - dateValue(first.date)),
    );
    if (dateValue(date) >= dateValue(lastWeight.date)) {
      setLastWeight({ date, value: weight });
    }
    onSaveWeight(weight, date);
    closeWeightModal();
  }

  function handleDeleteConfirm() {
    setIsDeleteModalOpen(false);
    onDeleteConfirm(animal.tagNumber);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.phoneFrame}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Voltar para animais"
            accessibilityRole="button"
            hitSlop={6}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.iconPressed]}
          >
            <ArrowLeft color={colors.text} size={24} strokeWidth={2.3} />
          </Pressable>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.topBarTitle}>
            Prontuário do Animal
          </Text>
          <View style={styles.topActions}>
            <Pressable
              accessibilityLabel="Editar animal"
              accessibilityRole="button"
              hitSlop={4}
              onPress={() => onEdit(animal.tagNumber)}
              style={({ pressed }) => [styles.editButton, pressed && styles.iconPressed]}
            >
              <Edit3 color={colors.primary} size={20} strokeWidth={2.3} />
            </Pressable>
            <Pressable
              accessibilityLabel="Excluir animal"
              accessibilityRole="button"
              hitSlop={4}
              onPress={() => setIsDeleteModalOpen(true)}
              style={({ pressed }) => [styles.deleteIconButton, pressed && styles.deleteIconPressed]}
            >
              <Trash2 color="#DC2626" size={20} strokeWidth={2.3} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            {animal.photoUri ? (
              <Image accessibilityLabel={`Foto de ${animal.name || animal.tagNumber}`} source={{ uri: animal.photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoFallback}>
                <View style={styles.fallbackIcon}>
                  <PawPrint color={colors.primary} size={30} strokeWidth={2} />
                </View>
                <Text style={styles.photoFallbackText}>Foto não cadastrada</Text>
              </View>
            )}

            <View style={styles.profileDetails}>
              <View style={styles.profileTitleRow}>
                <View style={styles.profileIdentity}>
                  <Text style={styles.tagNumber}>{animal.tagNumber}</Text>
                  <Text style={[styles.animalName, !animal.name && styles.animalNameMissing]}>
                    {animal.name || 'Sem nome registrado'}
                  </Text>
                  <Text style={styles.animalMeta}>
                    {animal.category} • {animal.breed}
                  </Text>
                </View>
                <View style={[styles.statusBadge, animal.status === 'Inativa' && styles.statusBadgeInactive]}>
                  <Text style={[styles.statusBadgeText, animal.status === 'Inativa' && styles.statusBadgeTextInactive]}>{animal.status}</Text>
                </View>
              </View>
              <View style={styles.offlineBadge}>
                <CheckCircle2 color={colors.success} size={16} strokeWidth={2.4} />
                <Text style={styles.offlineBadgeText}>Disponível offline</Text>
              </View>
            </View>
          </View>

          <SectionTitle icon={Tag} title="Dados cadastrais" />
          <View style={styles.infoCard}>
            <InfoCell label="Sexo" value={animal.gender} />
            <InfoCell label="Nascimento / idade" value={animal.birthDate} detail={formatAnimalAge(animal.birthDate)} />
            <InfoCell label="Origem" value={animal.origin} />
            <InfoCell label="Situação" value={`${animal.status} no rebanho`} />
            {animal.notes ? (
              <View style={styles.notesBlock}>
                <Text style={styles.infoLabel}>Observações</Text>
                <Text style={styles.notesText}>{animal.notes}</Text>
              </View>
            ) : null}
          </View>

          <SectionTitle icon={Scale} title="Última pesagem" />
          <View style={styles.weightCard}>
            <View style={styles.weightIcon}>
              <Scale color={colors.primary} size={25} strokeWidth={2.2} />
            </View>
            <View style={styles.weightDetails}>
              <Text style={styles.weightValue}>{formatWeight(lastWeight.value)} kg</Text>
              <Text style={styles.weightDate}>Registrado em {lastWeight.date}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsWeightModalOpen(true)}
              style={({ pressed }) => [styles.addWeightButton, pressed && styles.primaryPressed]}
            >
              <Text style={styles.addWeightButtonText}>+ Pesagem</Text>
            </Pressable>
          </View>

          {animal.nextHandling ? (
            <>
              <SectionTitle icon={Calendar} title="Próximo manejo" />
              <View style={styles.handlingCard}>
                <View style={styles.handlingIcon}>
                  <Syringe color="#B45309" size={23} strokeWidth={2.3} />
                </View>
                <View style={styles.handlingDetails}>
                  <Text style={styles.handlingTitle}>{animal.nextHandling.title}</Text>
                  <Text style={styles.handlingDate}>
                    Prevista para {animal.nextHandling.date} • {animal.nextHandling.daysNotice}
                  </Text>
                  <View style={styles.pendingBadge}>
                    <Clock color="#B45309" size={14} strokeWidth={2.3} />
                    <Text style={styles.pendingBadgeText}>Agendado / Pendente</Text>
                  </View>
                </View>
              </View>
            </>
          ) : null}

          <SectionTitle icon={Clock} title="Histórico" />
          <View style={styles.historyCard}>
            {history.map((item, index) => (
              <HistoryRow isLast={index === history.length - 1} item={item} key={item.id} />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigateToHandling(animal.tagNumber)}
            style={({ pressed }) => [styles.handlingButton, pressed && styles.primaryPressed]}
          >
            <Syringe color={colors.white} size={21} strokeWidth={2.5} />
            <Text style={styles.handlingButtonText}>Registrar Manejo</Text>
          </Pressable>
        </View>

        <DeleteAnimalModal isOpen={isDeleteModalOpen} onCancel={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} />
        <WeightModal
          date={newWeightDate}
          error={weightError}
          isOpen={isWeightModalOpen}
          name={animal.name}
          onCancel={closeWeightModal}
          onChangeDate={(value) => {
            setNewWeightDate(value);
            setWeightError(null);
          }}
          onChangeWeight={(value) => {
            setNewWeightInput(value);
            setWeightError(null);
          }}
          onSave={handleSaveWeight}
          tagNumber={animal.tagNumber}
          weight={newWeightInput}
        />
      </View>
    </SafeAreaView>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Tag; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Icon color={colors.primary} size={19} strokeWidth={2.3} />
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
}

function InfoCell({ detail, label, value }: { detail?: string; label: string; value: string }) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      {detail ? <Text style={styles.infoDetail}>{detail}</Text> : null}
    </View>
  );
}

function HistoryRow({ isLast, item }: { isLast: boolean; item: HistoryItem }) {
  const Icon = HISTORY_ICONS[item.type];
  const isCompleted = item.status === 'Concluído';

  return (
    <View style={[styles.historyRow, !isLast && styles.historyRowBorder]}>
      <View style={[styles.historyIcon, item.type === 'weight' && styles.historyWeightIcon]}>
        <Icon color={item.type === 'weight' ? colors.primary : colors.muted} size={19} strokeWidth={2.2} />
      </View>
      <View style={styles.historyDetails}>
        <Text style={styles.historyDate}>{item.date}</Text>
        <Text style={styles.historyTitle}>
          {item.title}
          {item.details ? `: ${item.details}` : ''}
        </Text>
      </View>
      <View style={[styles.historyStatus, isCompleted ? styles.historyStatusNeutral : styles.historyStatusSuccess]}>
        <Text style={[styles.historyStatusText, isCompleted ? styles.historyStatusNeutralText : styles.historyStatusSuccessText]}>{item.status}</Text>
      </View>
    </View>
  );
}

function DeleteAnimalModal({ isOpen, onCancel, onConfirm }: { isOpen: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={isOpen}>
      <View style={styles.modalOverlay}>
        <Pressable accessibilityLabel="Fechar confirmação de exclusão" onPress={onCancel} style={styles.modalBackdrop} />
        <View accessibilityViewIsModal style={styles.deleteModalCard}>
          <View style={styles.alertIcon}>
            <AlertTriangle color="#DC2626" size={29} strokeWidth={2.3} />
          </View>
          <Text accessibilityRole="header" style={styles.modalTitle}>
            Excluir animal?
          </Text>
          <Text style={styles.modalSubtitle}>Esta ação não pode ser desfeita.</Text>
          <View style={styles.modalActions}>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={({ pressed }) => [styles.deleteConfirmButton, pressed && styles.deleteConfirmPressed]}>
              <Text style={styles.deleteConfirmButtonText}>Confirmar exclusão</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.modalCancelButton, pressed && styles.modalCancelPressed]}>
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WeightModal({
  date,
  error,
  isOpen,
  name,
  onCancel,
  onChangeDate,
  onChangeWeight,
  onSave,
  tagNumber,
  weight,
}: {
  date: string;
  error: string | null;
  isOpen: boolean;
  name?: string;
  onCancel: () => void;
  onChangeDate: (value: string) => void;
  onChangeWeight: (value: string) => void;
  onSave: () => void;
  tagNumber: string;
  weight: string;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={isOpen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <Pressable accessibilityLabel="Fechar registro de pesagem" onPress={onCancel} style={styles.modalBackdrop} />
        <View accessibilityViewIsModal style={styles.weightModalCard}>
          <View style={styles.modalTopRow}>
            <View>
              <Text accessibilityRole="header" style={styles.weightModalTitle}>
                Registrar Pesagem
              </Text>
              <Text style={styles.weightModalSubtitle}>
                Animal {tagNumber}{name ? ` - ${name}` : ''}
              </Text>
            </View>
            <Pressable accessibilityLabel="Fechar" onPress={onCancel} style={({ pressed }) => [styles.closeButton, pressed && styles.iconPressed]}>
              <X color={colors.muted} size={21} strokeWidth={2.3} />
            </Pressable>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Peso *</Text>
            <View style={styles.weightInputControl}>
              <TextInput
                accessibilityLabel="Peso em quilogramas"
                keyboardType="decimal-pad"
                onChangeText={onChangeWeight}
                placeholder="Ex.: 425"
                placeholderTextColor="#64748B"
                style={styles.weightInput}
                value={weight}
              />
              <Text style={styles.unitLabel}>kg</Text>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Data *</Text>
            <View style={styles.dateInputControl}>
              <Calendar color={colors.primary} size={20} strokeWidth={2.3} />
              <TextInput
                accessibilityLabel="Data da pesagem"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                onChangeText={onChangeDate}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#64748B"
                style={styles.dateInput}
                value={date}
              />
            </View>
          </View>

          {error ? <Text accessibilityLiveRegion="polite" style={styles.weightError}>{error}</Text> : null}

          <View style={styles.modalActions}>
            <Pressable accessibilityRole="button" onPress={onSave} style={({ pressed }) => [styles.saveWeightButton, pressed && styles.primaryPressed]}>
              <Text style={styles.saveWeightButtonText}>Salvar pesagem</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.modalCancelButton, pressed && styles.modalCancelPressed]}>
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function formatWeight(weight: number) {
  return Number.isInteger(weight) ? String(weight) : weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function formatAnimalAge(birthDate: string) {
  const [day, month, year] = birthDate.split('/').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return 'Idade não disponível';
  if (years === 0 && months === 0) return 'Menos de 1 mês';
  if (years === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
}

function getTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${today.getFullYear()}`;
}

function isValidDate(value: string) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value) && Number.isFinite(dateValue(value));
}

function dateValue(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date.getTime() : Number.NaN;
}

const styles = StyleSheet.create({
  addWeightButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 9,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  addWeightButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  alertIcon: {
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 14,
    width: 56,
  },
  animalMeta: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  animalName: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 19,
    lineHeight: 26,
  },
  animalNameMissing: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontStyle: 'italic',
  },
  backButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  dateInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 50,
    paddingVertical: 0,
  },
  dateInputControl: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  deleteConfirmButton: {
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 50,
  },
  deleteConfirmButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  deleteConfirmPressed: {
    backgroundColor: '#B91C1C',
  },
  deleteIconButton: {
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  deleteIconPressed: {
    backgroundColor: '#FECACA',
  },
  deleteModalCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 24,
    maxWidth: 350,
    padding: 24,
    width: '100%',
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  fallbackIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  footer: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handlingButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 11,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
  },
  handlingButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  handlingCard: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningBackground,
    borderColor: colors.warningBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  handlingDate: {
    color: '#B45309',
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  handlingDetails: {
    flex: 1,
    gap: 5,
  },
  handlingIcon: {
    alignItems: 'center',
    backgroundColor: '#FDE68A',
    borderRadius: 10,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  handlingTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1,
  },
  historyDate: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  historyDetails: {
    flex: 1,
    gap: 2,
  },
  historyIcon: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  historyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  historyRowBorder: {
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  historyStatus: {
    alignItems: 'center',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: 8,
  },
  historyStatusNeutral: {
    backgroundColor: '#E2E8F0',
  },
  historyStatusNeutralText: {
    color: colors.muted,
  },
  historyStatusSuccess: {
    backgroundColor: colors.successBackground,
  },
  historyStatusSuccessText: {
    color: colors.success,
  },
  historyStatusText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  historyTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  historyWeightIcon: {
    backgroundColor: colors.primarySoft,
  },
  iconPressed: {
    opacity: 0.6,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 14,
  },
  infoCell: {
    gap: 3,
    minHeight: 63,
    width: '47%',
  },
  infoDetail: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  infoLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  infoValue: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  inputLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  inputSection: {
    gap: 7,
  },
  modalActions: {
    gap: 9,
    marginTop: 8,
    width: '100%',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCancelButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  modalCancelButtonText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  modalCancelPressed: {
    backgroundColor: '#F1F5F9',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalSubtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 6,
    textAlign: 'center',
  },
  notesBlock: {
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    gap: 4,
    marginTop: 2,
    paddingTop: 12,
    width: '100%',
  },
  notesText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  offlineBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successBackground,
    borderColor: colors.successBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 9,
  },
  offlineBadgeText: {
    color: colors.success,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  pendingBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
    minHeight: 30,
    paddingHorizontal: 8,
  },
  pendingBadgeText: {
    color: '#B45309',
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  phoneFrame: {
    backgroundColor: colors.page,
    flex: 1,
    maxWidth: 390,
    width: '100%',
  },
  photo: {
    height: 160,
    width: '100%',
  },
  photoFallback: {
    alignItems: 'center',
    backgroundColor: colors.input,
    height: 160,
    justifyContent: 'center',
    gap: 8,
  },
  photoFallbackText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
    transform: [{ scale: 0.99 }],
  },
  profileCard: {
    backgroundColor: colors.white,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  profileDetails: {
    gap: 12,
    padding: 16,
  },
  profileIdentity: {
    flex: 1,
    gap: 2,
  },
  profileTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  safeArea: {
    alignItems: 'center',
    backgroundColor: colors.page,
    flex: 1,
  },
  saveWeightButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 50,
  },
  saveWeightButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  scrollContent: {
    gap: 18,
    paddingBottom: 26,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 25,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: -8,
  },
  statusBadge: {
    alignItems: 'center',
    backgroundColor: colors.successBackground,
    borderColor: colors.successBorder,
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 9,
  },
  statusBadgeInactive: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  statusBadgeText: {
    color: colors.success,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  statusBadgeTextInactive: {
    color: colors.muted,
  },
  tagNumber: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.4,
    lineHeight: 33,
  },
  topActions: {
    flexDirection: 'row',
    gap: 7,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 12,
  },
  topBarTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 25,
    marginHorizontal: 6,
  },
  unitLabel: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  weightCard: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: '#C9D9F5',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 92,
    padding: 14,
  },
  weightDate: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  weightDetails: {
    flex: 1,
    gap: 2,
  },
  weightValue: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 29,
  },
  weightError: {
    color: colors.error,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    marginTop: -2,
  },
  weightIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 11,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  weightInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 25,
    minHeight: 50,
    paddingVertical: 0,
  },
  weightInputControl: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  weightModalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 18,
    marginHorizontal: 20,
    maxWidth: 390,
    padding: 20,
    width: '100%',
  },
  weightModalSubtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  weightModalTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 27,
  },
  modalTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
