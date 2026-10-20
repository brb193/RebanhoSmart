import type { ReactNode } from 'react';
import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts } from '../theme';

interface FormInputProps extends TextInputProps {
  accessory?: ReactNode;
  focused?: boolean;
  helperText?: string;
  icon: ReactNode;
  label: string;
}

export function FormInput({
  accessory,
  focused = false,
  helperText,
  icon,
  label,
  ...inputProps
}: FormInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.control, focused && styles.controlFocused]}>
        <View style={styles.leadingIcon}>{icon}</View>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          style={styles.input}
          {...inputProps}
        />
        {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
      </View>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  accessory: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  control: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  controlFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  field: {
    gap: 7,
  },
  helper: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    minHeight: 50,
    paddingVertical: 0,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  leadingIcon: {
    marginRight: 11,
  },
});
