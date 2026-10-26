import { useState } from 'react';
import { ArrowLeft, Calendar, Syringe } from 'lucide-react-native';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';

const HANDLING_TYPES = ['Vacinação', 'Vermifugação', 'Inseminação / Cobertura', 'Parto', 'Secagem'] as const;
const HANDLING_STATUSES = ['Agendado / Pendente', 'Realizado'] as const;

export interface HandlingRecord {
  type: (typeof HANDLING_TYPES)[number];
  date: string;
  status: (typeof HANDLING_STATUSES)[number];
  notes: string;
}

interface HandlingRegistrationScreenProps {
  animalName?: string;
  tagNumber: string;
  onBack: () => void;
  onSave: (record: HandlingRecord) => void;
}

export function HandlingRegistrationScreen({
  animalName,
  tagNumber,
  onBack,
  onSave,
}: HandlingRegistrationScreenProps) {
  const [type, setType] = useState<HandlingRecord['type']>(HANDLING_TYPES[0]);
  const [date, setDate] = useState(getTodayDate());
  const [status, setStatus] = useState<HandlingRecord['status']>(HANDLING_STATUSES[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!isValidDate(date)) {
      setError('Informe uma data válida no formato DD/MM/AAAA.');
      return;
    }

    onSave({ type, date, status, notes: notes.trim() });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Voltar ao prontuário" accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} strokeWidth={2.3} />
          </Pressable>
          <Text accessibilityRole="header" style={styles.topBarTitle}>Registrar Manejo</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.animalCard}>
            <Syringe color={colors.primary} size={23} strokeWidth={2.3} />
            <View style={styles.animalDetails}>
              <Text style={styles.animalLabel}>Animal selecionado · Individual</Text>
              <Text style={styles.animalName}>{tagNumber}{animalName ? ` - ${animalName}` : ''}</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Tipo de manejo *</Text>
          <View style={styles.options}>
            {HANDLING_TYPES.map((option) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: type === option }}
                key={option}
                onPress={() => setType(option)}
                style={[styles.option, type === option && styles.optionSelected]}
              >
                <Text style={[styles.optionText, type === option && styles.optionTextSelected]}>{option}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Data prevista / realização *</Text>
          <View style={styles.dateField}>
            <Calendar color={colors.primary} size={20} strokeWidth={2.2} />
            <TextInput
              accessibilityLabel="Data prevista ou de realização"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              onChangeText={(value) => {
                setDate(value);
                setError(null);
              }}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.muted}
              style={styles.dateInput}
              value={date}
            />
          </View>

          <Text style={styles.fieldLabel}>Situação</Text>
          <View style={styles.statusOptions}>
            {HANDLING_STATUSES.map((option) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: status === option }}
                key={option}
                onPress={() => setStatus(option)}
                style={[styles.statusOption, status === option && styles.optionSelected]}
              >
                <Text style={[styles.optionText, status === option && styles.optionTextSelected]}>{option}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Observações</Text>
          <TextInput
            accessibilityLabel="Observações do manejo"
            multiline
            onChangeText={setNotes}
            placeholder="Adicione uma observação, se necessário"
            placeholderTextColor={colors.muted}
            style={styles.notesInput}
            textAlignVertical="top"
            value={notes}
          />
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={handleSave} style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}>
            <Text style={styles.saveButtonText}>Salvar manejo</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
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

const styles = StyleSheet.create({
  safeArea: {
    alignItems: 'center',
    backgroundColor: colors.page,
    flex: 1,
  },
  screen: {
    backgroundColor: colors.page,
    flex: 1,
    maxWidth: 390,
    width: '100%',
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
  backButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  topBarTitle: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    gap: 12,
    padding: 20,
    paddingBottom: 28,
  },
  animalCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    minHeight: 76,
    padding: 14,
  },
  animalDetails: {
    flex: 1,
    gap: 3,
  },
  animalLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  animalName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  dateField: {
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
  dateInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    minHeight: 50,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 8,
  },
  notesInput: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 100,
    padding: 12,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 52,
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryActive,
  },
  saveButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
});
