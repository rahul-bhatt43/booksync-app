import PlaylistService from '@/api/playlist';
import { Playlist } from '@/types/playlist';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { ListPlus, Plus } from 'lucide-react-native';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddToPlaylistModalProps {
    bookId: string;
    onAdded?: () => void;
}

const AddToPlaylistModal = forwardRef<BottomSheetModal, AddToPlaylistModalProps>(({ bookId, onAdded }, ref) => {
    const snapPoints = useMemo(() => ['50%', '75%'], []);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const data = await PlaylistService.getUserPlaylists();
            setPlaylists(data);
        } catch (error) {
            console.error('Error fetching playlists', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        setAdding(playlistId);
        try {
            await PlaylistService.addAudiobookToPlaylist(playlistId, bookId);
            Alert.alert('Success', 'Added to playlist');
            onAdded?.();
            (ref as any).current?.dismiss();
        } catch (error: any) {
            console.error('Error adding to playlist', error);
            const message = error.response?.data?.message || 'Failed to add to playlist';
            Alert.alert('Error', message);
        } finally {
            setAdding(null);
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
            onAnimate={(from, to) => {
                if (to === 0) fetchPlaylists();
            }}
        >
            <BottomSheetView style={styles.header}>
                <Text style={styles.title}>Add to Playlist</Text>
            </BottomSheetView>

            <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                {loading ? (
                    <ActivityIndicator color="#f59e0b" style={{ marginTop: 20 }} />
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => Alert.alert('Create Playlist', 'This feature is coming soon!')}
                        >
                            <View style={styles.iconContainer}>
                                <Plus color="#f59e0b" size={20} />
                            </View>
                            <Text style={styles.createText}>Create New Playlist</Text>
                        </TouchableOpacity>

                        {playlists.map((playlist) => (
                            <TouchableOpacity
                                key={playlist._id}
                                style={styles.playlistItem}
                                onPress={() => handleAddToPlaylist(playlist._id)}
                                disabled={adding !== null}
                            >
                                <View style={styles.playlistIcon}>
                                    <ListPlus color="#a1a1aa" size={20} />
                                </View>
                                <View className="flex-1">
                                    <Text style={styles.playlistName}>{playlist.name}</Text>
                                    <Text style={styles.playlistMeta}>
                                        {playlist.audiobooks.length} {playlist.audiobooks.length === 1 ? 'book' : 'books'}
                                    </Text>
                                </View>
                                {adding === playlist._id && <ActivityIndicator size="small" color="#f59e0b" />}
                            </TouchableOpacity>
                        ))}

                        {playlists.length === 0 && !loading && (
                            <Text style={styles.emptyText}>You haven't created any playlists yet.</Text>
                        )}
                    </>
                )}
            </BottomSheetScrollView>
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
    contentContainer: {
        padding: 24,
        paddingTop: 80,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    createText: {
        color: '#f59e0b',
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
    },
    playlistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    playlistIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#27272a',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    playlistName: {
        color: 'white',
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        marginBottom: 2,
    },
    playlistMeta: {
        color: '#71717a',
        fontFamily: 'Inter-Regular',
        fontSize: 12,
    },
    emptyText: {
        color: '#71717a',
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginTop: 20,
    }
});

export default AddToPlaylistModal;
