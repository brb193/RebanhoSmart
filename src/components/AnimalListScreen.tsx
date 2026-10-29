import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  PawPrint,
  Plus,
  Search,
  X,
} from 'lucide-react-native';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';

import { colors, fonts } from '../theme';
import { BottomNavigation, type AppTabIndex } from './BottomNavigation';
import { AnimalEmptyState } from './AnimalEmptyState';
import { ListLoadState, type ListLoadStatus } from './ListLoadState';
import { ScreenSafeArea as SafeAreaView } from './ScreenSafeArea';

type AnimalCategory = 'Todos' | 'Vacas' | 'Novilhas' | 'Bezerros' | 'Garrotes' | 'Touros';
type SanitaryStatus = 'Em dia' | 'Vacina atrasada' | 'Vermífugo pend.';

export interface Animal {
  id: string;
  brinco: string;
  nome?: string;
  categoria: Exclude<AnimalCategory, 'Todos'>;
  raca: string;
  status: SanitaryStatus;
  gender?: 'Fêmea' | 'Macho';
  ageMonths?: number;
}

// Mock de Dados - 40 Animais
export const MOCK_ANIMALS: Animal[] = [
  // Vacas (18)
  { id: '1', brinco: '#024', nome: 'Mimosa', categoria: 'Vacas', raca: 'Holandesa', status: 'Vacina atrasada' },
  { id: '2', brinco: '#025', nome: 'Estrela', categoria: 'Vacas', raca: 'Jersey', status: 'Em dia' },
  { id: '3', brinco: '#026', categoria: 'Vacas', raca: 'Girolando', status: 'Em dia' },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `vaca-${i + 4}`,
    brinco: `#0${i + 60}`,
    categoria: 'Vacas' as const,
    raca: 'Girolando',
    status: 'Em dia' as const,
  })),
  // Novilhas (8)
  { id: 'n1', brinco: '#027', nome: 'Aurora', categoria: 'Novilhas', raca: 'Holandesa', status: 'Vermífugo pend.' },
  { id: 'n2', brinco: '#031', categoria: 'Novilhas', raca: 'Girolando', status: 'Vacina atrasada' },
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `novilha-${i + 3}`,
    brinco: `#0${i + 75}`,
    categoria: 'Novilhas' as const,
    raca: 'Girolando',
    status: 'Em dia' as const,
  })),
  // Bezerros (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `bezerro-${i + 1}`,
    brinco: `#${35 + i}`,
    categoria: 'Bezerros' as const,
    raca: i % 2 === 0 ? 'Nelore' : 'Girolando',
    status: 'Em dia' as const,
  })),
  // Touros (4)
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `touro-${i + 1}`,
    brinco: `#00${i + 1}`,
    categoria: 'Touros' as const,
    raca: i % 2 === 0 ? 'Nelore' : 'Holandês',
    status: 'Em dia' as const,
  })),
];

const CATEGORIES: AnimalCategory[] = ['Todos', 'Vacas', 'Novilhas', 'Bezerros', 'Garrotes', 'Touros'];

interface AnimalListScreenProps {
  animals: Animal[];
  alertCount: number;
  loadStatus: ListLoadStatus;
  onRetryLoad: () => void;
  onNavigateToAnimal: (animal: Animal) => void;
  onNavigateToCreateAnimal: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToConsultation: () => void;
}

export function AnimalListScreen({
  animals,
  alertCount,
  loadStatus,
  onRetryLoad,
  onNavigateToAnimal,
  onNavigateToCreateAnimal,
  onNavigateToDashboard,
  onNavigateToAlerts,
  onNavigateToConsultation,
}: AnimalListScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory>('Todos');

  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchesSearch =
        animal.brinco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (animal.nome && animal.nome.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'Todos' || animal.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [animals, searchTerm, selectedCategory]);

  const categories = CATEGORIES.map((label) => ({
    label,
    count: label === 'Todos'
      ? animals.length
      : animals.filter((animal) => animal.categoria === label).length,
  }));

  const onSelectAnimal = (animal: Animal) => onNavigateToAnimal(animal);
  function onTabChange(tabIndex: AppTabIndex) {
    if (tabIndex === 0) onNavigateToDashboard();
    if (tabIndex === 2) onNavigateToAlerts();
    if (tabIndex === 3) onNavigateToConsultation();
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.phoneFrame}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Animais ({animals.length})</Text>
            <Text style={styles.subtitle}>
              {searchTerm || selectedCategory !== 'Todos'
                ? `${filteredAnimals.length} encontrados • Plantel cadastrado no aparelho`
                : 'Plantel ativo cadastrado no aparelho.'}
            </Text>
          </View>
          <Pressable 
            onPress={onNavigateToCreateAnimal}
            style={({ pressed }) => [styles.smallAddButton, pressed && styles.primaryPressed]}
          >
            <Plus color={colors.white} size={18} strokeWidth={2.5} />
            <Text style={styles.smallAddButtonText}>Novo</Text>
          </Pressable>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search color={colors.muted} size={20} strokeWidth={2} />
            <TextInput
              placeholder="Buscar por brinco (#) ou nome..."
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <Pressable onPress={() => setSearchTerm('')}>
                <X color={colors.muted} size={20} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filtros em Pílulas */}
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterScroll}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat.label}
                onPress={() => setSelectedCategory(cat.label)}
                style={[
                  styles.filterPill,
                  selectedCategory === cat.label && styles.filterPillActive
                ]}
              >
                <Text style={[
                  styles.filterPillText,
                  selectedCategory === cat.label && styles.filterPillTextActive
                ]}>
                  {cat.label} ({cat.count})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Lista ou Estado Vazio */}
        {loadStatus !== 'ready' ? (
          <View style={styles.listStatus}>
            <ListLoadState onRetry={onRetryLoad} status={loadStatus} />
          </View>
        ) : animals.length === 0 ? (
          <AnimalEmptyState onNavigateToCreateAnimal={onNavigateToCreateAnimal} />
        ) : filteredAnimals.length === 0 ? (
          <View style={styles.noResults}>
            <View style={styles.noResultsIcon}>
              <Search color={colors.primary} size={26} strokeWidth={2} />
            </View>
            <Text style={styles.noResultsTitle}>Nenhum animal encontrado</Text>
            <Text style={styles.noResultsDescription}>
              Tente outro brinco ou nome, ou remova os filtros.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
              }}
              style={({ pressed }) => [styles.clearFiltersButton, pressed && styles.primaryPressed]}
            >
              <Text style={styles.clearFiltersButtonText}>Limpar busca e filtros</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.listWrapper}>
            <FlatList
              data={filteredAnimals}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <AnimalCard animal={item} onPress={() => onSelectAnimal(item)} />
              )}
            />
            
            {/* CTA Fixo Inferior (Thumb Zone) */}
            <View style={styles.fabContainer}>
              <Pressable 
                onPress={onNavigateToCreateAnimal}
                style={({ pressed }) => [styles.fab, pressed && styles.primaryPressed]}
              >
                <Plus color={colors.white} size={24} strokeWidth={2.5} />
                <Text style={styles.fabText}>Cadastrar Animal</Text>
              </Pressable>
            </View>
          </View>
        )}

        <BottomNavigation activeTab={1} alertCount={alertCount} onTabChange={onTabChange} />
      </View>
    </SafeAreaView>
  );
}

function AnimalCard({ animal, onPress }: { animal: Animal; onPress: () => void }) {
  const statusStyles = {
    'Em dia': { bg: '#DCFCE7', text: '#166534' },
    'Vacina atrasada': { bg: '#FEE2E2', text: '#991B1B' },
    'Vermífugo pend.': { bg: '#FFEDD5', text: '#C2410C' },
  };

  const currentStatus = statusStyles[animal.status];

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardMain}>
        <View style={styles.cardHeader}>
          <View style={styles.brincoGroup}>
            <Text style={styles.brincoText}>{animal.brinco}</Text>
            <Text style={[styles.nomeText, !animal.nome && styles.noNome]}>
              {animal.nome || 'Sem nome registrado'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
            <Text style={[styles.statusText, { color: currentStatus.text }]}>
              {animal.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.categoryInfo}>
            <PawPrint color={colors.muted} size={16} />
            <Text style={styles.categoryInfoText}>
              {animal.categoria.slice(0, -1)} • {animal.raca}
            </Text>
          </View>
          <ChevronRight color={colors.border} size={20} strokeWidth={2.5} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
    alignItems: 'center',
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
    backgroundColor: colors.page,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  smallAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  smallAddButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    gap: 10,
    borderWidth: 1,
    borderColor: '#D0DBED',
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 15,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.muted,
  },
  filterPillTextActive: {
    color: colors.white,
  },
  listWrapper: {
    flex: 1,
  },
  listStatus: { flex: 1 },
  noResults: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  noResultsIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
  },
  noResultsTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  noResultsDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  clearFiltersButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  clearFiltersButtonText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.99 }],
  },
  cardMain: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  brincoGroup: {
    gap: 2,
  },
  brincoText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  nomeText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  noNome: {
    fontStyle: 'italic',
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryInfoText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
});
