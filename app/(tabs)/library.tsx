import apiClient from '@/api/client';
import AudiobookCard, { Audiobook } from '@/components/AudiobookCard';
import Skeleton from '@/components/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TABS = ['Listening', 'Finished', 'Downloaded'] as const;
type Tab = typeof TABS[number];

export default function LibraryScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('Listening');
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const response = await apiClient.get('/history');
            setHistory(response.data.data);
        } catch (error) {
            console.error('Error fetching history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user, activeTab]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchHistory();
        setRefreshing(false);
    }, [user, activeTab]);

    const handleBookPress = (book: Audiobook) => {
        // @ts-ignore
        router.push({ pathname: `/player/${book.id}`, params: { position: book.position || 0 } });
    };

    const getTabContent = () => {
        if (loading) return [];
        if (activeTab === 'Listening') return history.filter(h => !h.isCompleted);
        if (activeTab === 'Finished') return history.filter(h => h.isCompleted);
        return [];
    };

    const displayItems = getTabContent();

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
            <View className="px-6 pt-4 pb-2">
                <Text className="text-white font-inter-bold text-3xl tracking-tight mb-5">Library</Text>

                {/* Pill Tab Selector */}
                <View className="flex-row bg-zinc-900/70 border border-zinc-800 rounded-2xl p-1">
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
                                        paddingVertical: 9,
                                        alignItems: 'center',
                                        borderRadius: 12,
                                        backgroundColor: isActive ? '#f59e0b' : 'transparent',
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: isActive ? 'Inter-Bold' : 'Inter-Medium',
                                        color: isActive ? '#0c0a09' : '#71717a',
                                        fontSize: 13,
                                        letterSpacing: 0.1,
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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />
                }
            >
                {loading ? (
                    <View className="mt-2">
                        {[...Array(4)].map((_, i) => (
                            <View key={i} className="flex-row items-center py-3 border-b border-zinc-800/60">
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
                        {displayItems.length > 0 ? displayItems.map((item) => (
                            <AudiobookCard
                                key={item._id}
                                book={{
                                    id: item.audiobook._id,
                                    title: item.audiobook.title,
                                    author: item.audiobook.authorId,
                                    coverUrl: item.audiobook.coverImageUrl,
                                    progress: item.progressInSeconds
                                        ? Math.floor((item.progressInSeconds / item.audiobook.durationInSeconds) * 100)
                                        : 0,
                                    position: item.progressInSeconds || 0
                                }}
                                variant="list"
                                onPress={handleBookPress}
                            />
                        )) : (
                            <View className="mt-20 items-center justify-center">
                                <Text style={{ fontSize: 44, marginBottom: 14 }}>
                                    {activeTab === 'Downloaded' ? '📥' : activeTab === 'Finished' ? '✅' : '🎧'}
                                </Text>
                                <Text className="text-zinc-400 font-inter-semibold text-lg mb-1">
                                    {activeTab === 'Downloaded'
                                        ? 'No downloads yet'
                                        : `No ${activeTab.toLowerCase()} books`}
                                </Text>
                                <Text className="text-zinc-600 font-inter text-sm text-center px-8">
                                    {activeTab === 'Downloaded'
                                        ? 'Download books to listen offline'
                                        : activeTab === 'Finished'
                                            ? 'Books you finish will appear here'
                                            : 'Start listening to a book to track your progress'}
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
