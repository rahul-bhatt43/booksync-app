import { useAudio } from '@/contexts/AudioContext';
import { useRouter } from 'expo-router';
import { Pause, Play, X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    FadeInUp,
    SlideOutDown,
    cancelAnimation,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming
} from 'react-native-reanimated';

export default function MiniPlayer() {
    const { currentTrack, isPlaying, playTrack, pauseTrack, position, duration, clearAudio } = useAudio();
    const router = useRouter();

    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isPlaying) {
            rotation.value = withRepeat(
                withTiming(360, { duration: 12000, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            cancelAnimation(rotation);
        }
    }, [isPlaying]);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onChange((event) => {
            translateX.value += event.changeX;
            if (translateY.value + event.changeY > -20) {
                translateY.value += event.changeY;
            }
        })
        .onEnd(() => {
            const SWIPE_THRESHOLD_X = 120;
            const SWIPE_THRESHOLD_Y = 60;

            if (Math.abs(translateX.value) > SWIPE_THRESHOLD_X || translateY.value > SWIPE_THRESHOLD_Y) {
                const directionalTargetX = translateX.value > 0 ? 500 : (translateX.value < 0 ? -500 : 0);
                const directionalTargetY = translateY.value > SWIPE_THRESHOLD_Y ? 500 : 0;

                translateX.value = withTiming(directionalTargetX, { duration: 250 });
                translateY.value = withTiming(directionalTargetY, { duration: 250 }, (finished) => {
                    if (finished) {
                        runOnJS(clearAudio)();
                    }
                });
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const panStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value }
        ],
        opacity: withTiming(1 - (Math.abs(translateX.value) / 200) - (translateY.value / 150))
    }));

    if (!currentTrack) return null;

    const progress = duration > 0 ? (position / duration) * 100 : 0;

    const handlePress = () => {
        // @ts-ignore
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
        <GestureDetector gesture={panGesture}>
            <Animated.View
                entering={FadeInUp.duration(400).springify()}
                exiting={SlideOutDown.duration(300)}
                style={[panStyle]}
                className="absolute bottom-[88px] left-3 right-3 bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
                {/* Amber left accent bar */}
                <View className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-2xl" />

                <View className="flex-row items-center px-3 py-2.5">
                    {/* Play/Pause Button */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={togglePlayPause}
                        className="w-11 h-11 bg-amber-500 rounded-full items-center justify-center mr-3 shadow-[0_4px_14px_rgba(245,158,11,0.4)]"
                    >
                        {isPlaying ? (
                            <Pause size={18} color="#18181b" fill="#18181b" />
                        ) : (
                            <Play size={18} color="#18181b" fill="#18181b" style={{ marginLeft: 2 }} />
                        )}
                    </TouchableOpacity>

                    {/* Tappable info area → navigate to player */}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handlePress}
                        className="flex-1 flex-row items-center"
                    >
                        <Image
                            source={{ uri: currentTrack.coverUrl }}
                            className="w-11 h-11 rounded-xl mr-3 bg-zinc-800"
                            resizeMode="cover"
                        />
                        <View className="flex-1 justify-center">
                            <Text className="text-white font-inter-bold text-[14px] leading-tight mb-0.5" numberOfLines={1}>
                                {currentTrack.title}
                            </Text>
                            <Text className="text-zinc-400 font-inter-medium text-xs" numberOfLines={1}>
                                {currentTrack.author.name}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Dismiss X button */}
                    <TouchableOpacity
                        onPress={clearAudio}
                        className="ml-2 w-8 h-8 rounded-full bg-zinc-800/80 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <X size={14} color="#71717a" />
                    </TouchableOpacity>
                </View>

                {/* Progress bar */}
                <View className="h-[3px] bg-zinc-800 mx-0">
                    <View
                        className="h-full bg-amber-500"
                        style={{ width: `${progress}%` }}
                    />
                </View>
            </Animated.View>
        </GestureDetector>
    );
}
