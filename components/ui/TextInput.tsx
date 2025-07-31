import React, { useState, useRef, useEffect } from 'react';
import { 
  TextInput as RNTextInput, 
  View, 
  Text, 
  StyleSheet, 
  TextInputProps, 
  Platform,
  Animated,
  Pressable
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function TextInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();
  
  // Animation values
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const labelScaleAnim = useRef(new Animated.Value(0)).current;
  const labelTranslateYAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate border color
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Animate label
    Animated.parallel([
      Animated.timing(labelScaleAnim, {
        toValue: isFocused || props.value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(labelTranslateYAnim, {
        toValue: isFocused || props.value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, props.value]);

  useEffect(() => {
    // Shake animation on error
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const getBorderColor = () => {
    if (error) return colors.error;
    return borderColorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.outline, colors.primary],
    });
  };

  const getInputStyle = () => {
    const baseStyle = {
      backgroundColor: colors.surface,
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

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View 
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <View style={styles.inputWrapper}>
          {label && (
            <Animated.Text
              style={[
                styles.label,
                { 
                  color: error ? colors.error : isFocused ? colors.primary : colors.onSurfaceVariant,
                  transform: [
                    {
                      scale: labelScaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.85],
                      }),
                    },
                    {
                      translateY: labelTranslateYAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -28],
                      }),
                    },
                  ],
                }
              ]}
            >
              {label}
            </Animated.Text>
          )}
          
          <RNTextInput
            style={[
              styles.input,
              getInputStyle(),
              {
                paddingTop: label && (isFocused || props.value) ? 20 : 16,
              },
            ]}
            placeholderTextColor={colors.onSurfaceVariant}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </View>

        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </Animated.View>

      {(error || helperText) && (
        <Animated.Text
          style={[
            styles.helperText,
            { 
              color: error ? colors.error : colors.onSurfaceVariant,
              opacity: error || helperText ? 1 : 0,
            },
          ]}
        >
          {error || helperText}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'center',
  },
  rightIconContainer: {
    paddingRight: 16,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 20,
    fontSize: 16,
    fontWeight: '500',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
    margin: 0,
    borderWidth: 0,
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 16,
    fontWeight: '500',
  },
});
