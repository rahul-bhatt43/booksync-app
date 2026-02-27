import apiClient from '@/api/client';
import AudiobookCard from '@/components/AudiobookCard';
import SectionHeader from '@/components/SectionHeader';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);
    const [audiobooks, setAudiobooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories');
                setCategories(response.data.data);
            } catch (error) {
                console.error('Error fetching categories', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch audiobooks when search query or selected genre changes
    useEffect(() => {
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
                // Search API returns { audiobooks: [...] } inside data, list API returns direct array inside data
                const data = response.data.data;
                setAudiobooks(Array.isArray(data) ? data : data.audiobooks || []);
            } catch (error) {
                console.error('Error fetching audiobooks', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchAudiobooks();
        }, 500); // debounce search

        return () => clearTimeout(timer);
    }, [searchQuery, selectedGenre]);

    const handleBookPress = (book: any) => {
        // @ts-ignore
        router.push(`/player/${book._id}`);
    };

    const handleGenreSelect = (genreId: string) => {
        setSelectedGenre(prev => prev === genreId ? null : genreId);
        setSearchQuery(''); // clear search when exploring categories
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
            <View className="px-6 pt-4 pb-4">
                <Text className="text-white font-inter-bold text-3xl tracking-tight mb-6">Explore</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-zinc-900/80 rounded-2xl px-4 py-3 border border-zinc-800 focus:border-amber-500 transition-colors">
                    <SearchIcon size={20} color="#a1a1aa" className="mr-3" />
                    <TextInput
                        className="flex-1 text-white font-inter text-base"
                        placeholder="Titles, authors, or genres"
                        placeholderTextColor="#71717a"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1 ml-2">
                            <X size={20} color="#a1a1aa" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Categories / Genres */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mb-8 mt-2">
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
                                    activeOpacity={0.7}
                                    onPress={() => handleGenreSelect(category._id)}
                                    className={`px-5 py-2.5 rounded-full mr-3 shadow-sm border ${isSelected
                                        ? 'bg-amber-500 border-amber-500'
                                        : 'bg-zinc-900 border-zinc-800'
                                        }`}
                                >
                                    <Text className={`font-inter-medium ${isSelected ? 'text-zinc-950 font-inter-bold' : 'text-zinc-300'}`}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {/* Discover Grid */}
                <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="px-6 mb-16">
                    <SectionHeader title={selectedGenre ? `${categories.find(c => c._id === selectedGenre)?.name || 'Category'} Audiobooks` : searchQuery ? 'Search Results' : "Discover New Audiobooks"} showSeeAll={false} />

                    {loading ? (
                        <View className="mt-10 items-center justify-center">
                            <ActivityIndicator size="large" color="#f59e0b" />
                        </View>
                    ) : audiobooks.length > 0 ? (
                        <View className="flex-row flex-wrap justify-between mt-2">
                            {audiobooks.map((book) => (
                                <View key={book._id} className="w-[48%] mb-6">
                                    <AudiobookCard book={{
                                        id: book._id,
                                        title: book.title,
                                        author: book.author,
                                        coverUrl: book.coverImageUrl,
                                        progress: 0
                                    }} variant="grid" onPress={() => handleBookPress(book)} />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="mt-10 items-center justify-center">
                            <Text className="text-zinc-500 font-inter-medium text-lg">No audiobooks found.</Text>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
