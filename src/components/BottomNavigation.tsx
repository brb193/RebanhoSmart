import { Bell, Home, PawPrint, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

export type AppTabIndex = 0 | 1 | 2 | 3;

const TABS: Array<{ index: AppTabIndex; icon: typeof Home; label: string }> = [
  { index: 0, icon: Home, label: 'Início' },
  { index: 1, icon: PawPrint, label: 'Animais' },
  { index: 2, icon: Bell, label: 'Alertas' },
  { index: 3, icon: Sparkles, label: 'Consulta' },
];

interface BottomNavigationProps {
  activeTab: AppTabIndex;
  alertCount: number;
  onTabChange: (tabIndex: AppTabIndex) => void;
}

export function BottomNavigation({ activeTab, alertCount, onTabChange }: BottomNavigationProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const selected = activeTab === tab.index;

        return (
          <Pressable
            accessibilityLabel={tab.index === 2 ? `${tab.label}, ${alertCount} alertas` : tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={tab.label}
            onPress={() => onTabChange(tab.index)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <Icon color={selected ? colors.primary : colors.muted} size={22} strokeWidth={selected ? 2.5 : 2} />
              {tab.index === 2 && alertCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{alertCount > 99 ? '99+' : alertCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 60,
    paddingBottom: 3,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  iconWrap: { position: 'relative' },
  label: { color: colors.muted, fontFamily: fonts.medium, fontSize: 14 },
  labelSelected: { color: colors.primary, fontFamily: fonts.bold },
  badge: {
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderColor: colors.white,
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -11,
    top: -6,
  },
  badgeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 10, lineHeight: 13 },
  pressed: { opacity: 0.7 },
});
