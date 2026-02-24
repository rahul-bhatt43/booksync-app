import AudiobookCard, { Audiobook } from '@/components/AudiobookCard';
import SectionHeader from '@/components/SectionHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data
const continueBook: Audiobook = {
  id: '1',
  title: 'The Martian',
  author: 'Andy Weir',
  coverUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop',
  progress: 68
};

const recommendedBooks: Audiobook[] = [
  { id: '2', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400&auto=format&fit=crop' },
  { id: '3', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop' },
  { id: '4', title: 'Foundation', author: 'Isaac Asimov', coverUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=400&auto=format&fit=crop' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const firstName = user?.name?.split(' ')[0] || 'Listener';

  const handleBookPress = (book: Audiobook) => {
    // @ts-ignore - Ignore the explicit absolute path requirements of Expo Router
    router.push(`/player/${book.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
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
        <Animated.View entering={FadeInDown.delay(100).duration(800).springify()} className="px-6 mb-8">
          <AudiobookCard book={continueBook} variant="featured" onPress={handleBookPress} />
        </Animated.View>

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
            {[...recommendedBooks].reverse().map((book) => (
              <AudiobookCard key={`trend-${book.id}`} book={book} variant="grid" />
            ))}
          </ScrollView>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
