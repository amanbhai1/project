import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  RefreshControl,
  Animated,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Search as SearchIcon, Filter, Grid, List } from 'lucide-react-native';
import { NoteCard } from '@/components/NoteCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { Snackbar } from '@/components/ui/Snackbar';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Note } from '@/types/Note';

export default function NotesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'info' | 'success' | 'error'>('info');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showSearch, setShowSearch] = useState(false);
  
  const { notes, loading, deleteNote } = useNotes();
  const { user } = useAuth();
  const { colors } = useTheme();

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  React.useEffect(() => {
    // Search bar animation
    Animated.timing(searchAnim, {
      toValue: showSearch ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showSearch]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  const showMessage = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      showMessage('Note deleted successfully', 'success');
    } catch (error) {
      showMessage('Failed to delete note', 'error');
    }
  };

  const handleCreateNote = () => {
    router.push('/(tabs)/add-note');
  };

  const renderNote = ({ item, index }: { item: Note; index: number }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <NoteCard
          note={item}
          onPress={() => router.push(`/note/${item.id}`)}
          onEdit={() => router.push(`/(tabs)/add-note?id=${item.id}`)}
          onDelete={() => handleDeleteNote(item.id)}
          viewMode={viewMode}
        />
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Text style={styles.emptyIcon}>📝</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
        {searchQuery ? 'No notes found' : 'Start Your Note Journey'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
        {searchQuery
          ? 'Try searching for something else'
          : 'Create your first note and begin organizing your thoughts'}
      </Text>
      {!searchQuery && (
        <Pressable
          onPress={handleCreateNote}
          style={[styles.createFirstButton, { backgroundColor: colors.primary }]}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createFirstText}>Create Your First Note</Text>
        </Pressable>
      )}
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={[colors.primary + '15', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>
                Hello {user?.email?.split('@')[0] || 'there'}! 👋
              </Text>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                My Notes
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setShowSearch(!showSearch)}
                style={[styles.actionButton, { backgroundColor: colors.surface }]}
              >
                <SearchIcon size={20} color={colors.onSurface} />
              </Pressable>
              
              <Pressable
                onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                style={[styles.actionButton, { backgroundColor: colors.surface }]}
              >
                {viewMode === 'list' ? 
                  <Grid size={20} color={colors.onSurface} /> :
                  <List size={20} color={colors.onSurface} />
                }
              </Pressable>
            </View>
          </View>

          <Animated.View
            style={[
              styles.searchContainer,
              {
                height: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 60],
                }),
                opacity: searchAnim,
              },
            ]}
          >
            {showSearch && (
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search your notes..."
                style={styles.searchBar}
              />
            )}
          </Animated.View>

          {notes.length > 0 && (
            <View style={styles.stats}>
              <Text style={[styles.statsText, { color: colors.onSurfaceVariant }]}>
                {filteredNotes.length} of {notes.length} notes
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authPrompt}>
          <Text style={[styles.authTitle, { color: colors.onSurface }]}>Welcome to Notes</Text>
          <Text style={[styles.authSubtitle, { color: colors.onSurfaceVariant }]}>
            Please sign in to view your notes
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          filteredNotes.length === 0 ? styles.emptyContainer : styles.listContainer,
          { paddingBottom: 100 }
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {}}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
      />

      {/* Floating Action Button */}
      {notes.length > 0 && (
        <Animated.View
          style={[
            styles.fabContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            onPress={handleCreateNote}
            style={[styles.fab, { backgroundColor: colors.primary }]}
          >
            <Plus size={24} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      )}

      <Snackbar
        message={snackbarMessage}
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        type={snackbarType}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    overflow: 'hidden',
  },
  searchBar: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  stats: {
    marginTop: 8,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  createFirstText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6750A4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
