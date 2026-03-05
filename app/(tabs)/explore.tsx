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
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-6 pt-4 pb-3">
                <Text className="text-foreground font-inter-bold text-3xl tracking-tight mb-5">Explore</Text>

                {/* Search Bar */}
                <View
                    className={`flex-row items-center rounded-2xl px-4 py-3.5 border ${searchFocused
                        ? 'bg-secondary border-primary'
                        : 'bg-secondary/40 border-border/80'
                        }`}
                >
                    <SearchIcon size={19} color={searchFocused ? 'hsl(20.5 90.2% 48.2%)' : 'hsl(24 5.4% 63.9%)'} style={{ marginRight: 10 }} />
                    <TextInput
                        className="flex-1 text-foreground font-inter text-base"
                        placeholder="Search audiobooks..."
                        placeholderTextColor="hsl(24 5.4% 63.9%)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} className="bg-background rounded-full p-1 ml-2">
                            <X size={14} color="hsl(24 5.4% 63.9%)" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="hsl(20.5 90.2% 48.2%)" colors={['hsl(20.5 90.2% 48.2%)']} />
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
                                        backgroundColor: 'hsl(12 6.5% 15.1%)',
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
                                        <Text className="text-foreground font-inter-bold text-lg mb-1" numberOfLines={1}>{book.title}</Text>
                                        <Text className="text-muted-foreground font-inter-medium text-xs" numberOfLines={1}>
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
                        <Text className="text-muted-foreground/60 font-inter-semibold text-xs uppercase tracking-widest">Categories</Text>
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
                                        backgroundColor: isSelected ? 'hsl(20.5 90.2% 48.2%)' : 'hsl(12 6.5% 15.1%)',
                                        borderWidth: 1,
                                        borderColor: isSelected ? 'hsl(20.5 90.2% 48.2%)' : 'hsl(12 6.5% 15.1%)',
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: isSelected ? 'Inter-Bold' : 'Inter-SemiBold',
                                        color: isSelected ? 'hsl(20 14.3% 4.1%)' : 'hsl(24 5.4% 63.9%)',
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
                            <View className="w-20 h-20 bg-secondary rounded-full items-center justify-center mb-6 border border-border/50">
                                <SearchIcon size={32} color="hsl(24 5.4% 63.9%)" />
                            </View>
                            <Text className="text-foreground font-inter-bold text-xl mb-2 text-center">No results found</Text>
                            <Text className="text-muted-foreground font-inter text-sm text-center leading-5">
                                We couldn't find any books matching your search. Try checking the spelling or using different keywords.
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setSearchQuery('');
                                    setSelectedGenre(null);
                                }}
                                className="mt-8 bg-secondary px-6 py-3 rounded-xl border border-border"
                            >
                                <Text className="text-foreground font-inter-semibold text-sm">Clear Search</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
