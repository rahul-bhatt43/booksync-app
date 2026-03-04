import PlaylistService from '@/api/playlist';
import AudiobookCard from '@/components/AudiobookCard';
import PlaylistModal from '@/components/PlaylistModal';
import Skeleton from '@/components/Skeleton';
import { useAudio } from '@/contexts/AudioContext';
import { Audiobook, Playlist } from '@/types/playlist';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit3, ListPlus, Play, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Extrapolate, FadeInDown, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 380;

export default function PlaylistDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { loadAndPlayTrack } = useAudio();

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const playlistModalRef = useRef<BottomSheetModal>(null);

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const headerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT - 100],
            [0, 1],
            Extrapolate.CLAMP
        );
        return { opacity };
    });

    const imageStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollY.value,
            [-100, 0],
            [1.2, 1],
            Extrapolate.CLAMP
        );
        return { transform: [{ scale }] };
    });

    const fetchPlaylist = async () => {
        try {
            const data = await PlaylistService.getPlaylistById(id as string);
            setPlaylist(data);
        } catch (error) {
            console.error('Error fetching playlist', error);
            Alert.alert('Error', 'Failed to load playlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchPlaylist();
    }, [id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPlaylist();
        setRefreshing(false);
    }, [id]);

    const handleDelete = () => {
        Alert.alert(
            'Delete Playlist',
            'Are you sure you want to delete this playlist? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PlaylistService.deletePlaylist(id as string);
                            router.back();
                        } catch (error) {
                            console.error('Error deleting playlist', error);
                            Alert.alert('Error', 'Failed to delete playlist');
                        }
                    }
                }
            ]
        );
    };

    const handleRemoveBook = async (bookId: string) => {
        try {
            await PlaylistService.removeAudiobookFromPlaylist(id as string, bookId);
            setPlaylist(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    audiobooks: (prev.audiobooks as Audiobook[]).filter(b => b._id !== bookId)
                };
            });
        } catch (error) {
            console.error('Error removing book', error);
            Alert.alert('Error', 'Failed to remove book from playlist');
        }
    };

    const handlePlayAll = () => {
        if (playlist && playlist.audiobooks.length > 0) {
            const firstBook = playlist.audiobooks[0] as Audiobook;
            const author = typeof firstBook.authorId === 'object'
                ? firstBook.authorId
                : { name: 'Unknown Author', _id: firstBook.authorId as string };

            loadAndPlayTrack({
                id: firstBook._id,
                title: firstBook.title,
                author: author,
                coverUrl: firstBook.coverImageUrl,
                audioUrl: firstBook.audioUrl
            });
            router.push(`/player/${firstBook._id}`);
        }
    };

    const handleBookPress = (book: any) => {
        router.push(`/player/${book._id || book.id}`);
    };

    const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
        setPlaylist(updatedPlaylist);
    };

    const handleEditPress = () => {
        playlistModalRef.current?.present();
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-zinc-950">
                <View className="px-6 pt-4">
                    <Skeleton width={40} height={40} borderRadius={20} className="mb-6" />
                    <Skeleton width="60%" height={32} className="mb-2" />
                    <Skeleton width="40%" height={18} className="mb-8" />
                    {[...Array(3)].map((_, i) => (
                        <View key={i} className="flex-row items-center mb-6">
                            <Skeleton width={60} height={90} borderRadius={12} />
                            <View className="ml-4 flex-1">
                                <Skeleton width="80%" height={20} className="mb-2" />
                                <Skeleton width="50%" height={16} />
                            </View>
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    if (!playlist) {
        return (
            <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center">
                <Text className="text-zinc-500 font-inter mb-4">Playlist not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-amber-500 px-6 py-2 rounded-full">
                    <Text className="text-zinc-950 font-inter-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const firstBookCover = (playlist.audiobooks[0] as Audiobook)?.coverImageUrl;

    return (
        <BottomSheetModalProvider>
            <View className="flex-1 bg-zinc-950">
                {/* Custom Sticky Header */}
                <Animated.View
                    style={[headerStyle, { paddingTop: insets.top }]}
                    className="absolute top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 px-6 h-24 flex-row items-center"
                >
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>
                    <Text className="text-white font-inter-bold text-lg flex-1" numberOfLines={1}>
                        {playlist.name}
                    </Text>
                </Animated.View>

                {/* Back Button Fixed Overlay */}
                <View style={{ top: insets.top + 16 }} className="absolute left-6 z-40">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/10"
                    >
                        <ArrowLeft color="white" size={20} />
                    </TouchableOpacity>
                </View>

                <Animated.ScrollView
                    className="flex-1"
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
                    }
                >
                    {/* Header Section */}
                    <View style={{ height: HEADER_HEIGHT }} className="relative">
                        <Animated.View style={[imageStyle, { height: HEADER_HEIGHT + 100 }]} className="absolute top-0 left-0 right-0">
                            {firstBookCover ? (
                                <Image
                                    source={{ uri: firstBookCover }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                    blurRadius={20}
                                />
                            ) : (
                                <View className="w-full h-full bg-zinc-900" />
                            )}
                            <View className="absolute inset-0 bg-zinc-950/40" />
                        </Animated.View>

                        <View className="flex-1 justify-end px-6 pb-8">
                            <Animated.View entering={FadeInDown.duration(800).springify()}>
                                <View className="flex-row items-center mb-4">
                                    <View className="bg-amber-500 px-2 py-1 rounded-md mr-3">
                                        <Text className="text-zinc-950 font-inter-bold text-[10px] uppercase">Playlist</Text>
                                    </View>
                                    <Text className="text-zinc-400 font-inter-medium text-xs">
                                        {playlist.isPublic ? 'Public' : 'Private'}
                                    </Text>
                                </View>

                                <Text className="text-white font-inter-extra-bold text-4xl mb-3 tracking-tighter" style={{ lineHeight: 44 }}>
                                    {playlist.name}
                                </Text>

                                {playlist.description ? (
                                    <Text className="text-zinc-300 font-inter text-base mb-6" numberOfLines={2}>
                                        {playlist.description}
                                    </Text>
                                ) : null}

                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View className="bg-zinc-800/80 px-3 py-1.5 rounded-full border border-white/5 mr-3">
                                            <Text className="text-zinc-300 font-inter-semibold text-xs">
                                                {playlist.audiobooks.length} {playlist.audiobooks.length === 1 ? 'Book' : 'Books'}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={handleEditPress}
                                            className="w-9 h-9 items-center justify-center rounded-full bg-zinc-800/80 border border-white/5"
                                        >
                                            <Edit3 color="#d4d4d8" size={16} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleDelete}
                                            className="w-9 h-9 items-center justify-center rounded-full bg-zinc-800/80 border border-white/5 ml-3"
                                        >
                                            <Trash2 color="#ef4444" size={16} />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handlePlayAll}
                                        disabled={playlist.audiobooks.length === 0}
                                        className={`w-14 h-14 rounded-full bg-amber-500 items-center justify-center shadow-lg shadow-amber-500/30 ${playlist.audiobooks.length === 0 ? 'opacity-50' : ''}`}
                                    >
                                        <Play fill="#18181b" color="#18181b" size={28} style={{ marginLeft: 3 }} />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View className="bg-zinc-950 px-6 pt-4 pb-20">
                        {playlist.audiobooks.length > 0 ? (
                            (playlist.audiobooks as Audiobook[]).map((book, index) => (
                                <Animated.View
                                    key={book._id}
                                    entering={FadeInDown.delay(100 * index).duration(400)}
                                    className="mb-1"
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-zinc-600 font-inter-bold text-sm mr-4 w-4">
                                            {index + 1}
                                        </Text>
                                        <View className="flex-1">
                                            <AudiobookCard
                                                book={{
                                                    id: book._id,
                                                    title: book.title,
                                                    author: (typeof book.authorId === 'object' ? book.authorId : { name: 'Author', _id: book.authorId as string }),
                                                    coverUrl: book.coverImageUrl,
                                                }}
                                                variant="list"
                                                onPress={() => handleBookPress(book)}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveBook(book._id)}
                                            className="ml-2 p-2"
                                        >
                                            <Trash2 color="#52525b" size={16} />
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            ))
                        ) : (
                            <View className="mt-20 items-center justify-center h-40">
                                <View className="w-16 h-16 bg-zinc-900 rounded-full items-center justify-center mb-4 border border-zinc-800">
                                    <ListPlus color="#3f3f46" size={32} />
                                </View>
                                <Text className="text-zinc-400 font-inter-semibold text-lg mb-1">Your playlist is empty</Text>
                                <Text className="text-zinc-600 font-inter text-sm text-center">Add audiobooks to start listening</Text>
                            </View>
                        )}
                    </View>
                </Animated.ScrollView>

                <PlaylistModal
                    ref={playlistModalRef}
                    playlist={playlist}
                    onSuccess={handlePlaylistUpdated}
                />
            </View>
        </BottomSheetModalProvider>
    );
}
