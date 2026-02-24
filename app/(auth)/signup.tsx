import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
    const router = useRouter();
    const { signUp, isLoading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !name) return;
        await signUp(name, email, password);
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950 overflow-hidden">

            {/* Ambient Background */}
            <View className="absolute top-0 right-[-100px] w-80 h-80 bg-orange-600/10 rounded-full blur-[100px]" />
            <View className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 pt-4 pb-12 z-10"
            >
                {/* Header */}
                <Animated.View entering={FadeIn.duration(500)} className="flex-row items-center mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-zinc-900/80 rounded-full items-center justify-center border border-zinc-800"
                    >
                        <ArrowLeft size={22} color="#d4d4d8" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mb-8">
                    <Text className="text-4xl font-inter-extrabold font-inter font-inter text-white tracking-tight mb-3">Create Account</Text>
                    <Text className="font-inter font-inter text-zinc-400 text-base leading-relaxed">
                        Start your journey into thousands of immersive audiobooks.
                    </Text>
                </Animated.View>

                {/* Form */}
                <View className="space-y-5 flex-1">
                    <Animated.View entering={FadeInUp.delay(200).duration(600).springify()}>
                        <Text className="font-inter font-inter text-zinc-400 text-sm mb-2 font-inter-medium ml-1">Full Name</Text>
                        <View className="flex-row items-center bg-zinc-900/60 rounded-3xl px-5 py-4 border border-zinc-800 focus:border-amber-500 focus:bg-zinc-900/80 transition-colors">
                            <UserIcon size={22} color="#a1a1aa" className="mr-3" />
                            <TextInput
                                className="flex-1 font-inter font-inter text-white text-base font-inter-medium"
                                placeholder="John Doe"
                                placeholderTextColor="#52525b"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(300).duration(600).springify()}>
                        <Text className="mt-4 font-inter font-inter text-zinc-400 text-sm mb-2 font-inter-medium ml-1">Email Address</Text>
                        <View className="flex-row items-center bg-zinc-900/60 rounded-3xl px-5 py-4 border border-zinc-800 focus:border-amber-500 focus:bg-zinc-900/80 transition-colors">
                            <Mail size={22} color="#a1a1aa" className="mr-3" />
                            <TextInput
                                className="flex-1 font-inter font-inter text-white text-base font-inter-medium"
                                placeholder="name@example.com"
                                placeholderTextColor="#52525b"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(400).duration(600).springify()}>
                        <Text className="mt-4 font-inter font-inter text-zinc-400 text-sm mb-2 font-inter-medium ml-1">Password</Text>
                        <View className="flex-row items-center bg-zinc-900/60 rounded-3xl px-5 py-4 border border-zinc-800 focus:border-amber-500 focus:bg-zinc-900/80 transition-colors">
                            <Lock size={22} color="#a1a1aa" className="mr-3" />
                            <TextInput
                                className="flex-1 font-inter font-inter text-white text-base font-inter-medium"
                                placeholder="••••••••"
                                placeholderTextColor="#52525b"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pl-2">
                                {showPassword ? <EyeOff size={22} color="#a1a1aa" /> : <Eye size={22} color="#a1a1aa" />}
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>

                {/* Footer Actions */}
                <Animated.View
                    entering={FadeInUp.delay(500).duration(800).springify()}
                    className="mt-auto pt-6 space-y-8"
                >
                    <TouchableOpacity
                        className={`w-full bg-amber-500 py-4 rounded-3xl flex-row justify-center items-center shadow-[0_8px_30px_rgba(245,158,11,0.25)] ${(isLoading || !email || !password || !name) ? 'opacity-100' : ''}`}
                        onPress={handleSignup}
                        disabled={isLoading || !email || !password || !name}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#18181b" />
                        ) : (
                            <Text className="font-inter text-zinc-950 text-lg font-inter-bold text-center tracking-wide">Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <View className="mt-4 flex-row justify-center items-center pb-4">
                        <Text className="font-inter font-inter text-zinc-400 text-base">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text className="font-inter text-amber-500 text-base font-inter-bold tracking-wide">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
