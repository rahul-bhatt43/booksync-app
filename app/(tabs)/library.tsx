import apiClient from '@/api/client';
import AudiobookCard, { Audiobook } from '@/components/AudiobookCard';
import Skeleton from '@/components/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LibraryScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'Listening' | 'Finished' | 'Downloaded'>('Listening');
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const tabs = ['Listening', 'Finished', 'Downloaded'] as const;

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
        return []; // Downloaded is not supported yet
    };

    const displayItems = getTabContent();

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
            <View className="px-6 pt-4 pb-4">
                <Text className="text-white font-inter-bold text-3xl tracking-tight mb-6">Library</Text>

                {/* Internal Tabs */}
                <View className="flex-row border-b border-zinc-800">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`mr-6 pb-3 ${activeTab === tab ? 'border-b-2 border-amber-500' : ''}`}
                        >
                            <Text className={`font-inter-semibold ${activeTab === tab ? 'text-amber-500' : 'text-zinc-500'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4 mb-16 "
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />
                }
            >
                {loading ? (
                    <View className="mt-4">
                        {[...Array(4)].map((_, i) => (
                            <View key={i} className="flex-row items-center mb-6">
                                <Skeleton width={64} height={96} borderRadius={8} />
                                <View className="flex-1 ml-4 justify-center">
                                    <Skeleton width="70%" height={18} className="mb-2" />
                                    <Skeleton width="40%" height={14} className="mb-4" />
                                    <View className="flex-row items-center">
                                        <Skeleton width="80%" height={4} borderRadius={2} className="flex-1 mr-3" />
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
                                    author: item.audiobook.author,
                                    coverUrl: item.audiobook.coverImageUrl,
                                    progress: item.progressInSeconds ? Math.floor((item.progressInSeconds / item.audiobook.durationInSeconds) * 100) : 0,
                                    position: item.progressInSeconds || 0
                                }}
                                variant="list"
                                onPress={handleBookPress}
                            />
                        )) : (
                            <View className="mt-10 items-center justify-center">
                                <Text className="text-zinc-500 font-inter-medium text-lg">
                                    No {activeTab.toLowerCase()} audiobooks found.
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
