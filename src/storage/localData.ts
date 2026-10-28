import AsyncStorage from '@react-native-async-storage/async-storage';

import { MOCK_ALERTS, type AlertItem } from '../components/AlertsScreen';
import { MOCK_ANIMALS, type Animal } from '../components/AnimalListScreen';
import type { AnimalProfile } from '../components/AnimalProfileScreen';
import type { HandlingFormData } from '../components/HandlingRegistrationScreen';

const STORAGE_KEY = 'rebanho-smart.local-data.v1';

export interface LocalAppData {
  alerts: AlertItem[];
  animals: Animal[];
  handlingRecords: HandlingFormData[];
  profiles: Record<string, AnimalProfile>;
}

export async function loadLocalAppData(): Promise<LocalAppData> {
  const savedData = await AsyncStorage.getItem(STORAGE_KEY);

  if (savedData === null) {
    const initialData = createInitialLocalAppData();
    await saveLocalAppData(initialData);
    return initialData;
  }

  const parsedData: unknown = JSON.parse(savedData);
  if (!isLocalAppData(parsedData)) {
    throw new Error('Os dados salvos no aparelho estão em um formato inválido.');
  }

  return parsedData;
}

export async function saveLocalAppData(data: LocalAppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isLocalAppData(value: unknown): value is LocalAppData {
  if (!value || typeof value !== 'object') return false;

  const data = value as Record<string, unknown>;
  return Array.isArray(data.animals)
    && Array.isArray(data.alerts)
    && Array.isArray(data.handlingRecords)
    && data.profiles !== null
    && typeof data.profiles === 'object'
    && !Array.isArray(data.profiles);
}

function createInitialLocalAppData(): LocalAppData {
  const profiles = Object.fromEntries(
    MOCK_ANIMALS.map((animal) => [animal.id, createProfile(animal)]),
  );
  const mimosa = MOCK_ANIMALS.find((animal) => animal.brinco === '#024');

  if (mimosa) {
    profiles[mimosa.id] = {
      ...profiles[mimosa.id],
      birthDate: '12/04/2021',
      photoUri: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=900&q=80',
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
  }

  return {
    animals: MOCK_ANIMALS,
    alerts: MOCK_ALERTS,
    handlingRecords: [],
    profiles,
  };
}

function createProfile(animal: Animal): AnimalProfile {
  const category = animal.categoria === 'Vacas'
    ? 'Vaca'
    : animal.categoria === 'Novilhas'
      ? 'Novilha'
      : animal.categoria === 'Bezerros'
        ? 'Bezerro'
        : 'Touro';

  return {
    tagNumber: animal.brinco,
    name: animal.nome,
    photoUri: null,
    category,
    breed: animal.raca,
    gender: category === 'Touro' ? 'Macho' : 'Fêmea',
    birthDate: '',
    origin: 'Nascido no Local',
    status: 'Ativa',
    currentWeight: 0,
    lastWeightDate: '—',
    history: [],
  };
}
