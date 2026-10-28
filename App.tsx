import { useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from './src/components/AuthScreen';
import { AnimalRegistrationScreen, type AnimalInput } from './src/components/AnimalRegistrationScreen';
import { DashboardScreen } from './src/components/DashboardScreen';
import { AnimalListScreen, type Animal } from './src/components/AnimalListScreen';
import { AnimalProfileScreen, type AnimalProfile } from './src/components/AnimalProfileScreen';
import { SmartConsultationScreen } from './src/components/SmartConsultationScreen';
import { AlertsScreen, type AlertItem } from './src/components/AlertsScreen';
import type { ListLoadStatus } from './src/components/ListLoadState';
import { SystemStateCatalogScreen } from './src/components/SystemStateCatalogScreen';
import {
  HandlingRegistrationScreen,
  type HandlingAnimal,
  type HandlingFormData,
} from './src/components/HandlingRegistrationScreen';
import { loadLocalAppData, saveLocalAppData, type LocalAppData } from './src/storage/localData';
import { colors } from './src/theme';

type AppScreen = 'auth' | 'dashboard' | 'animals' | 'animal-registration' | 'animal-profile' | 'handling-registration' | 'smart-consultation' | 'alerts' | 'system-state-catalog';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('auth');
  const [editingAnimal, setEditingAnimal] = useState<AnimalInput | undefined>();
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [localData, setLocalData] = useState<LocalAppData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [listLoadStatus, setListLoadStatus] = useState<ListLoadStatus>('ready');
  const [listRetryToken, setListRetryToken] = useState(0);
  const dataRef = useRef<LocalAppData | null>(null);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  });

  useEffect(() => {
    let isMounted = true;

    loadLocalAppData()
      .then((loadedData) => {
        if (!isMounted) return;
        dataRef.current = loadedData;
        setLocalData(loadedData);
        setLoadError(false);
      })
      .catch((error: unknown) => {
        console.error('Não foi possível carregar os dados locais.', error);
        if (isMounted) setLoadError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (screen !== 'animals' && screen !== 'alerts') return;

    let isMounted = true;
    setListLoadStatus('loading');

    loadLocalAppData()
      .then((loadedData) => {
        if (!isMounted) return;
        dataRef.current = loadedData;
        setLocalData(loadedData);
        setListLoadStatus('ready');
      })
      .catch((error: unknown) => {
        console.error(`Não foi possível carregar a lista de ${screen}.`, error);
        if (isMounted) setListLoadStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [screen, listRetryToken]);

  function retryLoadData() {
    setIsLoadingData(true);
    setLoadError(false);
    loadLocalAppData()
      .then((loadedData) => {
        dataRef.current = loadedData;
        setLocalData(loadedData);
      })
      .catch((error: unknown) => {
        console.error('Não foi possível carregar os dados locais.', error);
        setLoadError(true);
      })
      .finally(() => setIsLoadingData(false));
  }

  function retryCurrentList() {
    setListRetryToken((current) => current + 1);
  }

  function persistData(update: (current: LocalAppData) => LocalAppData): Promise<boolean> {
    const operation = writeQueueRef.current.then(async () => {
      const current = dataRef.current;
      if (!current) return false;

      const next = update(current);
      await saveLocalAppData(next);
      dataRef.current = next;
      setLocalData(next);
      return true;
    });

    const result = operation.catch((error: unknown) => {
      console.error('Não foi possível salvar os dados locais.', error);
      Alert.alert(
        'Não foi possível salvar',
        'A alteração não foi gravada no aparelho. Tente novamente.',
      );
      return false;
    });
    writeQueueRef.current = result.then(() => undefined);
    return result;
  }

  if (!fontsLoaded || isLoadingData) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (loadError || !localData) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadErrorTitle}>Não foi possível carregar os dados salvos.</Text>
        <Pressable accessibilityRole="button" onPress={retryLoadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const appData = localData;
  const selectedAnimal = selectedAnimalId ? appData.profiles[selectedAnimalId] : undefined;
  const handlingAnimals: HandlingAnimal[] = appData.animals.map((animal) => ({
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

  async function handleSaveAnimal(data: AnimalInput): Promise<boolean> {
    const isEditing = editingAnimal !== undefined;
    const animalId = isEditing && selectedAnimalId ? selectedAnimalId : `animal-${Date.now()}`;
    const saved = await persistData((current) => {
      const existingAnimal = current.animals.find((animal) => animal.id === animalId);
      const listAnimal: Animal = {
        id: animalId,
        brinco: data.tagNumber,
        nome: data.name,
        categoria: categoryToListCategory(data.category),
        raca: data.breed,
        status: existingAnimal?.status ?? 'Em dia',
      };
      const profile: AnimalProfile = {
        ...(current.profiles[animalId] ?? createEmptyProfile(data)),
        birthDate: data.birthDate ?? '',
        breed: data.breed,
        category: data.category,
        gender: data.gender,
        name: data.name,
        notes: data.notes,
        origin: data.origin,
        photoUri: data.photoUri,
        status: data.status === 'Ativo' ? 'Ativa' : 'Inativa',
        tagNumber: data.tagNumber,
      };

      return {
        ...current,
        animals: existingAnimal
          ? current.animals.map((animal) => animal.id === animalId ? listAnimal : animal)
          : [...current.animals, listAnimal],
        profiles: { ...current.profiles, [animalId]: profile },
      };
    });
    if (!saved) return false;
    setSelectedAnimalId(animalId);
    setEditingAnimal(undefined);
    setScreen(isEditing ? 'animal-profile' : 'animals');
    return true;
  }

  function handleOpenAnimal(animal: Animal) {
    setSelectedAnimalId(animal.id);
    setScreen('animal-profile');
  }

  function handleEditAnimal(tagNumber: string) {
    if (!selectedAnimal || tagNumber !== selectedAnimal.tagNumber) return;

    setSelectedAnimalId(appData.animals.find((animal) => animal.brinco === tagNumber)?.id ?? null);
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

  async function handleDeleteAnimal(tagNumber: string): Promise<boolean> {
    const animalId = appData.animals.find((animal) => animal.brinco === tagNumber)?.id;
    if (!animalId) return false;

    const saved = await persistData((current) => {
      const { [animalId]: _deletedProfile, ...profiles } = current.profiles;
      return {
        ...current,
        animals: current.animals.filter((animal) => animal.id !== animalId),
        profiles,
      };
    });
    if (!saved) return false;
    setSelectedAnimalId(null);
    setEditingAnimal(undefined);
    setScreen('animals');
    return true;
  }

  function handleCancelAnimalForm() {
    setScreen(editingAnimal ? 'animal-profile' : 'animals');
  }

  async function handleSaveWeight(weight: number, date: string): Promise<boolean> {
    if (!selectedAnimalId) return false;
    const item = {
      id: `weight-${Date.now()}`,
      type: 'weight' as const,
      title: 'Pesagem',
      date,
      details: `${formatWeight(weight)} kg`,
      status: 'Concluído' as const,
    };

    return persistData((current) => {
      const profile = current.profiles[selectedAnimalId];
      if (!profile) return current;
      const history = [...profile.history, item].sort(
        (first, second) => dateValue(second.date) - dateValue(first.date),
      );
      const isMostRecentWeight = !profile.lastWeightDate
        || profile.lastWeightDate === '—'
        || dateValue(date) >= dateValue(profile.lastWeightDate);
      return {
        ...current,
        profiles: {
          ...current.profiles,
          [selectedAnimalId]: {
            ...profile,
            history,
            ...(isMostRecentWeight ? { currentWeight: weight, lastWeightDate: date } : {}),
          },
        },
      };
    });
  }

  function handleNavigateToHandling(tagNumber: string) {
    if (tagNumber === selectedAnimal?.tagNumber) setScreen('handling-registration');
  }

  async function handleConfirmHandlingSave(formData: HandlingFormData): Promise<boolean> {
    const handlingId = `handling-${Date.now()}`;
    const handlingDate = formatIsoDate(formData.scheduledDate);
    const typeByTitle: Record<HandlingFormData['type'], AnimalProfile['history'][number]['type']> = {
      Vacinação: 'vaccine',
      Vermifugação: 'deworming',
      Inseminação: 'breeding',
      Parto: 'birth',
      Secagem: 'drying',
    };

    return persistData((current) => {
      const profiles = { ...current.profiles };
      for (const animalId of formData.targetAnimalIds) {
        const profile = profiles[animalId];
        if (!profile) continue;

        const item = {
          id: handlingId,
          type: typeByTitle[formData.type],
          title: formData.type,
          date: handlingDate,
          status: formData.status === 'Realizado' ? 'Realizado' as const : 'Agendado' as const,
          details: formData.notes || undefined,
        };
        profiles[animalId] = {
          ...profile,
          history: [...profile.history, item].sort(
            (first, second) => dateValue(second.date) - dateValue(first.date),
          ),
          ...(formData.status === 'Agendado'
            ? {
                nextHandling: {
                  title: formData.type,
                  date: handlingDate,
                  daysNotice: formatDaysNotice(handlingDate),
                },
              }
            : {}),
        };
      }
      return {
        ...current,
        handlingRecords: [...current.handlingRecords, formData],
        profiles,
      };
    });
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'auth' && <AuthScreen onSuccess={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && (
        <DashboardScreen
          animals={appData.animals}
          alerts={appData.alerts}
          onNavigateToDashboard={() => setScreen('dashboard')}
          onNavigateToAnimals={() => setScreen('animals')}
          onNavigateToAlerts={() => setScreen('alerts')}
          onNavigateToConsultation={() => setScreen('smart-consultation')}
          onOpenStateCatalog={() => setScreen('system-state-catalog')}
        />
      )}
      {screen === 'animals' && (
        <AnimalListScreen
          animals={appData.animals}
          alertCount={appData.alerts.length}
          loadStatus={listLoadStatus}
          onRetryLoad={retryCurrentList}
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
      {screen === 'animal-profile' && selectedAnimal && (
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
          animals={handlingAnimals}
          initialAnimalId={handlingAnimals.find((animal) => animal.tagNumber === selectedAnimal?.tagNumber)?.id || ''}
          onCancel={() => setScreen('animal-profile')}
          onConfirmHandlingSave={handleConfirmHandlingSave}
          onReturnToDashboard={() => setScreen('dashboard')}
          onViewHandlingDetails={() => setScreen('dashboard')}
        />
      )}
      {screen === 'smart-consultation' && (
        <SmartConsultationScreen
          alertCount={appData.alerts.length}
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
          alerts={appData.alerts}
          loadStatus={listLoadStatus}
          onRetryLoad={retryCurrentList}
          onClearSelectedAlert={() => setSelectedAlertId(null)}
          onResolveAlert={(alertId) => persistData((current) => ({
            ...current,
            alerts: current.alerts.filter((alert) => alert.id !== alertId),
          }))}
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
      {screen === 'system-state-catalog' && (
        <SystemStateCatalogScreen
          initialState="loading"
          onCancelAction={() => setScreen('dashboard')}
          onContinueOffline={() => setScreen('dashboard')}
          onRefreshConflictData={() => console.log('Dados atualizados para revisão.')}
        />
      )}
    </>
  );
}

function formatWeight(weight: number) {
  return Number.isInteger(weight) ? String(weight) : weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function categoryToListCategory(category: AnimalInput['category']): Animal['categoria'] {
  if (category === 'Vaca') return 'Vacas';
  if (category === 'Novilha') return 'Novilhas';
  if (category === 'Bezerro') return 'Bezerros';
  return 'Touros';
}

function createEmptyProfile(animal: AnimalInput): AnimalProfile {
  return {
    tagNumber: animal.tagNumber,
    name: animal.name,
    photoUri: animal.photoUri,
    category: animal.category,
    breed: animal.breed,
    gender: animal.gender,
    birthDate: animal.birthDate ?? '',
    origin: animal.origin,
    status: animal.status === 'Ativo' ? 'Ativa' : 'Inativa',
    currentWeight: 0,
    lastWeightDate: '—',
    history: [],
    notes: animal.notes,
  };
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
  loadErrorTitle: {
    color: colors.text,
    fontSize: 17,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});
