import apiClient from '@/api/client';
import AudiobookCard, { Audiobook } from '@/components/AudiobookCard';
import SectionHeader from '@/components/SectionHeader';
import Skeleton from '@/components/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const firstName = user?.name?.split(' ')[0] || 'Listener';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

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
    router.push({ pathname: `/player/${book.id || book._id}`, params: { position: book.position || 0 } });
  };

  const mapToAudiobook = (item: any): Audiobook => ({
    id: item._id,
    title: item.title,
    author: item.authorId,
    coverUrl: item.coverImageUrl,
    progress: item.progressInSeconds ? Math.floor((item.progressInSeconds / item.durationInSeconds) * 100) : 0,
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-6 pt-6 pb-8 flex-row justify-between items-start">
          <View>
            <Skeleton width={100} height={12} className="mb-2" />
            <Skeleton width={160} height={32} />
          </View>
          <View className="flex-row items-center">
            <Skeleton width={40} height={40} borderRadius={20} />
            <Skeleton width={40} height={40} borderRadius={20} className="ml-2" />
          </View>
        </View>
        <View className="px-6 mb-8">
          <View className="flex-row p-4 rounded-3xl bg-secondary border border-border">
            <Skeleton width={96} height={144} borderRadius={12} />
            <View className="flex-1 ml-4 justify-center">
              <Skeleton width={120} height={14} className="mb-2" />
              <Skeleton width="100%" height={24} className="mb-2" />
              <Skeleton width="80%" height={24} className="mb-4" />
              <Skeleton width={100} height={16} className="mb-6" />
              <View className="flex-row items-center mt-auto">
                <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />
                <View className="flex-1">
                  <Skeleton width="100%" height={6} className="mb-2" />
                  <Skeleton width={80} height={14} />
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="mb-8">
          <View className="px-6 mb-4 flex-row justify-between items-center">
            <Skeleton width={150} height={20} />
          </View>
          <View className="flex-row px-6">
            {[1, 2, 3].map(i => (
              <View key={i} className="w-[140px] mr-4">
                <Skeleton width={140} height={210} borderRadius={16} className="mb-3" />
                <Skeleton width="80%" height={16} className="mb-2" />
                <Skeleton width="50%" height={14} />
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const continueBook = feedData?.continueListening?.[0]
    ? {
      ...mapToAudiobook(feedData.continueListening[0].audiobook),
      progress: feedData.continueListening[0].progressInSeconds && feedData.continueListening[0].audiobook?.durationInSeconds
        ? Math.floor((feedData.continueListening[0].progressInSeconds / feedData.continueListening[0].audiobook.durationInSeconds) * 100)
        : 0,
      position: feedData.continueListening[0].progressInSeconds || 0
    }
    : feedData?.popular?.[0] ? mapToAudiobook(feedData.popular[0]) : null;
  const recommendedBooks = feedData?.latest?.map(mapToAudiobook) || [];
  const trendingBooks = feedData?.popular?.map(mapToAudiobook) || [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Subtle ambient top gradient */}
      {/* <View className="absolute top-0 left-0 right-0 h-40 bg-primary/10" pointerEvents="none" /> */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="hsl(20.5 90.2% 48.2%)" colors={['hsl(20.5 90.2% 48.2%)']} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(600)} className="px-6 pt-6 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-muted-foreground font-inter-medium text-xs tracking-widest mb-1.5 uppercase">{greeting} 👋</Text>
            <Text className="text-foreground font-inter-bold text-3xl tracking-tight">{firstName}</Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <TouchableOpacity className="relative w-11 h-11 rounded-full bg-secondary border border-border items-center justify-center">
              <Bell size={19} color="hsl(60 9.1% 97.8%)" opacity={0.6} />
              <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-secondary border-2 border-primary/40 items-center justify-center"
              onPress={() => router.push('/profile')}
            >
              <Text className="text-primary font-inter-bold text-base leading-none">{firstName.charAt(0)}</Text>
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
            <SectionHeader title="Recommended for You" onPressSeeAll={() => router.push('/explore')} />
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
            <SectionHeader title="Trending Now" onPressSeeAll={() => router.push('/explore')} />
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
