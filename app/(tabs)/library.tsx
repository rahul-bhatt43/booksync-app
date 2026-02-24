import AudiobookCard, { Audiobook } from '@/components/AudiobookCard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const myBooks: Audiobook[] = [
    { id: '20', title: 'The Martian', author: 'Andy Weir', coverUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop', progress: 68 },
    { id: '21', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400&auto=format&fit=crop', progress: 12 },
    { id: '22', title: 'Sapiens', author: 'Yuval Noah Harari', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop', progress: 100 },
];

export default function LibraryScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Listening' | 'Finished' | 'Downloaded'>('Listening');

    const tabs = ['Listening', 'Finished', 'Downloaded'] as const;

    const handleBookPress = (book: Audiobook) => {
        // @ts-ignore - dynamic route string casting
        router.push(`/player/${book.id}`);
    };

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
            >
                <Animated.View entering={FadeInDown.duration(600).springify()}>
                    {myBooks.map((book) => (
                        <AudiobookCard key={book.id} book={book} variant="list" onPress={handleBookPress} />
                    ))}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}
