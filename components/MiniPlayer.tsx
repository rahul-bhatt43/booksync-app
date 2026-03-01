import { useAudio } from '@/contexts/AudioContext';
import { useRouter } from 'expo-router';
import { Pause, Play } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onChange((event) => {
            translateX.value += event.changeX;
            // Only allow pulling down (positive Y) slightly or swiping down, don't let it go up much
            if (translateY.value + event.changeY > -20) {
                translateY.value += event.changeY;
            }
        })
        .onEnd((event) => {
            const SWIPE_THRESHOLD_X = 120;
            const SWIPE_THRESHOLD_Y = 60;

            if (Math.abs(translateX.value) > SWIPE_THRESHOLD_X || translateY.value > SWIPE_THRESHOLD_Y) {
                // Swipe out completely
                const directionalTargetX = translateX.value > 0 ? 500 : (translateX.value < 0 ? -500 : 0);
                const directionalTargetY = translateY.value > SWIPE_THRESHOLD_Y ? 500 : 0;

                translateX.value = withTiming(directionalTargetX, { duration: 250 });
                translateY.value = withTiming(directionalTargetY, { duration: 250 }, (finished) => {
                    if (finished) {
                        runOnJS(clearAudio)();
                    }
                });
            } else {
                // Spring back if not far enough
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const panStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value }
            ],
            opacity: withTiming(1 - (Math.abs(translateX.value) / 200) - (translateY.value / 150))
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
        <GestureDetector gesture={panGesture}>
            <Animated.View
                entering={FadeInUp.duration(400).springify()}
                exiting={SlideOutDown.duration(300)}
                style={[panStyle]}
                className="absolute bottom-[85px] left-3 right-3 bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-2xl overflow-hidden flex-row items-center p-3 z-50"
            >
                {/* Play/Pause Button - Separated from the cover art for clarity */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={togglePlayPause}
                    className="relative w-14 h-14 bg-zinc-800 rounded-full items-center justify-center mr-3 border border-zinc-700/50"
                >
                    {isPlaying ? (
                        <Pause size={22} color="#f59e0b" fill="#f59e0b" />
                    ) : (
                        <Play size={22} color="#f59e0b" fill="#f59e0b" className="ml-1" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handlePress}
                    className="flex-1 justify-center py-1 h-full flex-row items-center"
                >
                    {/* The Cover image - Now squared and larger, properly placed alongside text */}
                    <Animated.Image
                        source={{ uri: currentTrack.coverUrl }}
                        className="w-12 h-12 rounded-lg mr-3 bg-zinc-800"
                        resizeMode="cover"
                    />

                    <View className="flex-1 justify-center">
                        <Text className="text-white font-inter-bold text-[15px] mb-1 leading-tight" numberOfLines={1}>
                            {currentTrack.title}
                        </Text>
                        <Text className="text-zinc-400 font-inter-medium text-xs" numberOfLines={1}>
                            {currentTrack.author.name}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Mini Progress Bar tucked inside the player visually */}
                <View className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/80 overflow-hidden">
                    <View
                        className="h-full bg-amber-500"
                        style={{ width: `${progress}%` }}
                    />
                </View>
            </Animated.View>
        </GestureDetector>
    );
}
