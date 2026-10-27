import { useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthScreen } from './src/components/AuthScreen';
import { AnimalRegistrationScreen, type AnimalInput } from './src/components/AnimalRegistrationScreen';
import { DashboardScreen } from './src/components/DashboardScreen';
import { AnimalListScreen, MOCK_ANIMALS, type Animal } from './src/components/AnimalListScreen';
import { AnimalProfileScreen, type AnimalProfile } from './src/components/AnimalProfileScreen';
import { SmartConsultationScreen } from './src/components/SmartConsultationScreen';
import { AlertsScreen, MOCK_ALERTS, type AlertItem } from './src/components/AlertsScreen';
import {
  HandlingRegistrationScreen,
  type HandlingAnimal,
  type HandlingFormData,
} from './src/components/HandlingRegistrationScreen';
import { colors } from './src/theme';

type AppScreen = 'auth' | 'dashboard' | 'animals' | 'animal-registration' | 'animal-profile' | 'handling-registration' | 'smart-consultation' | 'alerts';

const HANDLING_ANIMALS: HandlingAnimal[] = MOCK_ANIMALS.map((animal) => ({
  id: animal.id,
  tagNumber: animal.brinco,
  name: animal.nome,
  category: animal.categoria === 'Vacas'
    ? 'Vaca'
    : animal.categoria === 'Novilhas'
      ? 'Novilha'
      : animal.categoria === 'Bezerros'
        ? 'Bezerro'
        : 'Touro',
  breed: animal.raca,
  hasPendingAlert: animal.status !== 'Em dia',
}));

const MIMOSA_PROFILE: AnimalProfile = {
  tagNumber: '#024',
  name: 'Mimosa',
  photoUri: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80',
  category: 'Vaca',
  breed: 'Holandesa',
  gender: 'Fêmea',
  birthDate: '12/04/2021',
  origin: 'Nascido no Local',
  status: 'Ativa',
  currentWeight: 420,
  lastWeightDate: '18/09/2026',
  nextHandling: {
    title: 'Vacinação Febre Aftosa',
    date: '25/09/2026',
    daysNotice: 'Em 2 dias',
  },
  history: [
    { id: 'weight-18-09-2026', type: 'weight', title: 'Pesagem', date: '18/09/2026', details: '420 kg', status: 'Concluído' },
    { id: 'deworming-10-08-2026', type: 'deworming', title: 'Vermifugação', date: '10/08/2026', status: 'Realizado' },
    { id: 'vaccine-15-05-2026', type: 'vaccine', title: 'Vacinação Febre Aftosa', date: '15/05/2026', status: 'Realizado' },
    { id: 'breeding-20-02-2026', type: 'breeding', title: 'Inseminação / Cobertura', date: '20/02/2026', status: 'Realizado' },
    { id: 'weight-10-01-2026', type: 'weight', title: 'Pesagem', date: '10/01/2026', details: '395 kg', status: 'Concluído' },
  ],
  notes: 'Animal manso, com boa adaptação à ordenha.',
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('auth');
  const [editingAnimal, setEditingAnimal] = useState<AnimalInput | undefined>();
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile>(MIMOSA_PROFILE);
  const [, setHandlingRecords] = useState<HandlingFormData[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  function handleSaveAnimal(data: AnimalInput) {
    if (!editingAnimal) {
      setScreen('animals');
      return;
    }

    setSelectedAnimal((current) => ({
      ...current,
      birthDate: data.birthDate || current.birthDate,
      breed: data.breed,
      category: data.category,
      gender: data.gender,
      name: data.name,
      notes: data.notes,
      origin: data.origin,
      photoUri: data.photoUri,
      status: data.status === 'Ativo' ? 'Ativa' : 'Inativa',
      tagNumber: data.tagNumber,
    }));
    setEditingAnimal(undefined);
    setScreen('animal-profile');
  }

  function handleOpenAnimal(animal: Animal) {
    if (animal.brinco === MIMOSA_PROFILE.tagNumber) {
      setSelectedAnimal((current) =>
        current.tagNumber === MIMOSA_PROFILE.tagNumber ? current : MIMOSA_PROFILE,
      );
    } else {
      setSelectedAnimal({
        ...MIMOSA_PROFILE,
        tagNumber: animal.brinco,
        name: animal.nome,
        category: animal.categoria === 'Vacas'
          ? 'Vaca'
          : animal.categoria === 'Novilhas'
            ? 'Novilha'
            : animal.categoria === 'Bezerros'
              ? 'Bezerro'
              : 'Touro',
        breed: animal.raca,
        gender: animal.categoria === 'Touros' ? 'Macho' : 'Fêmea',
        photoUri: null,
      });
    }

    setScreen('animal-profile');
  }

  function handleEditAnimal(tagNumber: string) {
    if (tagNumber !== selectedAnimal.tagNumber) return;

    setEditingAnimal({
      tagNumber: selectedAnimal.tagNumber,
      name: selectedAnimal.name,
      photoUri: selectedAnimal.photoUri,
      category: selectedAnimal.category === 'Vaca'
        || selectedAnimal.category === 'Novilha'
        || selectedAnimal.category === 'Bezerro'
        || selectedAnimal.category === 'Touro'
        ? selectedAnimal.category
        : 'Novilha',
      gender: selectedAnimal.gender === 'Macho' ? 'Macho' : 'Fêmea',
      breed: selectedAnimal.breed,
      birthDate: selectedAnimal.birthDate,
      origin: selectedAnimal.origin === 'Comprado' || selectedAnimal.origin === 'Externo' ? selectedAnimal.origin : 'Nascido no Local',
      status: selectedAnimal.status === 'Ativa' ? 'Ativo' : 'Inativo',
      notes: selectedAnimal.notes,
    });
    setScreen('animal-registration');
  }

  function handleDeleteAnimal(tagNumber: string) {
    console.log('Animal excluído:', tagNumber);
    setEditingAnimal(undefined);
    setScreen('animals');
  }

  function handleCancelAnimalForm() {
    setScreen(editingAnimal ? 'animal-profile' : 'animals');
  }

  function handleSaveWeight(weight: number, date: string) {
    console.log('Pesagem salva:', { weight, date });
    const item = {
      id: `weight-${Date.now()}`,
      type: 'weight' as const,
      title: 'Pesagem',
      date,
      details: `${formatWeight(weight)} kg`,
      status: 'Concluído' as const,
    };

    setSelectedAnimal((current) => {
      const history = [...current.history, item].sort(
        (first, second) => dateValue(second.date) - dateValue(first.date),
      );
      const isMostRecentWeight = dateValue(date) >= dateValue(current.lastWeightDate);

      return {
        ...current,
        history,
        ...(isMostRecentWeight ? { currentWeight: weight, lastWeightDate: date } : {}),
      };
    });
  }

  function handleNavigateToHandling(tagNumber: string) {
    if (tagNumber === selectedAnimal.tagNumber) setScreen('handling-registration');
  }

  function handleConfirmHandlingSave(formData: HandlingFormData) {
    setHandlingRecords((current) => [...current, formData]);
    const typeByTitle: Record<HandlingFormData['type'], AnimalProfile['history'][number]['type']> = {
      Vacinação: 'vaccine',
      Vermifugação: 'deworming',
      Inseminação: 'breeding',
      Parto: 'birth',
      Secagem: 'drying',
    };

    setSelectedAnimal((current) => {
      if (!formData.targetAnimalIds.some((id) =>
        HANDLING_ANIMALS.find((animal) => animal.id === id)?.tagNumber === current.tagNumber,
      )) {
        return current;
      }

      const item = {
        id: `handling-${Date.now()}`,
        type: typeByTitle[formData.type],
        title: formData.type,
        date: formatIsoDate(formData.scheduledDate),
        status: formData.status === 'Realizado' ? 'Realizado' as const : 'Agendado' as const,
        details: formData.notes || undefined,
      };

      return {
        ...current,
        history: [...current.history, item].sort(
          (first, second) => dateValue(second.date) - dateValue(first.date),
        ),
        ...(formData.status === 'Agendado'
          ? {
              nextHandling: {
                title: formData.type,
                date: formatIsoDate(formData.scheduledDate),
                daysNotice: formatDaysNotice(formatIsoDate(formData.scheduledDate)),
              },
            }
          : {}),
      };
    });
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'auth' && <AuthScreen onSuccess={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && (
        <DashboardScreen
          onNavigateToAnimals={() => setScreen('animals')}
          onNavigateToAlerts={() => setScreen('alerts')}
          onNavigateToConsultation={() => setScreen('smart-consultation')}
        />
      )}
      {screen === 'animals' && (
        <AnimalListScreen
          onNavigateToAlerts={() => setScreen('alerts')}
          onNavigateToConsultation={() => setScreen('smart-consultation')}
          onNavigateToDashboard={() => setScreen('dashboard')}
          onNavigateToAnimal={handleOpenAnimal}
          onNavigateToCreateAnimal={() => {
            setEditingAnimal(undefined);
            setScreen('animal-registration');
          }}
        />
      )}
      {screen === 'animal-registration' && (
        <AnimalRegistrationScreen
          initialAnimal={editingAnimal}
          onCancel={handleCancelAnimalForm}
          onSaveAnimal={handleSaveAnimal}
        />
      )}
      {screen === 'animal-profile' && (
        <AnimalProfileScreen
          animal={selectedAnimal}
          onBack={() => setScreen('animals')}
          onDeleteConfirm={handleDeleteAnimal}
          onEdit={handleEditAnimal}
          onNavigateToHandling={handleNavigateToHandling}
          onSaveWeight={handleSaveWeight}
        />
      )}
      {screen === 'handling-registration' && (
        <HandlingRegistrationScreen
          animals={HANDLING_ANIMALS}
          initialAnimalId={HANDLING_ANIMALS.find((animal) => animal.tagNumber === selectedAnimal.tagNumber)?.id || ''}
          onCancel={() => setScreen('animal-profile')}
          onConfirmHandlingSave={handleConfirmHandlingSave}
          onReturnToDashboard={() => setScreen('dashboard')}
          onViewHandlingDetails={() => setScreen('dashboard')}
        />
      )}
      {screen === 'smart-consultation' && (
        <SmartConsultationScreen
          onTabChange={(tabIndex) => {
            if (tabIndex === 0) setScreen('dashboard');
            if (tabIndex === 2) setScreen('alerts');
            if (tabIndex === 1) setScreen('animals');
            if (tabIndex === 3) setScreen('smart-consultation');
          }}
        />
      )}
      {screen === 'alerts' && (
        <AlertsScreen
          alerts={alerts}
          onClearSelectedAlert={() => setSelectedAlertId(null)}
          onResolveAlert={(alertId) => setAlerts((current) => current.filter((alert) => alert.id !== alertId))}
          onSelectAlert={(handlingId) => setSelectedAlertId(handlingId)}
          onTabChange={(tabIndex) => {
            if (tabIndex === 0) setScreen('dashboard');
            if (tabIndex === 1) setScreen('animals');
            if (tabIndex === 2) setScreen('alerts');
            if (tabIndex === 3) setScreen('smart-consultation');
          }}
          selectedAlertId={selectedAlertId}
        />
      )}
    </>
  );
}

function formatWeight(weight: number) {
  return Number.isInteger(weight) ? String(weight) : weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function formatIsoDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function dateValue(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day).getTime();
}

function formatDaysNotice(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  const handlingDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((handlingDate.getTime() - today.getTime()) / 86_400_000);

  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days === -1) return 'Há 1 dia';
  return days > 0 ? `Em ${days} dias` : `Há ${Math.abs(days)} dias`;
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colors.page,
    flex: 1,
    justifyContent: 'center',
  },
});
