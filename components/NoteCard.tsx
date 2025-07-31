import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Animated,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MoreVertical, Edit, Trash2, Calendar, Hash } from 'lucide-react-native';
import { Note } from '@/types/Note';
import { useTheme } from '@/contexts/ThemeContext';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  viewMode?: 'list' | 'grid';
}

export function NoteCard({ note, onPress, onEdit, onDelete, viewMode = 'list' }: NoteCardProps) {
  const { colors } = useTheme();
  const [showActions, setShowActions] = React.useState(false);
  
  // Animation references
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(actionsAnim, {
      toValue: showActions ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showActions]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
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

  const handleDeleteConfirm = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const cardStyle = viewMode === 'grid' ? styles.gridCard : styles.listCard;

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={() => setShowActions(!showActions)}
        style={[cardStyle, { backgroundColor: colors.surface }]}
      >
        <LinearGradient
          colors={[colors.primary + '05', 'transparent']}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text 
                  style={[styles.title, { color: colors.onSurface }]} 
                  numberOfLines={viewMode === 'grid' ? 2 : 1}
                >
                  {note.title || 'Untitled'}
                </Text>
                
                <View style={styles.metaInfo}>
                  <View style={styles.metaItem}>
                    <Calendar size={12} color={colors.onSurfaceVariant} />
                    <Text style={[styles.timestamp, { color: colors.onSurfaceVariant }]}>
                      {formatDate(note.timestamp)}
                    </Text>
                  </View>
                  
                  <View style={styles.metaItem}>
                    <Hash size={12} color={colors.onSurfaceVariant} />
                    <Text style={[styles.wordCount, { color: colors.onSurfaceVariant }]}>
                      {getWordCount(note.content)} words
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => setShowActions(!showActions)}
                style={styles.menuButton}
              >
                <MoreVertical size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
            
            <Text 
              style={[styles.content, { color: colors.onSurfaceVariant }]} 
              numberOfLines={viewMode === 'grid' ? 4 : 3}
            >
              {note.content}
            </Text>

            {/* Content Preview with Gradient Fade */}
            {note.content.length > 100 && (
              <LinearGradient
                colors={['transparent', colors.surface]}
                style={styles.contentFade}
                pointerEvents="none"
              />
            )}
          </View>
        </LinearGradient>

        {/* Actions Overlay */}
        {showActions && (
          <Animated.View
            style={[
              styles.actionsOverlay,
              {
                opacity: actionsAnim,
                transform: [
                  {
                    scale: actionsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.surface + 'F0', colors.surface]}
              style={styles.actionsContainer}
            >
              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  setShowActions(false);
                  onEdit();
                }}
              >
                <Edit size={18} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
              </Pressable>
              
              <View style={[styles.actionDivider, { backgroundColor: colors.outline }]} />
              
              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  setShowActions(false);
                  handleDeleteConfirm();
                }}
              >
                <Trash2 size={18} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  listCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  gridCard: {
    margin: 8,
    flex: 1,
    minHeight: 180,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  wordCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuButton: {
    padding: 4,
    borderRadius: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  contentFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionDivider: {
    width: 1,
    marginVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
