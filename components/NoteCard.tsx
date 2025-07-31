import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MoveVertical as MoreVertical, Edit, Trash2 } from 'lucide-react-native';
import { Note } from '@/types/Note';
import { useTheme } from '@/contexts/ThemeContext';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onPress, onEdit, onDelete }: NoteCardProps) {
  const { colors } = useTheme();
  const [showActions, setShowActions] = React.useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      onLongPress={() => setShowActions(!showActions)}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
          {note.title || 'Untitled'}
        </Text>
        <TouchableOpacity
          onPress={() => setShowActions(!showActions)}
          style={styles.menuButton}
        >
          <MoreVertical size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.content, { color: colors.onSurfaceVariant }]} numberOfLines={3}>
        {note.content}
      </Text>
      
      <Text style={[styles.timestamp, { color: colors.onSurfaceVariant }]}>
        {formatDate(note.timestamp)}
      </Text>

      {showActions && (
        <View style={[styles.actionsContainer, { backgroundColor: colors.surfaceVariant }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setShowActions(false);
              onEdit();
            }}
          >
            <Edit size={16} color={colors.onSurfaceVariant} />
            <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setShowActions(false);
              onDelete();
            }}
          >
            <Trash2 size={16} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});