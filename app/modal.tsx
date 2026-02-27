import apiClient from '@/api/client';
import Skeleton from '@/components/Skeleton';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Send, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function ModalScreen() {
  const { bookId } = useLocalSearchParams();
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    fetchComments();
  }, [bookId]);

  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/interactions/audiobooks/${bookId}/comments`);
      const data = response.data.data;
      // Handle both cases: if API returns a direct array, or an object with a comments property
      setComments(Array.isArray(data) ? data : (data.comments || []));
    } catch (error) {
      console.error('Error fetching comments', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchComments();
    setRefreshing(false);
  }, [bookId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await apiClient.post(`/interactions/audiobooks/${bookId}/comments`, { text: newComment });
      const addedComment = response.data.data;
      // Optimistically update list or refetch
      setComments(prev => [addedComment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await apiClient.delete(`/interactions/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment', error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments</Text>
      </View>

      {loading ? (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />}
        >
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.commentCard} className="bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800">
              <View style={styles.commentHeader}>
                <Skeleton width={28} height={28} borderRadius={14} className="mr-2" />
                <Skeleton width={100} height={14} />
              </View>
              <Skeleton width="100%" height={14} className="mb-2" />
              <Skeleton width="80%" height={14} className="mb-2" />
              <Skeleton width="40%" height={14} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />}
        >
          {comments.length === 0 ? (
            <Text style={styles.emptyText}>No comments yet. Be the first to share your thoughts!</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment._id} style={styles.commentCard} lightColor="#f4f4f5" darkColor="#18181b">
                <View style={styles.commentHeader} lightColor="transparent" darkColor="transparent">
                  <View style={styles.avatar} lightColor="#e4e4e7" darkColor="#27272a">
                    <Text style={styles.avatarText}>{comment.user?.name?.charAt(0) || 'U'}</Text>
                  </View>
                  <Text style={styles.authorName}>{comment.user?.name || 'User'}</Text>
                  {comment.user?._id === user?.id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment._id)} style={styles.deleteBtn}>
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.inputContainer} lightColor="#ffffff" darkColor="#09090b">
        <TextInput
          style={styles.input}
          placeholder="Write a comment..."
          placeholderTextColor="#71717a"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          onPress={handleAddComment}
          disabled={submitting || !newComment.trim()}
          style={[styles.sendBtn, (!newComment.trim() || submitting) && { opacity: 0.5 }]}
        >
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
        </TouchableOpacity>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#a1a1aa',
    fontFamily: 'Inter-Medium',
  },
  commentCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
    color: '#d4d4d8',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    minHeight: 44,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  sendBtn: {
    backgroundColor: '#f59e0b',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  }
});
