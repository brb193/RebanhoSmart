import React from 'react';
import { PawPrint, ShieldCheck, WifiOff } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

interface AnimalEmptyStateProps {
  onNavigateToCreateAnimal: () => void;
}

export function AnimalEmptyState({ onNavigateToCreateAnimal }: AnimalEmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <PawPrint color={colors.primary} size={48} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Nenhum animal cadastrado</Text>
        <Text style={styles.description}>
          Cadastre seu primeiro animal para começar a acompanhar manejos, pesagens e alertas do seu rebanho.
        </Text>

        <View style={styles.eduCard}>
          <Text style={styles.eduCardText}>
            Com o cadastro você terá acesso ao histórico completo de vacinas, pesagens e poderá planejar o manejo reprodutivo de forma organizada.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onNavigateToCreateAnimal}
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
        >
          <Text style={styles.ctaButtonText}>+ Cadastrar primeiro animal</Text>
        </Pressable>
      </View>

      <View style={styles.offlineBox}>
        <View style={styles.offlineIconBadge}>
          <WifiOff color={colors.primary} size={18} strokeWidth={2.4} />
        </View>
        <Text style={styles.offlineText}>
          Você pode cadastrar animais mesmo sem internet; todos os dados ficam salvos com segurança no aparelho.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.page,
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    marginTop: 32,
    width: '100%',
  },
  ctaButtonPressed: {
    backgroundColor: colors.primaryActive,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  description: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  eduCard: {
    backgroundColor: colors.input,
    borderColor: '#D0DBED',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },
  eduCardText: {
    color: '#1E3A8A',
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 20,
    width: 80,
  },
  offlineBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  offlineIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  offlineText: {
    color: colors.muted,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    textAlign: 'center',
  },
});