import React, { useState, useMemo } from 'react';
import {
  Bell,
  ChevronRight,
  LayoutGrid,
  PawPrint,
  Plus,
  Search,
  X,
} from 'lucide-react-native';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';

import { colors, fonts } from '../theme';
import { AnimalEmptyState } from './AnimalEmptyState';

type AnimalCategory = 'Todos' | 'Vacas' | 'Novilhas' | 'Bezerros' | 'Touros';
type SanitaryStatus = 'Em dia' | 'Vacina atrasada' | 'Vermífugo pend.';

export interface Animal {
  id: string;
  brinco: string;
  nome?: string;
  categoria: Exclude<AnimalCategory, 'Todos'>;
  raca: string;
  status: SanitaryStatus;
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

const CATEGORIES: { label: AnimalCategory; count: number }[] = [
  { label: 'Todos', count: 40 },
  { label: 'Vacas', count: 18 },
  { label: 'Novilhas', count: 8 },
  { label: 'Bezerros', count: 10 },
  { label: 'Touros', count: 4 },
];

interface AnimalListScreenProps {
  onNavigateToAnimal: (animal: Animal) => void;
  onNavigateToCreateAnimal: () => void;
}

export function AnimalListScreen({ onNavigateToAnimal, onNavigateToCreateAnimal }: AnimalListScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory>('Todos');
  const [showEmptyState, setShowEmptyState] = useState(false);

  const filteredAnimals = useMemo(() => {
    if (showEmptyState) return [];

    return MOCK_ANIMALS.filter((animal) => {
      const matchesSearch =
        animal.brinco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (animal.nome && animal.nome.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'Todos' || animal.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, showEmptyState]);

  const onSelectAnimal = (animal: Animal) => onNavigateToAnimal(animal);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.phoneFrame}>
        {/* Alternador de Teste (Discreto) */}
        <Pressable 
          onPress={() => setShowEmptyState(!showEmptyState)}
          style={styles.devToggle}
        >
          <Text style={styles.devToggleText}>
            Teste: {showEmptyState ? 'Ver Lista Cheia' : 'Ver Estado Vazio'}
          </Text>
        </Pressable>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Animais ({filteredAnimals.length})</Text>
            <Text style={styles.subtitle}>Plantel ativo cadastrado no aparelho.</Text>
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
            {CATEGORIES.map((cat) => (
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
        {filteredAnimals.length === 0 ? (
          <AnimalEmptyState onNavigateToCreateAnimal={onNavigateToCreateAnimal} />
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

        {/* Tab Bar Inferior (Mock) */}
        <View style={styles.tabBar}>
          <View style={styles.tabItem}>
            <LayoutGrid color={colors.muted} size={22} />
            <Text style={styles.tabLabel}>Início</Text>
          </View>
          <View style={styles.tabItem}>
            <PawPrint color={colors.primary} size={22} strokeWidth={2.5} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Animais</Text>
          </View>
          <View style={styles.tabItem}>
            <View>
              <Bell color={colors.muted} size={22} />
              <View style={styles.tabBadge} />
            </View>
            <Text style={styles.tabLabel}>Alertas</Text>
          </View>
          <View style={styles.tabItem}>
            <Search color={colors.muted} size={22} />
            <Text style={styles.tabLabel}>Consulta</Text>
          </View>
        </View>
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
  devToggle: {
    padding: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  devToggleText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
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
  tabBar: {
    height: 70,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    paddingBottom: 5,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B91C1C',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
