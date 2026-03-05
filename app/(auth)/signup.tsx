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
        <SafeAreaView className="flex-1 bg-background overflow-hidden">

            {/* Ambient Background */}
            <View className="absolute top-0 right-[-100px] w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
            <View className="absolute bottom-[-100px] left-[-50px] w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 pt-4 pb-10 z-10"
            >
                {/* Back Button */}
                <Animated.View entering={FadeIn.duration(500)} className="flex-row items-center mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-11 h-11 bg-secondary/80 rounded-full items-center justify-center border border-border"
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={20} color="hsl(60 9.1% 97.8%)" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Brand Mark */}
                <Animated.View entering={FadeInDown.delay(50).duration(500)} className="mb-6">
                    <Text className="text-primary font-inter-bold text-sm tracking-widest uppercase">BookSync</Text>
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="mb-8">
                    <Text className="text-4xl font-inter-extrabold text-foreground tracking-tight mb-2">Create Account</Text>
                    <Text className="text-muted-foreground text-base leading-relaxed font-inter">
                        Start your journey into thousands of immersive audiobooks.
                    </Text>
                </Animated.View>

                {/* Form */}
                <View className="flex-1 space-y-4">
                    {/* Name Field */}
                    <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} className="mb-5">
                        <Text className="text-muted-foreground text-xs mb-2 font-inter-medium ml-1 tracking-wide uppercase">Full Name</Text>
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-4 border ${focusedField === 'name'
                                ? 'bg-secondary border-primary/60'
                                : 'bg-secondary/60 border-border'
                                }`}
                        >
                            <UserIcon size={20} color={focusedField === 'name' ? 'hsl(20.5 90.2% 48.2%)' : '#71717a'} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-foreground text-base font-inter-medium"
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
                    <Animated.View entering={FadeInUp.delay(300).duration(600).springify()} className="mb-5">
                        <Text className="text-muted-foreground text-xs mb-2 font-inter-medium ml-1 tracking-wide uppercase">Email</Text>
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-4 border ${focusedField === 'email'
                                ? 'bg-secondary border-primary/60'
                                : 'bg-secondary/60 border-border'
                                }`}
                        >
                            <Mail size={20} color={focusedField === 'email' ? 'hsl(20.5 90.2% 48.2%)' : '#71717a'} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-foreground text-base font-inter-medium"
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
                    <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} className="mb-5">
                        <Text className="text-muted-foreground text-xs mb-2 font-inter-medium ml-1 tracking-wide uppercase">Password</Text>
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-4 border ${focusedField === 'password'
                                ? 'bg-secondary border-primary/60'
                                : 'bg-secondary/60 border-border'
                                }`}
                        >
                            <Lock size={20} color={focusedField === 'password' ? 'hsl(20.5 90.2% 48.2%)' : '#71717a'} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-foreground text-base font-inter-medium"
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
                        className={`w-full py-[17px] rounded-2xl flex-row justify-center items-center shadow-md ${isDisabled ? 'bg-primary/50' : 'bg-primary'}`}
                        onPress={handleSignup}
                        disabled={isDisabled}
                        activeOpacity={0.85}
                    >
                        {isLoading
                            ? <ActivityIndicator color="hsl(20 14.3% 4.1%)" />
                            : <Text className="text-background text-base font-inter-bold text-center tracking-wide">Create Account</Text>
                        }
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center pt-2">
                        <Text className="text-muted-foreground text-base font-inter">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text className="text-primary text-base font-inter-bold">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
