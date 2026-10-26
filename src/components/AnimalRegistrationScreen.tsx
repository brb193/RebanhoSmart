import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  PawPrint,
  RefreshCw,
  Tag,
  Trash2,
  X,
} from 'lucide-react-native';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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

export interface AnimalInput {
  tagNumber: string;
  name?: string;
  photoUri?: string | null;
  category: 'Vaca' | 'Novilha' | 'Bezerro' | 'Touro';
  gender: 'Fêmea' | 'Macho';
  breed: string;
  birthDate?: string;
  origin: 'Nascido no Local' | 'Comprado' | 'Externo';
  status: 'Ativo' | 'Inativo';
  notes?: string;
}

interface AnimalRegistrationScreenProps {
  initialAnimal?: AnimalInput;
  onCancel: () => void;
  onSaveAnimal: (data: AnimalInput) => void;
}

interface AnimalFormState {
  birthDate: string;
  breed: string;
  category: AnimalInput['category'];
  customBreed: string;
  gender: AnimalInput['gender'];
  name: string;
  notes: string;
  origin: AnimalInput['origin'];
  status: AnimalInput['status'];
  tagNumber: string;
}

type FormField = keyof AnimalFormState;

const CATEGORIES: AnimalInput['category'][] = ['Vaca', 'Novilha', 'Bezerro', 'Touro'];
const GENDERS: AnimalInput['gender'][] = ['Fêmea', 'Macho'];
const BREEDS = ['Girolando', 'Holandesa', 'Nelore', 'Jersey', 'Outra'];
const ORIGINS: AnimalInput['origin'][] = ['Nascido no Local', 'Comprado', 'Externo'];
const STATUSES: AnimalInput['status'][] = ['Ativo', 'Inativo'];

const INITIAL_FORM: AnimalFormState = {
  birthDate: '',
  breed: 'Girolando',
  category: 'Vaca',
  customBreed: '',
  gender: 'Fêmea',
  name: '',
  notes: '',
  origin: 'Nascido no Local',
  status: 'Ativo',
  tagNumber: '',
};

function createInitialForm(initialAnimal?: AnimalInput): AnimalFormState {
  if (!initialAnimal) return INITIAL_FORM;

  return {
    birthDate: initialAnimal.birthDate || '',
    breed: BREEDS.includes(initialAnimal.breed) ? initialAnimal.breed : 'Outra',
    category: initialAnimal.category,
    customBreed: BREEDS.includes(initialAnimal.breed) ? '' : initialAnimal.breed,
    gender: initialAnimal.gender,
    name: initialAnimal.name || '',
    notes: initialAnimal.notes || '',
    origin: initialAnimal.origin,
    status: initialAnimal.status,
    tagNumber: initialAnimal.tagNumber,
  };
}

export function AnimalRegistrationScreen({ initialAnimal, onCancel, onSaveAnimal }: AnimalRegistrationScreenProps) {
  const [form, setForm] = useState<AnimalFormState>(() => createInitialForm(initialAnimal));
  const [focusedField, setFocusedField] = useState<FormField | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(initialAnimal?.photoUri || null);
  const [showTagError, setShowTagError] = useState(false);

  function updateField(field: FormField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === 'tagNumber' && value.trim()) {
      setShowTagError(false);
    }
  }

  function selectBreed(breed: string) {
    setForm((current) => ({
      ...current,
      breed,
      customBreed: breed === 'Outra' ? current.customBreed : '',
    }));
  }

  function handleSave() {
    const tagNumber = form.tagNumber.trim();

    if (!tagNumber) {
      setShowTagError(true);
      return;
    }

    const animal: AnimalInput = {
      tagNumber,
      name: form.name.trim() || undefined,
      photoUri,
      category: form.category,
      gender: form.gender,
      breed: form.breed === 'Outra' ? form.customBreed.trim() || 'Outra' : form.breed,
      birthDate: form.birthDate.trim() || undefined,
      origin: form.origin,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    console.log('Animal salvo:', animal);
    onSaveAnimal(animal);
  }

  function handleCancel() {
    setForm(createInitialForm(initialAnimal));
    setFocusedField(null);
    setPhotoError(null);
    setPhotoUri(initialAnimal?.photoUri || null);
    setShowTagError(false);
    console.log('Cadastro cancelado');
    onCancel();
  }

  function setEstimatedAge(months: number) {
    const birthDate = new Date();
    birthDate.setMonth(birthDate.getMonth() - months);
    updateField('birthDate', formatDate(birthDate));
  }

  function onPickPhoto() {
    Alert.alert('Adicionar foto', 'Escolha como deseja adicionar a foto do animal.', [
      { text: 'Fotografar', onPress: () => void onTakePhoto() },
      { text: 'Escolher da galeria', onPress: () => void onChooseFromGallery() },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function onTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setPhotoError('Permita o acesso à câmera para fotografar o animal.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: 'images',
      quality: 0.8,
    });

    applySelectedPhoto(result);
  }

  async function onChooseFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setPhotoError('Permita o acesso às fotos para anexar uma imagem do animal.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: 'images',
      quality: 0.8,
    });

    applySelectedPhoto(result);
  }

  function applySelectedPhoto(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || !result.assets[0]) {
      return;
    }

    setPhotoUri(result.assets[0].uri);
    setPhotoError(null);
  }

  function onRemovePhoto() {
    setPhotoUri(null);
    setPhotoError(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={styles.flex}>
        <View style={styles.phoneFrame}>
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel="Voltar e descartar alterações"
              accessibilityRole="button"
              hitSlop={6}
              onPress={handleCancel}
              style={({ pressed }) => [styles.backButton, pressed && styles.iconPressed]}
            >
              <ArrowLeft color={colors.text} size={24} strokeWidth={2.4} />
            </Pressable>

            <Text numberOfLines={1} style={styles.title}>Cadastrar Animal</Text>

            <View accessibilityLabel="Disponível offline" style={styles.offlineBadge}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineText}>Disponível offline</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.intro}>
              <Text style={styles.introTitle}>Identifique o animal</Text>
              <Text style={styles.introText}>Comece pelo brinco. Os demais dados podem ser preenchidos no ritmo do manejo.</Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.labelRow}>
                <Camera color={colors.primary} size={19} strokeWidth={2.3} />
                <Text style={styles.label}>Foto do Animal <Text style={styles.optional}>(Opcional)</Text></Text>
              </View>

              {photoUri ? (
                <>
                  <View style={styles.photoPreview}>
                    <Image accessibilityLabel="Foto do animal selecionada" resizeMode="cover" source={{ uri: photoUri }} style={styles.photoImage} />
                    <View style={styles.photoBadge}>
                      <Check color={colors.white} size={14} strokeWidth={3} />
                      <Text style={styles.photoBadgeText}>Foto anexada</Text>
                    </View>
                  </View>
                  <View style={styles.photoActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={onPickPhoto}
                      style={({ pressed }) => [styles.changePhotoButton, pressed && styles.selectionPressed]}
                    >
                      <RefreshCw color={colors.primary} size={18} strokeWidth={2.3} />
                      <Text style={styles.changePhotoText}>Trocar foto</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={onRemovePhoto}
                      style={({ pressed }) => [styles.removePhotoButton, pressed && styles.selectionPressed]}
                    >
                      <Trash2 color="#DC2626" size={18} strokeWidth={2.3} />
                      <Text style={styles.removePhotoText}>Remover</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Pressable
                    accessibilityHint="Abre as opções para fotografar ou escolher uma imagem da galeria"
                    accessibilityLabel="Adicionar foto do animal"
                    accessibilityRole="button"
                    onPress={onPickPhoto}
                    style={({ pressed }) => [styles.photoUpload, pressed && styles.photoUploadPressed]}
                  >
                    <View style={styles.photoUploadIcon}>
                      <Camera color={colors.primary} size={30} strokeWidth={2} />
                    </View>
                    <Text style={styles.photoUploadTitle}>Adicionar foto do animal</Text>
                    <Text style={styles.photoUploadText}>Opcional. Toque para fotografar ou escolher da galeria.</Text>
                  </Pressable>
                  <Text style={styles.photoNote}>Auxílio visual no curral. A identificação oficial é feita pelo número do brinco digitado abaixo.</Text>
                </>
              )}

              {photoError ? (
                <View accessibilityLiveRegion="polite" style={styles.errorMessage}>
                  <AlertTriangle color={colors.error} size={18} strokeWidth={2.4} />
                  <Text style={styles.errorText}>{photoError}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Número do Brinco <Text style={styles.required}>*</Text></Text>
              <View style={[styles.tagInput, focusedField === 'tagNumber' && styles.inputFocused, showTagError && styles.inputError]}>
                <Tag color={showTagError ? colors.error : colors.primary} size={22} strokeWidth={2.3} />
                <TextInput
                  accessibilityLabel="Número do Brinco, obrigatório"
                  autoFocus
                  autoCapitalize="characters"
                  keyboardType="numeric"
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(value) => updateField('tagNumber', value)}
                  onFocus={() => setFocusedField('tagNumber')}
                  placeholder="Ex: 045 ou BR-2024"
                  placeholderTextColor={colors.muted}
                  returnKeyType="next"
                  style={styles.tagTextInput}
                  value={form.tagNumber}
                />
              </View>
              {showTagError ? (
                <View accessibilityLiveRegion="polite" style={styles.errorMessage}>
                  <AlertTriangle color={colors.error} size={18} strokeWidth={2.4} />
                  <Text style={styles.errorText}>Informe o número do brinco para cadastrar o animal.</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Nome ou Apelido <Text style={styles.optional}>(Opcional)</Text></Text>
              <View style={[styles.inputControl, focusedField === 'name' && styles.inputFocused]}>
                <TextInput
                  accessibilityLabel="Nome ou apelido"
                  autoCapitalize="words"
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(value) => updateField('name', value)}
                  onFocus={() => setFocusedField('name')}
                  placeholder="Ex: Mimosa, Estrela"
                  placeholderTextColor={colors.muted}
                  style={styles.textInput}
                  value={form.name}
                />
              </View>
            </View>

            <View style={styles.sectionDivider} />

            <View style={styles.formSection}>
              <View style={styles.labelRow}>
                <PawPrint color={colors.primary} size={19} strokeWidth={2.3} />
                <Text style={styles.label}>Categoria <Text style={styles.required}>*</Text></Text>
              </View>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => {
                  const selected = form.category === category;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={category}
                      onPress={() => updateField('category', category)}
                      style={({ pressed }) => [styles.categoryOption, selected && styles.selectionActive, pressed && styles.selectionPressed]}
                    >
                      <Text style={[styles.selectionText, selected && styles.selectionTextActive]}>{category}</Text>
                      {selected ? <Check color={colors.white} size={18} strokeWidth={3} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Sexo</Text>
              <View accessibilityRole="radiogroup" style={styles.segmentedControl}>
                {GENDERS.map((gender) => {
                  const selected = form.gender === gender;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={gender}
                      onPress={() => updateField('gender', gender)}
                      style={({ pressed }) => [styles.segment, selected && styles.segmentActive, pressed && styles.selectionPressed]}
                    >
                      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{gender}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Raça</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
                {BREEDS.map((breed) => {
                  const selected = form.breed === breed;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={breed}
                      onPress={() => selectBreed(breed)}
                      style={({ pressed }) => [styles.pill, selected && styles.pillActive, pressed && styles.selectionPressed]}
                    >
                      <Text style={[styles.pillText, selected && styles.pillTextActive]}>{breed}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {form.breed === 'Outra' ? (
                <View style={[styles.inputControl, focusedField === 'customBreed' && styles.inputFocused]}>
                  <TextInput
                    accessibilityLabel="Informe a raça"
                    autoCapitalize="words"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(value) => updateField('customBreed', value)}
                    onFocus={() => setFocusedField('customBreed')}
                    placeholder="Informe a raça"
                    placeholderTextColor={colors.muted}
                    style={styles.textInput}
                    value={form.customBreed}
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.sectionDivider} />

            <View style={styles.formSection}>
              <View style={styles.labelRow}>
                <Calendar color={colors.primary} size={19} strokeWidth={2.3} />
                <Text style={styles.label}>Nascimento / Idade Estimada</Text>
              </View>
              <View style={[styles.inputControl, focusedField === 'birthDate' && styles.inputFocused]}>
                <TextInput
                  accessibilityLabel="Data de nascimento ou idade estimada"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(value) => updateField('birthDate', value)}
                  onFocus={() => setFocusedField('birthDate')}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.muted}
                  style={styles.textInput}
                  value={form.birthDate}
                />
              </View>
              <Text style={styles.helperText}>Ou preencha pela idade aproximada:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
                <AgeShortcut label="+ 6 meses" months={6} onPress={setEstimatedAge} />
                <AgeShortcut label="+ 1 ano" months={12} onPress={setEstimatedAge} />
                <AgeShortcut label="+ 2 anos" months={24} onPress={setEstimatedAge} />
                <AgeShortcut label="+ 3+ anos" months={36} onPress={setEstimatedAge} />
              </ScrollView>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Origem</Text>
              <View accessibilityRole="radiogroup" style={styles.originOptions}>
                {ORIGINS.map((origin) => {
                  const selected = form.origin === origin;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={origin}
                      onPress={() => updateField('origin', origin)}
                      style={({ pressed }) => [styles.originOption, selected && styles.originActive, pressed && styles.selectionPressed]}
                    >
                      <Text style={[styles.originText, selected && styles.originTextActive]}>{origin}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Situação no Rebanho</Text>
              <View accessibilityRole="radiogroup" style={styles.segmentedControl}>
                {STATUSES.map((status) => {
                  const selected = form.status === status;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={status}
                      onPress={() => updateField('status', status)}
                      style={({ pressed }) => [styles.segment, selected && styles.segmentActive, pressed && styles.selectionPressed]}
                    >
                      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{status}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Observações de Campo</Text>
              <View style={[styles.notesControl, focusedField === 'notes' && styles.inputFocused]}>
                <TextInput
                  accessibilityLabel="Observações de campo"
                  multiline
                  numberOfLines={3}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(value) => updateField('notes', value)}
                  onFocus={() => setFocusedField('notes')}
                  placeholder="Marcas, pelagem ou outras anotações"
                  placeholderTextColor={colors.muted}
                  style={styles.notesInput}
                  textAlignVertical="top"
                  value={form.notes}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              onPress={handleSave}
              style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
            >
              <Check color={colors.white} size={21} strokeWidth={2.8} />
              <Text style={styles.saveButtonText}>Salvar animal</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleCancel}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
            >
              <X color={colors.muted} size={19} strokeWidth={2.4} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AgeShortcut({ label, months, onPress }: { label: string; months: number; onPress: (months: number) => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => onPress(months)} style={({ pressed }) => [styles.agePill, pressed && styles.selectionPressed]}>
      <Text style={styles.agePillText}>{label}</Text>
    </Pressable>
  );
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  agePill: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  agePillText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: 48,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonPressed: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  changePhotoButton: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: '#C9D9F5',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 10,
  },
  changePhotoText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 14,
    width: '48.5%',
  },
  errorMessage: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  errorText: {
    color: colors.error,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  flex: {
    flex: 1,
  },
  footer: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderTopWidth: 1,
    gap: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  formSection: {
    gap: 8,
  },
  helperText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  iconPressed: {
    opacity: 0.62,
  },
  inputControl: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  intro: {
    gap: 4,
    marginBottom: 4,
  },
  introText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
  },
  introTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 27,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  notesControl: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 94,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  notesInput: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 70,
    padding: 0,
  },
  offlineBadge: {
    alignItems: 'center',
    backgroundColor: colors.successBackground,
    borderColor: colors.successBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: 8,
  },
  offlineDot: {
    backgroundColor: colors.success,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  offlineText: {
    color: colors.success,
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 16,
  },
  optional: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  originActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  originOption: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 8,
  },
  originOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  originText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  originTextActive: {
    color: colors.primary,
  },
  phoneFrame: {
    backgroundColor: colors.page,
    flex: 1,
    maxWidth: 390,
    width: '100%',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  photoBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 7,
    flexDirection: 'row',
    gap: 4,
    left: 10,
    minHeight: 27,
    paddingHorizontal: 8,
    position: 'absolute',
    top: 10,
  },
  photoBadgeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  photoImage: {
    height: 160,
    width: '100%',
  },
  photoNote: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  photoPreview: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 160,
    overflow: 'hidden',
    position: 'relative',
  },
  photoUpload: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: '#94A3B8',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    height: 144,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  photoUploadIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    marginBottom: 7,
    width: 42,
  },
  photoUploadPressed: {
    borderColor: colors.primary,
    opacity: 0.8,
  },
  photoUploadText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  photoUploadTitle: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  pillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  pillRow: {
    gap: 8,
    paddingRight: 20,
  },
  pillText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  pillTextActive: {
    color: colors.primary,
  },
  required: {
    color: colors.error,
  },
  removePhotoButton: {
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  removePhotoText: {
    color: '#DC2626',
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  safeArea: {
    alignItems: 'center',
    backgroundColor: colors.page,
    flex: 1,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 11,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryActive,
    transform: [{ scale: 0.99 }],
  },
  saveButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionDivider: {
    backgroundColor: colors.border,
    height: 1,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  segmentActive: {
    backgroundColor: colors.white,
  },
  segmentText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  segmentTextActive: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  segmentedControl: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 4,
    minHeight: 52,
    padding: 3,
  },
  selectionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectionPressed: {
    opacity: 0.76,
  },
  selectionText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  selectionTextActive: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
  tagInput: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  tagTextInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 25,
    marginLeft: 11,
    minHeight: 50,
    paddingVertical: 0,
  },
  textInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 50,
    paddingVertical: 0,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 20,
    letterSpacing: -0.25,
    lineHeight: 26,
    marginHorizontal: 4,
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
});
