import { useRouter } from 'expo-router';
import { Headphones, Sparkles } from 'lucide-react-native';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-zinc-950 px-6 pb-12 pt-8 overflow-hidden">

            {/* Decorative Background Elements */}
            <View className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
            <View className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-orange-600/20 rounded-full blur-[80px]" />

            {/* Top Section */}
            <View className="items-center mt-12 z-10 w-full relative">
                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    className="bg-amber-500/10 p-6 rounded-full border border-amber-500/20 mb-8"
                >
                    <Headphones size={72} color="#f59e0b" strokeWidth={1.5} />
                    <View className="absolute top-1 right-1 w-5 h-5 bg-amber-400 rounded-full border-4 border-zinc-950 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                </Animated.View>

                <Animated.Text
                    entering={FadeInDown.delay(200).duration(800).springify()}
                    className="text-5xl font-inter-extrabold font-inter font-inter text-white tracking-tighter mb-4 text-center"
                >
                    Book<Text className="font-inter text-amber-500">Sync</Text>
                </Animated.Text>

                <Animated.Text
                    entering={FadeInDown.delay(400).duration(800).springify()}
                    className="font-inter font-inter text-zinc-400 text-lg text-center max-w-[300px] leading-relaxed"
                >
                    Immerse yourself in thousands of audiobooks anywhere, anytime. Your stories, perfectly synced.
                </Animated.Text>
            </View>

            {/* Abstract Mock Audio Visualizer */}
            <Animated.View
                entering={FadeIn.delay(600).duration(1000)}
                className="flex-1 justify-center items-center w-full my-10 z-10"
            >
                <View className="flex-row items-end h-32 space-x-2">
                    {[40, 70, 45, 90, 60, 100, 50, 80, 75, 40].map((height, i) => (
                        <Animated.View
                            key={i}
                            entering={FadeInUp.delay(800 + (i * 50)).duration(600).springify()}
                            className="w-4 rounded-full bg-gradient-to-t from-amber-600 to-amber-400 opacity-80"
                            style={{ height: `${height}%` }}
                        />
                    ))}
                </View>
            </Animated.View>

            {/* Bottom Action Section */}
            <View className="w-full space-y-4 z-10 mt-auto">
                <Animated.View entering={FadeInUp.delay(1000).duration(800).springify()}>
                    <TouchableOpacity
                        className="mb-2 w-full bg-amber-500 py-4 rounded-3xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] flex-row justify-center items-center"
                        onPress={() => router.push('/(auth)/signup')}
                    >
                        <Sparkles size={20} color="white" className="mr-2" />
                        <Text className="ml-2 font-inter text-zinc-950 text-lg font-inter-bold text-center tracking-wide">
                            Start Listening Free
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(1200).duration(800).springify()}>
                    <TouchableOpacity
                        className="w-full bg-zinc-900/50 py-4 rounded-3xl border border-zinc-800 flex-row justify-center items-center"
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text className="font-inter text-zinc-300 text-lg font-inter-bold text-center tracking-wide">
                            I already have an account
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
