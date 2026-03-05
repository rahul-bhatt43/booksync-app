import apiClient from '@/api/client';
import PlaylistService from '@/api/playlist';
import AudiobookCard, { Audiobook } from '@/components/AudiobookCard';
import PlaylistCard from '@/components/PlaylistCard';
import PlaylistModal from '@/components/PlaylistModal';
import Skeleton from '@/components/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import DownloadService, { DownloadedBook } from '@/services/DownloadService';
import { Playlist } from '@/types/playlist';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['Listening', 'Finished', 'Downloads', 'Playlists'] as const;
type Tab = typeof TABS[number];

export default function LibraryScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { tab } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<Tab>((tab as Tab) || 'Listening');
    const [history, setHistory] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [downloadedBooks, setDownloadedBooks] = useState<DownloadedBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const playlistModalRef = useRef<BottomSheetModal>(null);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            if (activeTab === 'Playlists') {
                const data = await PlaylistService.getUserPlaylists();
                setPlaylists(data);
            } else if (activeTab === 'Downloads') {
                const data = await DownloadService.getDownloadedBooks();
                setDownloadedBooks(data);
            } else {
                const response = await apiClient.get('/history');
                setHistory(response.data.data);
            }
        } catch (error) {
            console.error(`Error fetching ${activeTab.toLowerCase()}`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab && TABS.includes(tab as Tab)) {
            setActiveTab(tab as Tab);
        }
    }, [tab]);

    useEffect(() => {
        fetchData();
    }, [user, activeTab]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [user, activeTab]);

    const handleBookPress = (book: Audiobook) => {
        // @ts-ignore
        router.push({ pathname: `/player/${book.id}`, params: { position: book.position || 0 } });
    };

    const handlePlaylistPress = (playlist: Playlist) => {
        // @ts-ignore
        router.push(`/playlist/${playlist._id}`);
    };

    const handleCreatePlaylist = () => {
        playlistModalRef.current?.present();
    };

    const handlePlaylistCreated = (newPlaylist: Playlist) => {
        setPlaylists(prev => [newPlaylist, ...prev]);
    };

    const getTabContent = () => {
        if (loading) return [];
        if (activeTab === 'Playlists') return playlists;
        if (activeTab === 'Listening') return history.filter(h => !h.isCompleted);
        if (activeTab === 'Finished') return history.filter(h => h.isCompleted);
        if (activeTab === 'Downloads') return downloadedBooks;
        return [];
    };

    const displayItems = getTabContent();

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-6 pt-4 pb-2">
                <View className="flex-row items-center justify-between mb-5">
                    <Text className="text-foreground font-inter-bold text-3xl tracking-tight">Library</Text>
                    {activeTab === 'Playlists' && (
                        <TouchableOpacity
                            onPress={handleCreatePlaylist}
                            className="bg-secondary w-10 h-10 rounded-full items-center justify-center border border-border"
                        >
                            <Plus color="hsl(20.5 90.2% 48.2%)" size={24} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Pill Tab Selector */}
                <View className="flex-row bg-secondary/70 border border-border rounded-full p-1">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                activeOpacity={0.75}
                                style={{ flex: 1 }}
                            >
                                <View
                                    style={{
                                        paddingVertical: 8,
                                        paddingHorizontal: 4,
                                        alignItems: 'center',
                                        borderRadius: 25,
                                        backgroundColor: isActive ? 'hsla(20.5, 90.2%, 48.2%, 0.1)' : 'transparent',
                                        borderWidth: 1,
                                        borderColor: isActive ? 'hsl(20.5 90.2% 48.2%)' : 'transparent',
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: isActive ? 'Inter-Bold' : 'Inter-Medium',
                                        color: isActive ? 'hsl(20.5 90.2% 48.2%)' : 'hsl(24 5.4% 63.9%)',
                                        fontSize: 13,
                                    }}>
                                        {tab}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="hsl(20.5 90.2% 48.2%)" colors={['hsl(20.5 90.2% 48.2%)']} />
                }
            >
                {loading ? (
                    <View className="mt-2">
                        {[...Array(4)].map((_, i) => (
                            <View key={i} className="flex-row items-center py-3 border-b border-border/60">
                                <Skeleton width={64} height={96} borderRadius={12} />
                                <View className="flex-1 ml-4 justify-center">
                                    <Skeleton width="70%" height={18} className="mb-2" />
                                    <Skeleton width="40%" height={14} className="mb-4" />
                                    <View className="flex-row items-center">
                                        <Skeleton width="80%" height={5} borderRadius={3} style={{ flex: 1, marginRight: 12 }} />
                                        <Skeleton width={30} height={12} />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Animated.View entering={FadeInDown.duration(600).springify()}>
                        {displayItems.length > 0 ? (
                            activeTab === 'Playlists' ? (
                                (displayItems as Playlist[]).map((playlist) => (
                                    <PlaylistCard
                                        key={playlist._id}
                                        playlist={playlist}
                                        onPress={handlePlaylistPress}
                                    />
                                ))
                            ) : activeTab === 'Downloads' ? (
                                (displayItems as DownloadedBook[]).map((book) => (
                                    <AudiobookCard
                                        key={book.id}
                                        book={{
                                            id: book.id,
                                            title: book.title,
                                            author: book.author as any,
                                            coverUrl: book.localCoverUri,
                                            progress: 0,
                                            position: 0
                                        }}
                                        variant="list"
                                        onPress={handleBookPress}
                                    />
                                ))
                            ) : (
                                (displayItems as any[]).map((item) => (
                                    <AudiobookCard
                                        key={item._id}
                                        book={{
                                            id: item.audiobook?._id || '',
                                            title: item.audiobook?.title || '',
                                            author: item.audiobook?.authorId || { name: 'Unknown', _id: '' },
                                            coverUrl: item.audiobook?.coverImageUrl || '',
                                            progress: item.progressInSeconds && item.audiobook?.durationInSeconds
                                                ? Math.floor((item.progressInSeconds / item.audiobook.durationInSeconds) * 100)
                                                : 0,
                                            position: item.progressInSeconds || 0
                                        }}
                                        variant="list"
                                        onPress={handleBookPress}
                                    />
                                ))
                            )
                        ) : (
                            <View className="mt-20 items-center justify-center">
                                <Text style={{ fontSize: 44, marginBottom: 14 }}>
                                    {activeTab === 'Downloads' ? '📥' : activeTab === 'Finished' ? '✅' : activeTab === 'Playlists' ? '🎼' : '🎧'}
                                </Text>
                                <Text className="text-muted-foreground font-inter-semibold text-lg mb-1">
                                    {activeTab === 'Downloads'
                                        ? 'No downloads yet'
                                        : activeTab === 'Playlists'
                                            ? 'No playlists yet'
                                            : `No ${activeTab.toLowerCase()} books`}
                                </Text>
                                <Text className="text-muted-foreground/60 font-inter text-sm text-center px-8">
                                    {activeTab === 'Downloads'
                                        ? 'Download books to listen offline'
                                        : activeTab === 'Finished'
                                            ? 'Books you finish will appear here'
                                            : activeTab === 'Playlists'
                                                ? 'Create your first playlist to organize your books'
                                                : 'Start listening to a book to track your progress'}
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                )}
            </ScrollView>
            <PlaylistModal
                ref={playlistModalRef}
                onSuccess={handlePlaylistCreated}
            />
        </SafeAreaView>
    );
}
