import { useAudio } from '@/contexts/AudioContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, Clock, ListMusic, MoreVertical, Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Dummy data map based on IDs for testing
const dummyBooks: Record<string, any> = {
    '1': {
        id: '1',
        title: 'The Martian',
        author: 'Andy Weir',
        coverUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3'
    },
    'default:': {
        id: 'default:',
        title: 'Unknown Book',
        author: 'Unknown Author',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
        audioUrl: 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3'
    }
};

const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function PlayerScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const {
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        loadAndPlayTrack,
        position,
        duration,
        seekTrack
    } = useAudio();

    const bookId = typeof id === 'string' ? id : 'default:';
    const bookToPlay = dummyBooks[bookId] || dummyBooks['default:'];

    // The book displaying on screen
    const displayBook = currentTrack?.id === bookToPlay.id ? currentTrack : bookToPlay;

    useEffect(() => {
        // If we open the player and it's a new book, load it
        if (!currentTrack || currentTrack.id !== bookToPlay.id) {
            loadAndPlayTrack(bookToPlay);
        }
    }, [bookToPlay.id]);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for the exit animations (300ms) to finish before the router actually unmounts the screen
        setTimeout(() => {
            router.back();
        }, 300);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            if (!currentTrack || currentTrack.id !== bookToPlay.id) {
                loadAndPlayTrack(bookToPlay);
            } else {
                playTrack();
            }
        }
    };

    const handleSeekBack = () => {
        seekTrack(Math.max(0, position - 15000));
    };

    const handleSeekForward = () => {
        seekTrack(Math.min(duration, position + 15000));
    };

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            {isVisible && (
                <>
                    {/* Dynamic Ambient Background Blur */}
                    <Animated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)} className="absolute top-0 left-0 right-0 h-96 bg-amber-900/20" />

                    {/* Darker overlay to ensure text contrast */}
                    <Animated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)} className="absolute top-0 left-0 right-0 bottom-0 bg-zinc-950/60" pointerEvents="none" />

                    {/* Header */}
                    <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutDown.duration(300)} className="px-6 pt-2 pb-6 flex-row justify-between items-center z-10">
                        <TouchableOpacity onPress={handleClose} className="p-3 -ml-3" activeOpacity={0.7}>
                            <ChevronDown size={32} color="#f4f4f5" />
                        </TouchableOpacity>
                        <Text className="text-zinc-400 font-inter-semibold text-xs tracking-widest uppercase">Now Playing</Text>
                        <TouchableOpacity className="p-3 -mr-3" activeOpacity={0.7}>
                            <MoreVertical size={24} color="#f4f4f5" />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Cover Art */}
                    <Animated.View entering={SlideInDown.duration(600).springify()} exiting={SlideOutDown.duration(300)} className="items-center px-10 mt-2 mb-10 shadow-[0_30px_60px_rgba(245,158,11,0.2)]">
                        <Image
                            source={{ uri: displayBook.coverUrl }}
                            className="w-full aspect-square max-w-[340px] rounded-3xl bg-zinc-800 border border-zinc-800/50"
                            resizeMode="cover"
                        />
                    </Animated.View>

                    {/* Book Info */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600)} exiting={FadeOutDown.duration(300)} className="px-8 items-center mb-8">
                        <Text className="text-white font-inter-bold text-3xl mb-2 text-center" numberOfLines={2}>
                            {displayBook.title}
                        </Text>
                        <Text className="text-amber-500 font-inter-medium text-lg">
                            {displayBook.author}
                        </Text>
                    </Animated.View>

                    {/* Progress Scrubber */}
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} exiting={FadeOutDown.duration(300)} className="px-8 mb-10 w-full">
                        {/* Scrubber Line container with larger touch area */}
                        <View className="py-2 justify-center mb-1">
                            <View className="h-2 bg-zinc-800 rounded-full w-full">
                                <View className="h-full bg-amber-500 rounded-full relative" style={{ width: `${progressPercent}%` }}>
                                    {/* Larger handle for better touch ergonomics */}
                                    <View className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full shadow-md items-center justify-center">
                                        <View className="w-2 h-2 rounded-full bg-amber-500" />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Timestamps */}
                        <View className="flex-row justify-between w-full mt-1">
                            <Text className="text-zinc-400 font-inter-medium text-xs">
                                {formatTime(position)}
                            </Text>
                            <Text className="text-zinc-400 font-inter-medium text-xs">
                                -{formatTime(Math.max(0, duration - position))}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Main Controls */}
                    <Animated.View entering={FadeInDown.delay(300).duration(600)} exiting={FadeOutDown.duration(300)} className="px-10 flex-row justify-between items-center mb-12">
                        <TouchableOpacity onPress={handleSeekBack} className="items-center justify-center relative w-16 h-16 rounded-full bg-zinc-800/40 active:bg-zinc-800/80 transition-colors">
                            <RotateCcw size={32} color="#e4e4e7" strokeWidth={1.5} />
                            <Text className="absolute text-zinc-300 font-inter-bold text-[10px] mt-1">15</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-24 h-24 rounded-full bg-amber-500 items-center justify-center shadow-[0_10px_40px_rgba(245,158,11,0.4)]"
                            activeOpacity={0.8}
                            onPress={handlePlayPause}
                        >
                            {isPlaying ? (
                                <Pause size={40} color="#18181b" fill="#18181b" />
                            ) : (
                                <Play size={40} color="#18181b" fill="#18181b" className="ml-1.5" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSeekForward} className="items-center justify-center relative w-16 h-16 rounded-full bg-zinc-800/40 active:bg-zinc-800/80 transition-colors">
                            <RotateCw size={32} color="#e4e4e7" strokeWidth={1.5} />
                            <Text className="absolute text-zinc-300 font-inter-bold text-[10px] mt-1">15</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Secondary Controls - Bottom Navigation Style */}
                    <Animated.View entering={FadeInDown.delay(400).duration(800)} exiting={FadeOutDown.duration(300)} className="flex-row items-center border-t border-zinc-800/80 bg-zinc-900/50 absolute bottom-0 left-0 right-0 h-24 px-8 pb-6 justify-between rounded-t-3xl">
                        <TouchableOpacity className="flex-1 items-center justify-center p-2 opacity-80 active:opacity-100">
                            <Text className="text-white font-inter-bold text-lg mb-1">1.0x</Text>
                            <Text className="text-zinc-500 font-inter-medium text-[10px] uppercase tracking-wider">Speed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-1 items-center justify-center p-2 opacity-80 active:opacity-100 border-x border-zinc-800/50">
                            <ListMusic size={26} color="#f4f4f5" className="mb-1.5" />
                            <Text className="text-zinc-500 font-inter-medium text-[10px] uppercase tracking-wider">Chapters</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-1 items-center justify-center p-2 opacity-80 active:opacity-100">
                            <Clock size={26} color="#f4f4f5" className="mb-1.5" />
                            <Text className="text-zinc-500 font-inter-medium text-[10px] uppercase tracking-wider">Sleep</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </>
            )}
        </SafeAreaView>
    );
}
