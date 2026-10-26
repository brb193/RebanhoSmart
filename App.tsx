import { useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthScreen } from './src/components/AuthScreen';
import { AnimalRegistrationScreen, type AnimalInput } from './src/components/AnimalRegistrationScreen';
import { DashboardScreen } from './src/components/DashboardScreen';
import { AnimalListScreen } from './src/components/AnimalListScreen';
import { colors } from './src/theme';

type AppScreen = 'auth' | 'dashboard' | 'animals' | 'animal-registration';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('auth');
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

  function handleSaveAnimal(_data: AnimalInput) {
    setScreen('animals');
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen === 'auth' && <AuthScreen onSuccess={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && <DashboardScreen onNavigateToAnimals={() => setScreen('animals')} />}
      {screen === 'animals' && <AnimalListScreen onNavigateToCreateAnimal={() => setScreen('animal-registration')} />}
      {screen === 'animal-registration' && (
        <AnimalRegistrationScreen
          onCancel={() => setScreen('animals')}
          onSaveAnimal={handleSaveAnimal}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colors.page,
    flex: 1,
    justifyContent: 'center',
  },
});
