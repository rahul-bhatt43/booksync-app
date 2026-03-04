import PlaylistService from '@/api/playlist';
import { CreatePlaylistDTO, Playlist, UpdatePlaylistDTO } from '@/types/playlist';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PlaylistModalProps {
    playlist?: Playlist | null;
    onSuccess?: (playlist: Playlist) => void;
}

const PlaylistModal = forwardRef<BottomSheetModal, PlaylistModalProps>(({ playlist, onSuccess }, ref) => {
    const snapPoints = useMemo(() => ['60%', '85%'], []);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (playlist) {
            setName(playlist.name);
            setDescription(playlist.description || '');
            setIsPublic(playlist.isPublic);
        } else {
            setName('');
            setDescription('');
            setIsPublic(false);
        }
    }, [playlist]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name for the playlist');
            return;
        }

        setLoading(true);
        try {
            let result: Playlist;
            if (playlist) {
                const data: UpdatePlaylistDTO = { name, description, isPublic };
                result = await PlaylistService.updatePlaylist(playlist._id, data);
                Alert.alert('Success', 'Playlist updated');
            } else {
                const data: CreatePlaylistDTO = { name, description, isPublic };
                result = await PlaylistService.createPlaylist(data);
                Alert.alert('Success', 'Playlist created');
            }
            onSuccess?.(result);
            (ref as any).current?.dismiss();
        } catch (error: any) {
            console.error('Error saving playlist', error);
            const message = error.response?.data?.message || 'Failed to save playlist';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
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
        >
            <BottomSheetView style={styles.header}>
                <Text style={styles.title}>{playlist ? 'Edit Playlist' : 'New Playlist'}</Text>
            </BottomSheetView>

            <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="My Awesome Playlist"
                        placeholderTextColor="#71717a"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Best books for developer productivity..."
                        placeholderTextColor="#71717a"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.switchGroup}>
                    <View>
                        <Text style={styles.label}>Public Playlist</Text>
                        <Text style={styles.hint}>Others can see this playlist if enabled</Text>
                    </View>
                    <Switch
                        value={isPublic}
                        onValueChange={setIsPublic}
                        trackColor={{ false: '#27272a', true: '#f59e0b33' }}
                        thumbColor={isPublic ? '#f59e0b' : '#52525b'}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#0c0a09" />
                    ) : (
                        <Text style={styles.saveButtonText}>{playlist ? 'Update Playlist' : 'Create Playlist'}</Text>
                    )}
                </TouchableOpacity>
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
    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#e4e4e7',
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#27272a',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: 'white',
        fontFamily: 'Inter-Regular',
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
        paddingTop: 12,
    },
    switchGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
        backgroundColor: '#27272a',
        padding: 16,
        borderRadius: 16,
    },
    hint: {
        color: '#71717a',
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        marginTop: 2,
    },
    saveButton: {
        backgroundColor: '#f59e0b',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#0c0a09',
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    }
});

export default PlaylistModal;
