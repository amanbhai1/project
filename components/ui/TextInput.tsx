import React, { useState } from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet, TextInputProps, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextInput({
  label,
  error,
  helperText,
  style,
  ...props
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.outline;
  };

  const getInputStyle = () => {
    const baseStyle = {
      backgroundColor: colors.surface,
      borderColor: getBorderColor(),
      color: colors.onSurface,
    };

    // Only add textAlignVertical on native platforms
    if (Platform.OS !== 'web') {
      return {
        ...baseStyle,
        textAlignVertical: 'top' as const,
      };
    }

    return baseStyle;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          getInputStyle(),
        ]}
        placeholderTextColor={colors.onSurfaceVariant}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            { color: error ? colors.error : colors.onSurfaceVariant },
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 48,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});
