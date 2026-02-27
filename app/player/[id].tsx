import apiClient from '@/api/client';
import Skeleton from '@/components/Skeleton';
import { useAudio } from '@/contexts/AudioContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, Clock, Heart, ListMusic, MessageCircle, Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Dummy data map removed as we use API data now

const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} `;
};

export default function PlayerScreen() {
    const { id, position: initialPositionParam } = useLocalSearchParams();
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

    const bookId = typeof id === 'string' ? id : '';

    const [bookData, setBookData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const initialPositionSec = Number(initialPositionParam) || 0;

    const fetchAudiobook = async () => {
        if (!bookId) return;
        try {
            const response = await apiClient.get(`/audiobooks/${bookId}`);
            const data = response.data.data;
            setBookData(data);
            setIsLiked(!!data.isLikedByUser);

            // Prefer API-returned progress over params, default to 0
            const resumePositionMillis = (data.progressInSeconds ?? initialPositionSec) * 1000;

            // Also load and play if not currently playing this track
            if (!currentTrack || currentTrack.id !== bookId) {
                loadAndPlayTrack({
                    id: data._id,
                    title: data.title,
                    author: data.author,
                    coverUrl: data.coverImageUrl,
                    audioUrl: data.audioUrl
                }, resumePositionMillis);
            }
        } catch (error) {
            console.error('Error fetching audiobook', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudiobook();
    }, [bookId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAudiobook();
        setRefreshing(false);
    }, [bookId]);

    const handleToggleLike = async () => {
        try {
            await apiClient.post(`/ interactions / audiobooks / ${bookId}/like`);
            setIsLiked(!isLiked);
            setBookData((prev: any) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    likesCount: isLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1
                };
            });
        } catch (error) {
            console.error('Error toggling like', error);
        }
    };

    const handleOpenComments = () => {
        // Open comments modal, we can route to a new modal screen
        router.push({ pathname: '/modal', params: { bookId } });
    };

    // The book displaying on screen
    const displayBook = currentTrack?.id === bookId ? currentTrack : (bookData ? {
        id: bookData._id,
        title: bookData.title,
        author: bookData.author,
        coverUrl: bookData.coverImageUrl,
        audioUrl: bookData.audioUrl
    } : null);

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
            if (!currentTrack || currentTrack.id !== bookId) {
                if (displayBook) {
                    const resumePositionMillis = ((bookData?.progressInSeconds) ?? initialPositionSec) * 1000;
                    loadAndPlayTrack(displayBook as any, resumePositionMillis);
                }
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
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />}
            >
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
                            <View className="flex-row">
                                <TouchableOpacity className="p-3 flex-row items-center" activeOpacity={0.7} onPress={handleToggleLike}>
                                    <Heart size={24} color={isLiked ? "#ef4444" : "#f4f4f5"} fill={isLiked ? "#ef4444" : "transparent"} />
                                    <Text className="text-zinc-400 font-inter-medium text-xs ml-1.5">{bookData?.likesCount || 0}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="p-3 -mr-3 flex-row items-center" activeOpacity={0.7} onPress={handleOpenComments}>
                                    <MessageCircle size={24} color="#f4f4f5" />
                                    <Text className="text-zinc-400 font-inter-medium text-xs ml-1.5">{bookData?.commentsCount || 0}</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {loading || !displayBook ? (
                            <View className="flex-1 px-10 pt-4">
                                {/* Cover Art Skeleton */}
                                <View className="items-center mt-2 mb-10">
                                    <Skeleton width={width * 0.75} height={width * 0.75} borderRadius={24} />
                                </View>
                                {/* Info Skeleton */}
                                <View className="items-center mb-8 px-4">
                                    <Skeleton width="80%" height={36} className="mb-3" />
                                    <Skeleton width="50%" height={24} />
                                </View>
                                {/* Scrubber Skeleton */}
                                <View className="mb-10 w-full">
                                    <Skeleton width="100%" height={8} borderRadius={4} className="mb-2" />
                                    <View className="flex-row justify-between">
                                        <Skeleton width={32} height={12} />
                                        <Skeleton width={32} height={12} />
                                    </View>
                                </View>
                                {/* Controls Skeleton */}
                                <View className="flex-row justify-between items-center mb-12">
                                    <Skeleton width={64} height={64} borderRadius={32} />
                                    <Skeleton width={96} height={96} borderRadius={48} />
                                    <Skeleton width={64} height={64} borderRadius={32} />
                                </View>
                            </View>
                        ) : (
                            <>
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
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
