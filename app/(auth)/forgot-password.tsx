import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { resetPassword, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [focusedField, setFocusedField] = useState(false);

    const handleReset = async () => {
        if (!email) return;
        await resetPassword(email);
        setIsSubmitted(true);
    };

    const isDisabled = isLoading || !email;

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
                    <Text className="text-4xl font-inter-extrabold text-white tracking-tight mb-2">Reset Password</Text>
                    <Text className="text-zinc-400 text-base leading-relaxed font-inter">
                        {isSubmitted
                            ? "We've sent a secure password reset link to your email."
                            : "Enter your email address and we'll send you instructions to reset your password."}
                    </Text>
                </Animated.View>

                {/* Form Body */}
                {!isSubmitted ? (
                    <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} className="flex-1">
                        <Text className="text-zinc-400 text-xs mb-2 font-inter-medium ml-1 tracking-wide uppercase">Email Address</Text>
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-4 border ${focusedField
                                ? 'bg-zinc-900 border-amber-500/60'
                                : 'bg-zinc-900/60 border-zinc-800'
                                }`}
                        >
                            <Mail size={20} color={focusedField ? '#f59e0b' : '#71717a'} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-white text-base font-inter-medium"
                                placeholder="name@example.com"
                                placeholderTextColor="#52525b"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setFocusedField(true)}
                                onBlur={() => setFocusedField(false)}
                            />
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={FadeIn.delay(200).duration(600)}
                        className="flex-1 justify-center items-center pb-20"
                    >
                        <Animated.View
                            entering={FadeInDown.delay(300).springify()}
                            className="bg-amber-500/10 p-7 rounded-full border border-amber-500/20 mb-6"
                        >
                            <CheckCircle size={56} color="#f59e0b" strokeWidth={1.5} />
                        </Animated.View>
                        <Animated.Text entering={FadeInUp.delay(400).springify()} className="text-white text-2xl font-inter-bold mb-3">
                            Check your mail
                        </Animated.Text>
                        <Animated.Text entering={FadeInUp.delay(500).springify()} className="text-zinc-400 text-center px-6 text-base leading-relaxed font-inter">
                            We've sent password recovery instructions to {email}.
                        </Animated.Text>
                    </Animated.View>
                )}

                {/* Footer */}
                <Animated.View
                    entering={FadeInUp.delay(500).duration(800).springify()}
                    className="mt-auto space-y-5"
                >
                    {!isSubmitted ? (
                        <TouchableOpacity
                            className={`w-full py-[17px] rounded-2xl flex-row justify-center items-center shadow-[0_8px_30px_rgba(245,158,11,0.25)] ${isDisabled ? 'bg-amber-500/50' : 'bg-amber-500'}`}
                            onPress={handleReset}
                            disabled={isDisabled}
                            activeOpacity={0.85}
                        >
                            {isLoading
                                ? <ActivityIndicator color="#18181b" />
                                : <Text className="text-zinc-950 text-base font-inter-bold text-center tracking-wide">Send Instructions</Text>
                            }
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className="w-full bg-zinc-900/50 border border-zinc-800 py-[17px] rounded-2xl flex-row justify-center items-center"
                            onPress={() => router.push('/(auth)/login')}
                            activeOpacity={0.8}
                        >
                            <Text className="text-zinc-300 text-base font-inter-semibold text-center tracking-wide">Back to Sign In</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
