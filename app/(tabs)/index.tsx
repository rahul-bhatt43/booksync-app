import apiClient from '@/api/client';
import AudiobookCard, { Audiobook } from '@/components/AudiobookCard';
import SectionHeader from '@/components/SectionHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const firstName = user?.name?.split(' ')[0] || 'Listener';

  const [feedData, setFeedData] = useState<{
    continueListening: any[];
    latest: any[];
    popular: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async () => {
    try {
      const response = await apiClient.get('/feed/home');
      setFeedData(response.data.data);
    } catch (error) {
      console.error('Error fetching home feed', error);
    }
  };

  useEffect(() => {
    const initLoad = async () => {
      await fetchFeed();
      setLoading(false);
    };
    initLoad();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  }, []);

  const handleBookPress = (book: any) => {
    // @ts-ignore
    router.push(`/player/${book.id || book._id}`);
  };

  const mapToAudiobook = (item: any): Audiobook => ({
    id: item._id,
    title: item.title,
    author: item.author,
    coverUrl: item.coverImageUrl,
    progress: item.progressInSeconds ? Math.floor((item.progressInSeconds / item.durationInSeconds) * 100) : 0,
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 justify-center items-center" edges={['top']}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </SafeAreaView>
    );
  }

  const continueBook = feedData?.continueListening?.[0]
    ? {
      ...mapToAudiobook(feedData.continueListening[0].audiobook),
      progress: feedData.continueListening[0].progressInSeconds && feedData.continueListening[0].audiobook?.durationInSeconds
        ? Math.floor((feedData.continueListening[0].progressInSeconds / feedData.continueListening[0].audiobook.durationInSeconds) * 100)
        : 0
    }
    : feedData?.popular?.[0] ? mapToAudiobook(feedData.popular[0]) : null;
  const recommendedBooks = feedData?.latest?.map(mapToAudiobook) || [];
  const trendingBooks = feedData?.popular?.map(mapToAudiobook) || [];

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} className="px-6 pt-6 pb-8 flex-row justify-between items-start">
          <View>
            <Text className="text-zinc-400 font-inter-medium text-xs tracking-widest mb-1 uppercase">Good morning,</Text>
            <Text className="text-white font-inter-bold text-3xl tracking-tight">{firstName}</Text>
          </View>
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity className="relative w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center shadow-sm">
              <Bell size={20} color="#a1a1aa" />
              <View className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full border border-zinc-900" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-zinc-800 border-[1.5px] border-amber-500/50 items-center justify-center shadow-sm ml-2"
              onPress={() => router.push('/profile')}
            >
              <Text className="text-amber-500 font-inter-bold text-base leading-none">{firstName.charAt(0)}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Featured / Continue Listening */}
        {continueBook && (
          <Animated.View entering={FadeInDown.delay(100).duration(800).springify()} className="px-6 mb-8">
            <AudiobookCard book={continueBook} variant="featured" onPress={handleBookPress} />
          </Animated.View>
        )}

        {/* Recommended Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="mb-8">
          <View className="px-6">
            <SectionHeader title="Recommended for You" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {recommendedBooks.map((book) => (
              <AudiobookCard key={book.id} book={book} variant="grid" onPress={handleBookPress} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Trending Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(800).springify()} className="mb-16">
          <View className="px-6">
            <SectionHeader title="Trending Now" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {trendingBooks.map((book) => (
              <AudiobookCard key={`trend-${book.id}`} book={book} variant="grid" onPress={handleBookPress} />
            ))}
          </ScrollView>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
