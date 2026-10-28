import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

export type ListLoadStatus = 'ready' | 'loading' | 'error';

interface ListLoadStateProps {
  onRetry: () => void;
  status: ListLoadStatus;
}

export function ListLoadState({ onRetry, status }: ListLoadStateProps) {
  if (status === 'ready') return null;

  if (status === 'loading') {
    return (
      <View accessibilityLiveRegion="polite" style={styles.container}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.title}>Carregando registros...</Text>
        <Text style={styles.description}>Aguarde enquanto os dados salvos são atualizados.</Text>
      </View>
    );
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <View style={styles.errorIcon}>
        <AlertCircle color={colors.error} size={28} />
      </View>
      <Text style={styles.title}>Não foi possível carregar os registros</Text>
      <Text style={styles.description}>
        Os dados salvos não puderam ser lidos. Tente novamente.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
      >
        <RefreshCw color={colors.white} size={17} />
        <Text style={styles.retryText}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  errorIcon: {
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 23,
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  retryPressed: { backgroundColor: colors.primaryActive },
  retryText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 14 },
});
