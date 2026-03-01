import apiClient from '@/api/client';
import Skeleton from '@/components/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { Send, Trash2 } from 'lucide-react-native';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CommentsDrawerProps {
    bookId: string;
}

const CommentsDrawer = forwardRef<BottomSheetModal, CommentsDrawerProps>(({ bookId }, ref) => {
    const { user } = useAuth();
    const snapPoints = useMemo(() => ['50%', '90%'], []);

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

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: '#18181b' }}
            handleIndicatorStyle={{ backgroundColor: '#52525b' }}
            enablePanDownToClose={true}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1, paddingBottom: Platform.OS === 'ios' ? 24 : 0 }}
            >
                <BottomSheetView style={styles.header}>
                    <Text style={styles.title}>Comments</Text>
                </BottomSheetView>

                {loading ? (
                    <BottomSheetScrollView
                        contentContainerStyle={styles.listContainer}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" colors={['#06b6d4']} />}
                    >
                        {[...Array(5)].map((_, i) => (
                            <View key={i} style={styles.commentCard} className="bg-zinc-900 border border-zinc-800">
                                <View style={styles.commentHeader}>
                                    <Skeleton width={28} height={28} borderRadius={14} className="mr-2" />
                                    <Skeleton width={100} height={14} />
                                </View>
                                <Skeleton width="100%" height={14} className="mb-2" />
                                <Skeleton width="80%" height={14} className="mb-2" />
                                <Skeleton width="40%" height={14} />
                            </View>
                        ))}
                    </BottomSheetScrollView>
                ) : (
                    <BottomSheetScrollView
                        contentContainerStyle={styles.listContainer}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" colors={['#06b6d4']} />}
                        keyboardShouldPersistTaps="handled"
                    >
                        {comments.length === 0 ? (
                            <Text style={styles.emptyText}>No comments yet. Be the first to share your thoughts!</Text>
                        ) : (
                            comments.map((comment) => (
                                <View key={comment._id} style={styles.commentCard} className="bg-[#18181b] border border-zinc-800/50">
                                    <View style={styles.commentHeader}>
                                        <View style={styles.avatar}>
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
                    </BottomSheetScrollView>
                )}

                <View style={styles.inputContainer}>
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
            </KeyboardAvoidingView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        backgroundColor: '#18181b',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: 'white',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 40,
        paddingTop: 80,
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
        backgroundColor: '#27272a',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#06b6d4', // cyan-500
    },
    authorName: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        color: 'white',
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
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'flex-end',
        backgroundColor: '#09090b',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
        backgroundColor: '#06b6d4', // cyan-500
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    }
});

export default CommentsDrawer;
