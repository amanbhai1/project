import React, { useRef } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  Animated,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'text' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const { colors } = useTheme();
  
  // Animation references
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: size === 'small' ? 12 : size === 'large' ? 20 : 16,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      overflow: 'hidden' as const,
    };

    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
      medium: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 48 },
      large: { paddingVertical: 18, paddingHorizontal: 32, minHeight: 56 },
    };

    const variantStyles = {
      filled: {
        backgroundColor: disabled ? colors.outline : colors.primary,
        shadowColor: colors.primary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: disabled ? 0 : 0.3,
        shadowRadius: 8,
        elevation: disabled ? 0 : 6,
      },
      gradient: {
        backgroundColor: 'transparent',
        shadowColor: colors.primary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: disabled ? 0 : 0.3,
        shadowRadius: 8,
        elevation: disabled ? 0 : 6,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? colors.outline : colors.primary,
      },
      text: {
        backgroundColor: 'transparent',
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: '600' as const,
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
    };

    const variantTextStyles = {
      filled: {
        color: disabled ? colors.onSurfaceVariant : '#FFFFFF',
      },
      gradient: {
        color: disabled ? colors.onSurfaceVariant : '#FFFFFF',
      },
      outlined: {
        color: disabled ? colors.onSurfaceVariant : colors.primary,
      },
      text: {
        color: disabled ? colors.onSurfaceVariant : colors.primary,
      },
    };

    return [baseTextStyle, variantTextStyles[variant]];
  };

  const getGradientColors = () => {
    if (disabled) {
      return [colors.outline, colors.outline];
    }
    return [colors.primary, colors.primary + 'CC'];
  };

  const ButtonContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' || variant === 'gradient' ? '#FFFFFF' : colors.primary}
          style={{ marginRight: (leftIcon || title) ? 8 : 0 }}
        />
      )}
      {leftIcon && !loading && (
        <Animated.View style={{ marginRight: 8, opacity: opacityAnim }}>
          {leftIcon}
        </Animated.View>
      )}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      {rightIcon && !loading && (
        <Animated.View style={{ marginLeft: 8, opacity: opacityAnim }}>
          {rightIcon}
        </Animated.View>
      )}
    </>
  );

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <Pressable
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title}
        android_ripple={{
          color: variant === 'filled' || variant === 'gradient' 
            ? 'rgba(255, 255, 255, 0.2)' 
            : colors.primary + '20',
          borderless: false,
        }}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          >
            <Animated.View style={[styles.gradientContent, { opacity: opacityAnim }]}>
              <ButtonContent />
            </Animated.View>
          </LinearGradient>
        ) : (
          <ButtonContent />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradientContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
});
