import { ComponentProps } from 'react';
import { Platform, SafeAreaView as NativeSafeAreaView, StatusBar, StyleSheet } from 'react-native';

type ScreenSafeAreaProps = ComponentProps<typeof NativeSafeAreaView>;

export function ScreenSafeArea({ style, ...props }: ScreenSafeAreaProps) {
  return (
    <NativeSafeAreaView
      {...props}
      style={[
        style,
        Platform.OS === 'android' && styles.androidStatusBarInset,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  androidStatusBarInset: {
    paddingTop: StatusBar.currentHeight ?? 0,
  },
});
