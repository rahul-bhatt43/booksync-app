import apiClient from '@/api/client';
import AudiobookCard from '@/components/AudiobookCard';
import SectionHeader from '@/components/SectionHeader';
import Skeleton from '@/components/Skeleton';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);
    const [audiobooks, setAudiobooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/categories');
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchAudiobooks = async () => {
        setLoading(true);
        try {
            let url = '/audiobooks';
            if (searchQuery) {
                url = `/feed/search?q=${encodeURIComponent(searchQuery)}`;
            } else if (selectedGenre) {
                url = `/audiobooks?categoryId=${selectedGenre}`;
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
        const timer = setTimeout(() => {
            fetchAudiobooks();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedGenre]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchCategories(), fetchAudiobooks()]);
        setRefreshing(false);
    }, [searchQuery, selectedGenre]);

    const handleBookPress = (book: any) => {
        // @ts-ignore
        router.push(`/player/${book._id}`);
    };

    const handleGenreSelect = (genreId: string) => {
        setSelectedGenre(prev => prev === genreId ? null : genreId);
        setSearchQuery('');
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
            <View className="px-6 pt-4 pb-3">
                <Text className="text-white font-inter-bold text-3xl tracking-tight mb-5">Explore</Text>

                {/* Search Bar with focus glow */}
                <View
                    className={`flex-row items-center rounded-2xl px-4 py-3.5 border ${searchFocused
                        ? 'bg-zinc-900 border-amber-500/50'
                        : 'bg-zinc-900/70 border-zinc-800'
                        }`}
                >
                    <SearchIcon size={19} color={searchFocused ? '#f59e0b' : '#71717a'} style={{ marginRight: 10 }} />
                    <TextInput
                        className="flex-1 text-white font-inter text-base"
                        placeholder="Titles, authors, or genres..."
                        placeholderTextColor="#52525b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1 ml-2">
                            <X size={18} color="#71717a" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />
                }
            >
                {/* Categories / Genres */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mb-6 mt-1">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 4 }}
                    >
                        {categories.map((category) => {
                            const isSelected = selectedGenre === category._id;
                            return (
                                <TouchableOpacity
                                    key={category._id}
                                    activeOpacity={0.75}
                                    onPress={() => handleGenreSelect(category._id)}
                                    style={{
                                        paddingHorizontal: 18,
                                        paddingVertical: 10,
                                        borderRadius: 999,
                                        marginRight: 10,
                                        borderWidth: 1,
                                        backgroundColor: isSelected ? '#f59e0b' : '#18181b',
                                        borderColor: isSelected ? '#f59e0b' : '#3f3f46',
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: isSelected ? 'Inter-Bold' : 'Inter-Medium',
                                        color: isSelected ? '#0c0a09' : '#d4d4d8',
                                        fontSize: 13,
                                    }}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {/* Discover Grid */}
                <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="px-6 mb-16">
                    <SectionHeader
                        title={selectedGenre
                            ? `${categories.find(c => c._id === selectedGenre)?.name || 'Category'} Books`
                            : searchQuery
                                ? 'Search Results'
                                : 'Discover'}
                        showSeeAll={false}
                    />

                    {loading ? (
                        <View className="flex-row flex-wrap justify-between mt-4">
                            {[...Array(6)].map((_, i) => (
                                <View key={i} className="w-[48%] mb-6">
                                    <Skeleton width="100%" height={210} borderRadius={16} className="mb-3" />
                                    <Skeleton width="80%" height={16} className="mb-2" />
                                    <Skeleton width="50%" height={14} />
                                </View>
                            ))}
                        </View>
                    ) : audiobooks.length > 0 ? (
                        <View className="flex-row flex-wrap mt-2" style={{ gap: 12 }}>
                            {audiobooks.map((book) => (
                                <View key={book._id} style={{ width: '47.5%' }}>
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
                        <View className="mt-16 items-center justify-center">
                            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
                            <Text className="text-zinc-400 font-inter-semibold text-lg mb-1">No results found</Text>
                            <Text className="text-zinc-600 font-inter text-sm text-center px-8">Try a different search or browse categories above</Text>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
