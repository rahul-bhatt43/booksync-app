import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BAR_HEIGHTS = [35, 65, 42, 88, 55, 100, 48, 78, 70, 38, 60, 85];

function AudioBar({ targetHeight, delay }: { targetHeight: number; delay: number }) {
    const height = useSharedValue(20);

    useEffect(() => {
        height.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(targetHeight, { duration: 500 + Math.random() * 400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(Math.max(12, targetHeight * 0.3), { duration: 400 + Math.random() * 300, easing: Easing.inOut(Easing.ease) }),
                    withTiming(targetHeight * 0.6, { duration: 350 + Math.random() * 250, easing: Easing.inOut(Easing.ease) }),
                    withTiming(20, { duration: 400, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({ height: height.value }));

    return (
        <Animated.View
            style={[style, { width: 6, borderRadius: 4, marginHorizontal: 4, backgroundColor: 'hsl(20.5 90.2% 48.2%)', opacity: 0.85 }]}
        />
    );
}

const FEATURES = [
    { icon: '📚', label: '40+ Titles' },
    { icon: '🎧', label: 'Offline Mode' },
    { icon: '🔥', label: 'Best Sellers' },
];

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-background px-6 pb-12 pt-8 overflow-hidden">

            {/* Decorative Background Elements */}
            <View className="absolute top-[-120px] left-[-80px] w-96 h-96 bg-primary/15 rounded-full blur-[100px]" />
            <View className="absolute bottom-[-60px] right-[-60px] w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />
            <View className="absolute top-[40%] left-[30%] w-40 h-40 bg-primary/8 rounded-full blur-[60px]" />

            {/* Top Section */}
            <View className="items-center mt-8 z-10 w-full relative">
                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    className="bg-primary/10 p-5 rounded-full border border-primary/25 mb-6"
                >
                    <Image
                        source={require('../../assets/images/splash-icon.png')}
                        style={{ width: 80, height: 80 }}
                        resizeMode="contain"
                    />
                    <View className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full border-4 border-background" />
                </Animated.View>

                <Animated.Text
                    entering={FadeInDown.delay(200).duration(800).springify()}
                    className="text-5xl font-inter-extrabold text-foreground tracking-tighter mb-3 text-center"
                >
                    Book<Text className="text-primary">Sync</Text>
                </Animated.Text>

                <Animated.Text
                    entering={FadeInDown.delay(400).duration(800).springify()}
                    className="text-muted-foreground text-base text-center max-w-[280px] leading-relaxed font-inter"
                >
                    Immerse yourself in thousands of audiobooks, perfectly synced across all your devices.
                </Animated.Text>
            </View>

            {/* Animated Audio Visualizer */}
            <Animated.View
                entering={FadeIn.delay(600).duration(1000)}
                className="justify-center items-center w-full my-8 z-10"
            >
                <View className="flex-row items-end" style={{ height: 80 }}>
                    {BAR_HEIGHTS.map((h, i) => (
                        <AudioBar key={i} targetHeight={(h / 100) * 72} delay={i * 60} />
                    ))}
                </View>
            </Animated.View>

            {/* Feature Pills */}
            <Animated.View
                entering={FadeInUp.delay(700).duration(700).springify()}
                className="flex-row justify-center flex-wrap gap-2 mb-6 z-10"
            >
                {FEATURES.map((f, i) => (
                    <View
                        key={i}
                        className="flex-row items-center bg-secondary/70 border border-border/60 px-4 py-2 rounded-full"
                    >
                        <Text style={{ fontSize: 13 }}>{f.icon}</Text>
                        <Text className="text-muted-foreground font-inter-medium text-xs ml-1.5">{f.label}</Text>
                    </View>
                ))}
            </Animated.View>

            {/* Bottom Action Section */}
            <View className="w-full space-y-3 z-10 mt-auto">
                <Animated.View entering={FadeInUp.delay(900).duration(800).springify()}>
                    <TouchableOpacity
                        className="mb-4 w-full bg-primary py-[17px] rounded-2xl flex-row justify-center items-center shadow-md"
                        onPress={() => router.push('/(auth)/signup')}
                        activeOpacity={0.85}
                    >
                        <Sparkles size={19} color="hsl(20 14.3% 4.1%)" />
                        <Text className="ml-2 text-background text-base font-inter-bold text-center tracking-wide">
                            Start Listening
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(1050).duration(800).springify()}>
                    <TouchableOpacity
                        className="w-full bg-secondary/50 py-[17px] rounded-2xl border border-border flex-row justify-center items-center"
                        onPress={() => router.push('/(auth)/login')}
                        activeOpacity={0.8}
                    >
                        <Text className="text-muted-foreground text-base font-inter-semibold text-center tracking-wide">
                            I already have an account
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
