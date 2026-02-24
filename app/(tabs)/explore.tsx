import AudiobookCard, { Audiobook } from '@/components/AudiobookCard';
import SectionHeader from '@/components/SectionHeader';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const genres = ['Sci-Fi', 'Fantasy', 'Business', 'Self Help', 'Mystery', 'Biography', 'History', 'Romance'];

// Extend Audiobook with a genre for testing filtering
type DiscoverBook = Audiobook & { genre: string };

const discoverBooks: DiscoverBook[] = [
    { id: '10', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop', genre: 'Self Help' },
    { id: '11', title: 'Deep Work', author: 'Cal Newport', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop', genre: 'Business' },
    { id: '12', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://images.unsplash.com/photo-1606744888044-6a9dd7a6f2c0?q=80&w=400&auto=format&fit=crop', genre: 'Fantasy' },
    { id: '13', title: '1984', author: 'George Orwell', coverUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=400&auto=format&fit=crop', genre: 'Sci-Fi' },
    { id: '14', title: 'Sapiens', author: 'Yuval Noah Harari', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop', genre: 'History' },
];

export default function ExploreScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

    const handleBookPress = (book: Audiobook) => {
        // @ts-ignore - dynamic route string casting
        router.push(`/player/${book.id}`);
    };

    const handleGenreSelect = (genre: string) => {
        setSelectedGenre(prev => prev === genre ? null : genre);
    };

    const filteredBooks = useMemo(() => {
        return discoverBooks.filter((book) => {
            const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGenre = selectedGenre ? book.genre === selectedGenre : true;
            return matchesSearch && matchesGenre;
        });
    }, [searchQuery, selectedGenre]);

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
                        {genres.map((genre, index) => {
                            const isSelected = selectedGenre === genre;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    onPress={() => handleGenreSelect(genre)}
                                    className={`px-5 py-2.5 rounded-full mr-3 shadow-sm border ${isSelected
                                            ? 'bg-amber-500 border-amber-500'
                                            : 'bg-zinc-900 border-zinc-800'
                                        }`}
                                >
                                    <Text className={`font-inter-medium ${isSelected ? 'text-zinc-950 font-inter-bold' : 'text-zinc-300'}`}>
                                        {genre}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {/* Discover Grid */}
                <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="px-6 mb-16">
                    <SectionHeader title={selectedGenre ? `${selectedGenre} Audiobooks` : "Discover New Audiobooks"} showSeeAll={false} />

                    {filteredBooks.length > 0 ? (
                        <View className="flex-row flex-wrap justify-between mt-2">
                            {filteredBooks.map((book) => (
                                <View key={book.id} className="w-[48%] mb-6">
                                    <AudiobookCard book={book} variant="grid" onPress={() => handleBookPress(book)} />
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
