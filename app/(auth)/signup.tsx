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
    const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);

    const handleSignup = async () => {
        if (!email || !password || !name) return;
        await signUp(name, email, password);
    };

    const isDisabled = isLoading || !email || !password || !name;

    return (
        <SafeAreaView className="flex-1 bg-zinc-950 overflow-hidden">

            {/* Ambient Background */}
            <View className="absolute top-0 right-[-100px] w-80 h-80 bg-orange-600/10 rounded-full blur-[100px]" />
            <View className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 pt-4 pb-10 z-10"
            >
                {/* Back Button */}
                <Animated.View entering={FadeIn.duration(500)} className="flex-row items-center mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-11 h-11 bg-zinc-900/80 rounded-full items-center justify-center border border-zinc-800"
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={20} color="#d4d4d8" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Brand Mark */}
                <Animated.View entering={FadeInDown.delay(50).duration(500)} className="mb-6">
                    <Text className="text-amber-500 font-inter-bold text-sm tracking-widest uppercase">BookSync</Text>
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mb-8">
                    <Text className="text-4xl font-inter-extrabold text-white tracking-tight mb-2">Create Account</Text>
                    <Text className="text-zinc-400 text-base leading-relaxed font-inter">
                        Start your journey into thousands of immersive audiobooks.
                    </Text>
                </Animated.View>

                {/* Form */}
                <View className="flex-1 space-y-4">
                    {/* Name Field */}
                    <Animated.View entering={FadeInUp.delay(200).duration(600).springify()}>
                        <Text className="text-zinc-400 text-xs mb-2 font-inter-medium ml-1 tracking-wide uppercase">Full Name</Text>
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-4 border ${focusedField === 'name'
                                ? 'bg-zinc-900 border-amber-500/60'
                                : 'bg-zinc-900/60 border-zinc-800'
                                }`}
                        >
                            <UserIcon size={20} color={focusedField === 'name' ? '#f59e0b' : '#71717a'} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-white text-base font-inter-medium"
                                placeholder="John Doe"
                                placeholderTextColor="#52525b"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </Animated.View>

                    {/* Email Field */}
                    <Animated.View entering={FadeInUp.delay(300).duration(600).springify()}>
                        <Text className="text-zinc-400 text-xs mb-2 font-inter-medium ml-1 tracking-wide uppercase">Email</Text>
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-4 border ${focusedField === 'email'
                                ? 'bg-zinc-900 border-amber-500/60'
                                : 'bg-zinc-900/60 border-zinc-800'
                                }`}
                        >
                            <Mail size={20} color={focusedField === 'email' ? '#f59e0b' : '#71717a'} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-white text-base font-inter-medium"
                                placeholder="name@example.com"
                                placeholderTextColor="#52525b"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </Animated.View>

                    {/* Password Field */}
                    <Animated.View entering={FadeInUp.delay(400).duration(600).springify()}>
                        <Text className="text-zinc-400 text-xs mb-2 font-inter-medium ml-1 tracking-wide uppercase">Password</Text>
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-4 border ${focusedField === 'password'
                                ? 'bg-zinc-900 border-amber-500/60'
                                : 'bg-zinc-900/60 border-zinc-800'
                                }`}
                        >
                            <Lock size={20} color={focusedField === 'password' ? '#f59e0b' : '#71717a'} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-white text-base font-inter-medium"
                                placeholder="••••••••"
                                placeholderTextColor="#52525b"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pl-2">
                                {showPassword
                                    ? <EyeOff size={20} color="#71717a" />
                                    : <Eye size={20} color="#71717a" />
                                }
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>

                {/* Footer */}
                <Animated.View
                    entering={FadeInUp.delay(500).duration(800).springify()}
                    className="mt-auto space-y-5"
                >
                    <TouchableOpacity
                        className={`w-full py-[17px] rounded-2xl flex-row justify-center items-center shadow-[0_8px_30px_rgba(245,158,11,0.25)] ${isDisabled ? 'bg-amber-500/50' : 'bg-amber-500'}`}
                        onPress={handleSignup}
                        disabled={isDisabled}
                        activeOpacity={0.85}
                    >
                        {isLoading
                            ? <ActivityIndicator color="#18181b" />
                            : <Text className="text-zinc-950 text-base font-inter-bold text-center tracking-wide">Create Account</Text>
                        }
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center pt-2">
                        <Text className="text-zinc-400 text-base font-inter">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text className="text-amber-500 text-base font-inter-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
