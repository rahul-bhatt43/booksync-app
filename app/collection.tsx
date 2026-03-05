import apiClient from '@/api/client';
import AudiobookCard from '@/components/AudiobookCard';
import Skeleton from '@/components/Skeleton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollectionScreen() {
    const { type, id, name } = useLocalSearchParams<{ type: string, id: string, name: string }>();
    const router = useRouter();

    const [audiobooks, setAudiobooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAudiobooks = async () => {
        setLoading(true);
        try {
            let url = '/audiobooks';
            if (type === 'author') {
                url = `/audiobooks?authorId=${id}`;
            } else if (type === 'narrator') {
                url = `/audiobooks?narratorId=${id}`;
            } else if (type === 'category') {
                url = `/audiobooks?categoryId=${id}`;
            }

            const response = await apiClient.get(url);
            const data = response.data.data;
            setAudiobooks(Array.isArray(data) ? data : data.audiobooks || []);
        } catch (error) {
            console.error('Error fetching audiobooks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAudiobooks();
        }
    }, [id, type]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAudiobooks();
        setRefreshing(false);
    }, [id, type]);

    const handleBookPress = (book: any) => {
        // use replace if we're coming from another player or just push
        router.push(`/player/${book._id}`);
    };

    const getTitlePrefix = () => {
        if (type === 'author') return 'Books by';
        if (type === 'narrator') return 'Narrated by';
        if (type === 'category') return 'Category:';
        return 'Collection';
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-4 pb-2 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 -ml-2 mr-3 bg-secondary rounded-full border border-border"
                    activeOpacity={0.7}
                >
                    <ChevronLeft size={24} color="hsl(60 9.1% 97.8%)" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-muted-foreground font-inter-medium text-xs uppercase tracking-wider mb-0.5">
                        {getTitlePrefix()}
                    </Text>
                    <Text className="text-foreground font-inter-bold text-2xl tracking-tight" numberOfLines={1}>
                        {name || 'Unknown'}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="hsl(20.5 90.2% 48.2%)" colors={['hsl(20.5 90.2% 48.2%)']} />
                }
            >
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="px-6">
                    {loading ? (
                        <View className="flex-row flex-wrap justify-between mt-2">
                            {[...Array(6)].map((_, i) => (
                                <View key={i} className="w-[48%] mb-6">
                                    <Skeleton width="100%" height={210} borderRadius={16} className="mb-3" />
                                    <Skeleton width="80%" height={16} className="mb-2" />
                                    <Skeleton width="50%" height={14} />
                                </View>
                            ))}
                        </View>
                    ) : audiobooks.length > 0 ? (
                        <View className="flex-row flex-wrap justify-between mt-2">
                            {audiobooks.map((book) => (
                                <View key={book._id} className="w-[48%] mb-6">
                                    <AudiobookCard book={{
                                        id: book._id,
                                        title: book.title,
                                        author: book.authorId,
                                        coverUrl: book.coverImageUrl,
                                        progress: 0
                                    }} variant="grid" onPress={() => handleBookPress(book)} />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="mt-20 items-center justify-center">
                            <Text className="text-muted-foreground font-inter-medium text-lg">No audiobooks found.</Text>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
