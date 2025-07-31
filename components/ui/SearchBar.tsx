import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Pressable, 
  StyleSheet,
  Animated,
  Platform
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  style?: any;
}

export function SearchBar({
  placeholder = 'Search notes...',
  value,
  onChangeText,
  onClear,
  style,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();
  
  // Animation references
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const clearButtonAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Border color animation
    Animated.timing(borderColorAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  React.useEffect(() => {
    // Clear button animation
    Animated.spring(clearButtonAnim, {
      toValue: value.length > 0 ? 1 : 0,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const getBorderColor = () => {
    return borderColorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.outline, colors.primary],
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: getBorderColor(),
          transform: [{ scale: scaleAnim }],
          shadowColor: colors.primary,
          shadowOpacity: isFocused ? 0.1 : 0,
        },
        style,
      ]}
    >
      <View style={styles.searchIconContainer}>
        <Search 
          size={20} 
          color={isFocused ? colors.primary : colors.onSurfaceVariant} 
        />
      </View>
      
      <TextInput
        style={[
          styles.input, 
          { 
            color: colors.onSurface,
            textAlignVertical: Platform.OS !== 'web' ? 'center' : 'auto',
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        clearButtonMode="never" // We handle this manually
      />
      
      <Animated.View
        style={[
          styles.clearButtonContainer,
          {
            opacity: clearButtonAnim,
            transform: [
              {
                scale: clearButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={handleClear}
          style={[styles.clearButton, { backgroundColor: colors.onSurfaceVariant + '20' }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={colors.onSurfaceVariant} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    minHeight: 20,
  },
  clearButtonContainer: {
    marginLeft: 8,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
