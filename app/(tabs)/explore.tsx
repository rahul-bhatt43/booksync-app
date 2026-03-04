import apiClient from '@/api/client';
import AudiobookCard from '@/components/AudiobookCard';
import SectionHeader from '@/components/SectionHeader';
import Skeleton from '@/components/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

                {/* Search Bar */}
                <View
                    className={`flex-row items-center rounded-2xl px-4 py-3.5 border ${searchFocused
                        ? 'bg-zinc-900 border-amber-500'
                        : 'bg-zinc-900/40 border-zinc-800/80'
                        }`}
                >
                    <SearchIcon size={19} color={searchFocused ? '#f59e0b' : '#52525b'} style={{ marginRight: 10 }} />
                    <TextInput
                        className="flex-1 text-white font-inter text-base"
                        placeholder="Search audiobooks..."
                        placeholderTextColor="#52525b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} className="bg-zinc-800 rounded-full p-1 ml-2">
                            <X size={14} color="#a1a1aa" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />
                }
            >
                {/* Featured Section */}
                {!searchQuery && !selectedGenre && audiobooks.length > 0 && (
                    <View className="mb-8">
                        <View className="px-6 mb-4">
                            <SectionHeader title="Featured" showSeeAll={false} />
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                        >
                            {audiobooks.slice(0, 3).map((book) => (
                                <TouchableOpacity
                                    key={`featured-${book._id}`}
                                    onPress={() => handleBookPress(book)}
                                    activeOpacity={0.9}
                                    style={{
                                        width: 280,
                                        height: 160,
                                        marginRight: 16,
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        backgroundColor: '#18181b',
                                    }}
                                >
                                    <Image
                                        source={{ uri: book.coverImageUrl }}
                                        style={{ width: '100%', height: '100%', position: 'absolute' }}
                                        resizeMode="cover"
                                    />
                                    <LinearGradient
                                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
                                        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, zIndex: 1 }}
                                    />
                                    <View style={{ zIndex: 2, position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                                        <Text className="text-white font-inter-bold text-lg mb-1" numberOfLines={1}>{book.title}</Text>
                                        <Text className="text-zinc-300 font-inter-medium text-xs" numberOfLines={1}>
                                            {typeof book.authorId === 'object' ? book.authorId.name : 'Unknown Author'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Categories */}
                <View className="mb-8 mt-1">
                    <View className="px-6 mb-3">
                        <Text className="text-zinc-400 font-inter-semibold text-xs uppercase tracking-widest">Categories</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                    >
                        {categories.map((category) => {
                            const isSelected = selectedGenre === category._id;
                            return (
                                <TouchableOpacity
                                    key={category._id}
                                    activeOpacity={0.7}
                                    onPress={() => handleGenreSelect(category._id)}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 12,
                                        borderRadius: 20,
                                        marginRight: 12,
                                        backgroundColor: isSelected ? '#f59e0b' : '#18181b',
                                        borderWidth: 1,
                                        borderColor: isSelected ? '#f59e0b' : '#27272a',
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: isSelected ? 'Inter-Bold' : 'Inter-SemiBold',
                                        color: isSelected ? '#0c0a09' : '#a1a1aa',
                                        fontSize: 14,
                                    }}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Discover Grid */}
                <View className="px-6 mb-16">
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
                        <View className="flex-row flex-wrap mt-2" style={{ gap: 15 }}>
                            {audiobooks.map((book) => (
                                <View
                                    key={book._id}
                                    style={{ width: '47.5%' }}
                                >
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
                        <View className="mt-24 items-center justify-center px-12">
                            <View className="w-20 h-20 bg-zinc-900 rounded-full items-center justify-center mb-6 border border-zinc-800/50">
                                <SearchIcon size={32} color="#52525b" />
                            </View>
                            <Text className="text-white font-inter-bold text-xl mb-2 text-center">No results found</Text>
                            <Text className="text-zinc-500 font-inter text-sm text-center leading-5">
                                We couldn't find any books matching your search. Try checking the spelling or using different keywords.
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setSearchQuery('');
                                    setSelectedGenre(null);
                                }}
                                className="mt-8 bg-zinc-800 px-6 py-3 rounded-xl border border-zinc-700/50"
                            >
                                <Text className="text-zinc-300 font-inter-semibold text-sm">Clear Search</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
