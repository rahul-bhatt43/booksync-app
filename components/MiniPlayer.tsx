import { useAudio } from '@/contexts/AudioContext';
import { useRouter } from 'expo-router';
import { Pause, Play } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeInUp,
    SlideOutDown,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

export default function MiniPlayer() {
    const { currentTrack, isPlaying, playTrack, pauseTrack, position, duration } = useAudio();
    const router = useRouter();

    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isPlaying) {
            rotation.value = withRepeat(
                withTiming(360, { duration: 12000, easing: Easing.linear }),
                -1, // infinite
                false // no reverse
            );
        } else {
            cancelAnimation(rotation);
        }
    }, [isPlaying]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${rotation.value}deg` }],
        };
    });

    if (!currentTrack) return null;

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    const handlePress = () => {
        // Navigate to the full player modal
        // @ts-ignore - dynamic route string casting
        router.push(`/player/${currentTrack.id}`);
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    };

    return (
        <Animated.View
            entering={FadeInUp.duration(400).springify()}
            exiting={SlideOutDown.duration(300)}
            className="absolute bottom-[85px] left-4 right-4 bg-zinc-900 border border-zinc-700/50 rounded-full shadow-lg overflow-hidden flex-row items-center p-2 z-50"
        >
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={togglePlayPause}
                className="relative w-14 h-14 items-center justify-center mr-3"
            >
                {/* The rotating disc */}
                <Animated.Image
                    source={{ uri: currentTrack.coverUrl }}
                    className="w-12 h-12 rounded-full absolute"
                    resizeMode="cover"
                    style={animatedStyle}
                />
                {/* The vinyl hole in the center and overlay play/pause */}
                <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-full border border-zinc-800">
                    <View className="absolute w-3 h-3 bg-zinc-900 rounded-full" />
                    {isPlaying ? (
                        <Pause size={18} color="#f59e0b" fill="#f59e0b" />
                    ) : (
                        <Play size={18} color="#f59e0b" fill="#f59e0b" className="ml-0.5" />
                    )}
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                className="flex-1 justify-center py-2 h-full"
            >
                <Text className="text-white font-inter-semibold text-sm mb-0.5" numberOfLines={1}>
                    {currentTrack.title}
                </Text>
                <Text className="text-zinc-400 font-inter text-xs" numberOfLines={1}>
                    {currentTrack.author}
                </Text>
            </TouchableOpacity>

            {/* Mini Progress Bar tucked inside the pill visually */}
            <View className="absolute bottom-0 left-8 right-8 h-0.5 bg-zinc-800/50 rounded-full overflow-hidden">
                <View
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </View>
        </Animated.View>
    );
}
