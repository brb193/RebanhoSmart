import { useEffect, useMemo, useRef, useState } from 'react';
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
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';
import { ScreenSafeArea as SafeAreaView } from './ScreenSafeArea';

export interface AnimalInput {
  tagNumber: string;
  name?: string;
  photoUri?: string | null;
  category: 'Vaca' | 'Novilha' | 'Bezerra' | 'Bezerro' | 'Garrote' | 'Touro';
  gender: 'Fêmea' | 'Macho';
  breed: string;
  ageMonths: number;
  birthDate?: string;
  origin: 'Nascido no Local' | 'Comprado' | 'Externo';
  status: 'Ativo' | 'Inativo';
  notes?: string;
}

interface AnimalRegistrationScreenProps {
  initialAnimal?: AnimalInput;
  onCancel: () => void;
  onSaveAnimal: (data: AnimalInput) => Promise<boolean>;
}

interface AnimalFormState {
  ageMonths: number;
  birthDate: string;
  breed: string;
  customBreed: string;
  gender: AnimalInput['gender'];
  otherBreedExpanded: boolean;
  name: string;
  notes: string;
  origin: AnimalInput['origin'];
  status: AnimalInput['status'];
  tagNumber: string;
}

type FormField = Exclude<keyof AnimalFormState, 'ageMonths' | 'otherBreedExpanded'>;

const MIN_BIRTH_YEAR = 2006;
const MAX_AGE_MONTHS = Math.max(
  0,
  (new Date().getFullYear() - MIN_BIRTH_YEAR) * 12 + new Date().getMonth(),
);
const BREEDS = ['Nelore', 'Angus', 'Girolando', 'Holandesa'];
const ORIGINS: AnimalInput['origin'][] = ['Nascido no Local', 'Comprado', 'Externo'];
const STATUSES: AnimalInput['status'][] = ['Ativo', 'Inativo'];

const INITIAL_FORM: AnimalFormState = {
  ageMonths: 0,
  birthDate: '',
  breed: 'Girolando',
  customBreed: '',
  gender: 'Fêmea',
  otherBreedExpanded: false,
  name: '',
  notes: '',
  origin: 'Nascido no Local',
  status: 'Ativo',
  tagNumber: '',
};

function createInitialForm(initialAnimal?: AnimalInput): AnimalFormState {
  if (!initialAnimal) return INITIAL_FORM;

  const isKnownBreed = BREEDS.includes(initialAnimal.breed);
  const ageMonths = Math.round(Math.min(MAX_AGE_MONTHS, Math.max(0, initialAnimal.ageMonths ?? getAgeInMonths(initialAnimal.birthDate) ?? 0)));
  return {
    ageMonths,
    birthDate: initialAnimal.birthDate || '',
    breed: isKnownBreed ? initialAnimal.breed : 'Outra',
    customBreed: isKnownBreed ? '' : initialAnimal.breed,
    gender: initialAnimal.gender,
    otherBreedExpanded: !isKnownBreed,
    name: initialAnimal.name || '',
    notes: initialAnimal.notes || '',
    origin: initialAnimal.origin,
    status: initialAnimal.status,
    tagNumber: initialAnimal.tagNumber,
  };
}

export function AnimalRegistrationScreen({ initialAnimal, onCancel, onSaveAnimal }: AnimalRegistrationScreenProps) {
  const [form, setForm] = useState<AnimalFormState>(() => createInitialForm(initialAnimal));
  const category = classifyAnimal(form.gender, form.ageMonths);
  const [focusedField, setFocusedField] = useState<FormField | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(initialAnimal?.photoUri || null);
  const [showTagError, setShowTagError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
      otherBreedExpanded: false,
    }));
  }

  function setAgeMonths(ageMonths: number) {
    const boundedAge = Math.max(0, Math.min(MAX_AGE_MONTHS, Math.round(ageMonths)));
    setForm((current) => ({
      ...current,
      ageMonths: boundedAge,
      birthDate: estimateBirthDate(boundedAge),
    }));
  }

  function updateBirthDate(value: string) {
    const birthDate = formatBirthDateInput(value);
    const ageMonths = getAgeInMonths(birthDate);
    setForm((current) => ({
      ...current,
      birthDate,
      ...(ageMonths === null ? {} : { ageMonths: Math.min(MAX_AGE_MONTHS, ageMonths) }),
    }));
  }

  function toggleOtherBreed() {
    setForm((current) => ({
      ...current,
      breed: current.otherBreedExpanded ? 'Girolando' : 'Outra',
      otherBreedExpanded: !current.otherBreedExpanded,
    }));
  }

  async function handleSave() {
    if (isSaving) return;
    const tagNumber = form.tagNumber.trim();

    if (!tagNumber) {
      setShowTagError(true);
      return;
    }

    if (form.birthDate && (form.birthDate.length !== 10 || getAgeInMonths(form.birthDate) === null)) {
      Alert.alert('Data de nascimento inválida', 'Informe uma data entre 01/01/2006 e hoje, ou apague o campo para usar somente a idade.');
      return;
    }

    const breed = form.breed === 'Outra' ? form.customBreed.trim() : form.breed;
    if (!breed) {
      Alert.alert('Raça não informada', 'Digite a raça do animal ou selecione uma das opções disponíveis.');
      return;
    }

    const animal: AnimalInput = {
      tagNumber,
      name: form.name.trim() || undefined,
      photoUri,
      category,
      gender: form.gender,
      breed,
      ageMonths: form.ageMonths,
      birthDate: form.birthDate || formatDate(new Date()),
      origin: form.origin,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };

    setIsSaving(true);
    const saved = await onSaveAnimal(animal);
    if (!saved) setIsSaving(false);
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
                <Text style={styles.label}>Classificação automática</Text>
              </View>
              <Text style={styles.classificationValue}>{category}</Text>
              <Text style={styles.helperText}>Calculada pelo sexo e pela idade do animal.</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Sexo biológico</Text>
              <View accessibilityRole="radiogroup" style={styles.segmentedControl}>
                {([
                  { gender: 'Fêmea', label: 'Vaca' },
                  { gender: 'Macho', label: 'Boi' },
                ] as const).map(({ gender, label }) => {
                  const selected = form.gender === gender;

                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={gender}
                      onPress={() => updateField('gender', gender)}
                      style={({ pressed }) => [styles.segment, selected && styles.segmentActive, pressed && styles.selectionPressed]}
                    >
                      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.label}>Raça</Text>
              <Text style={styles.breedGroupLabel}>Gado de corte</Text>
              <View style={styles.breedOptions}>
                {BREEDS.slice(0, 2).map((breed) => (
                  <BreedOption key={breed} breed={breed} selected={form.breed === breed} onSelect={selectBreed} />
                ))}
              </View>
              <Text style={styles.breedGroupLabel}>Gado de leite</Text>
              <View style={styles.breedOptions}>
                {BREEDS.slice(2).map((breed) => (
                  <BreedOption key={breed} breed={breed} selected={form.breed === breed} onSelect={selectBreed} />
                ))}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: form.otherBreedExpanded }}
                onPress={toggleOtherBreed}
                style={({ pressed }) => [styles.otherBreedButton, form.otherBreedExpanded && styles.otherBreedButtonActive, pressed && styles.selectionPressed]}
              >
                <Text style={[styles.otherBreedButtonText, form.otherBreedExpanded && styles.otherBreedButtonTextActive]}>
                  {form.otherBreedExpanded ? '−  Fechar outras raças' : '+  Outra raça'}
                </Text>
              </Pressable>
              {form.otherBreedExpanded ? (
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
                <Text style={styles.label}>Idade do animal</Text>
              </View>
              <View style={styles.ageValueRow}>
                <AgeMonthsInput value={form.ageMonths} maximumValue={MAX_AGE_MONTHS} onValueChange={setAgeMonths} />
                <Text style={styles.classificationValue}>{category}</Text>
              </View>
              <AgeSlider value={form.ageMonths} maximumValue={MAX_AGE_MONTHS} onValueChange={setAgeMonths} />
              <Text style={styles.helperText}>
                Deslize para ajustar a idade. Nascimento estimado: {form.birthDate || 'hoje'}.
              </Text>
              <Text style={styles.label}>Ou informe a data de nascimento</Text>
              <View style={[styles.inputControl, focusedField === 'birthDate' && styles.inputFocused]}>
                <TextInput
                  accessibilityLabel="Data de nascimento no formato dia, mês e ano"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={updateBirthDate}
                  onFocus={() => setFocusedField('birthDate')}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.muted}
                  style={styles.textInput}
                  value={form.birthDate}
                />
              </View>
              {form.birthDate.length === 10 && getAgeInMonths(form.birthDate) === null ? (
                <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                  Informe uma data válida entre 01/01/2006 e hoje.
                </Text>
              ) : null}
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
              disabled={isSaving}
              onPress={handleSave}
              style={({ pressed }) => [styles.saveButton, isSaving && styles.saveButtonDisabled, pressed && styles.saveButtonPressed]}
            >
              <Check color={colors.white} size={21} strokeWidth={2.8} />
              <Text style={styles.saveButtonText}>{isSaving ? 'Salvando...' : 'Salvar animal'}</Text>
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

function BreedOption({
  breed,
  selected,
  onSelect,
}: {
  breed: string;
  selected: boolean;
  onSelect: (breed: string) => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => onSelect(breed)}
      style={({ pressed }) => [styles.breedOption, selected && styles.breedOptionActive, pressed && styles.selectionPressed]}
    >
      <Text style={[styles.breedOptionText, selected && styles.breedOptionTextActive]}>{breed}</Text>
    </Pressable>
  );
}

function AgeSlider({
  value,
  maximumValue,
  onValueChange,
}: {
  value: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
}) {
  const trackRef = useRef<View>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [trackPageX, setTrackPageX] = useState(0);
  const progress = maximumValue > 0 ? (value / maximumValue) * 100 : 0;

  const updateFromPosition = (screenX: number) => {
    if (trackWidth === 0) return;
    const position = Math.max(0, Math.min(1, (screenX - trackPageX) / trackWidth));
    onValueChange(position * maximumValue);
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gesture) => updateFromPosition(gesture.moveX),
    onPanResponderMove: (_, gesture) => updateFromPosition(gesture.moveX),
  }), [maximumValue, onValueChange, trackPageX, trackWidth]);

  function handleAccessibilityAction(actionName: string) {
    if (actionName === 'increment') onValueChange(Math.min(maximumValue, value + 1));
    if (actionName === 'decrement') onValueChange(Math.max(0, value - 1));
  }

  return (
    <View
      {...panResponder.panHandlers}
      accessibilityActions={[{ name: 'increment', label: 'Aumentar idade em um mês' }, { name: 'decrement', label: 'Diminuir idade em um mês' }]}
      accessibilityLabel="Idade do animal em meses"
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: maximumValue, now: value }}
      onAccessibilityAction={(event) => handleAccessibilityAction(event.nativeEvent.actionName)}
      onLayout={(event) => {
        setTrackWidth(event.nativeEvent.layout.width);
        trackRef.current?.measureInWindow((x) => setTrackPageX(x));
      }}
      ref={trackRef}
      style={styles.sliderTouchArea}
    >
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderProgress, { width: `${progress}%` }]} />
        <View style={[styles.sliderThumb, { left: `${progress}%` }]} />
      </View>
      <View style={styles.sliderRangeLabels}>
        <Text style={styles.helperText}>0 meses</Text>
        <Text style={styles.helperText}>{maximumValue} meses</Text>
      </View>
    </View>
  );
}

function AgeMonthsInput({
  value,
  maximumValue,
  onValueChange,
}: {
  value: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function handleChangeText(input: string) {
    if (!/^\d*$/.test(input)) return;
    setText(input);
    if (input) onValueChange(Math.min(maximumValue, Number(input)));
  }

  function normalizeValue() {
    const months = Math.min(maximumValue, Math.max(0, Number(text) || 0));
    setText(String(months));
    onValueChange(months);
  }

  return (
    <View style={styles.ageInputGroup}>
      <TextInput
        accessibilityLabel="Idade do animal em meses"
        keyboardType="number-pad"
        onBlur={normalizeValue}
        onChangeText={handleChangeText}
        selectTextOnFocus
        style={styles.ageInput}
        value={text}
      />
      <Text style={styles.ageUnit}>meses</Text>
    </View>
  );
}

function classifyAnimal(gender: AnimalInput['gender'], ageMonths: number): AnimalInput['category'] {
  if (gender === 'Fêmea') {
    if (ageMonths <= 10) return 'Bezerra';
    if (ageMonths <= 24) return 'Novilha';
    return 'Vaca';
  }

  if (ageMonths <= 10) return 'Bezerro';
  if (ageMonths <= 18) return 'Garrote';
  return 'Touro';
}

function getAgeInMonths(birthDate?: string): number | null {
  if (!birthDate) return null;
  const [day, month, year] = birthDate.split('/').map(Number);
  if (!day || !month || !year) return null;

  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year
    || birth.getMonth() !== month - 1
    || birth.getDate() !== day
    || birth < new Date(MIN_BIRTH_YEAR, 0, 1)
    || birth > new Date()
  ) return null;

  const today = new Date();
  const months = (today.getFullYear() - year) * 12 + today.getMonth() - (month - 1);
  return Math.max(0, months - (today.getDate() < day ? 1 : 0));
}

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}

function estimateBirthDate(ageMonths: number) {
  const birthDate = new Date();
  const day = birthDate.getDate();
  birthDate.setDate(1);
  birthDate.setMonth(birthDate.getMonth() - ageMonths);
  const lastDayOfMonth = new Date(birthDate.getFullYear(), birthDate.getMonth() + 1, 0).getDate();
  birthDate.setDate(Math.min(day, lastDayOfMonth));
  return formatDate(birthDate);
}

const styles = StyleSheet.create({
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
  ageInput: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
    minWidth: 42,
    padding: 0,
    textAlign: 'right',
  },
  ageInputGroup: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  ageUnit: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  ageValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breedGroupLabel: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  breedOption: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  breedOptionActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  breedOptionText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  breedOptionTextActive: {
    color: colors.primary,
  },
  breedOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  classificationValue: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  otherBreedButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  otherBreedButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  otherBreedButtonText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  otherBreedButtonTextActive: {
    color: colors.primary,
  },
  sliderProgress: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    height: 6,
  },
  sliderRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sliderThumb: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: 12,
    borderWidth: 3,
    height: 24,
    marginLeft: -12,
    marginTop: -9,
    position: 'absolute',
    width: 24,
  },
  sliderTouchArea: {
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  sliderTrack: {
    backgroundColor: colors.border,
    borderRadius: 5,
    height: 6,
    justifyContent: 'center',
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
  saveButtonDisabled: { opacity: 0.65 },
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
