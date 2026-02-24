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

    const handleReset = async () => {
        if (!email) return;
        await resetPassword(email);
        setIsSubmitted(true);
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
                    <Text className="text-4xl font-inter-extrabold font-inter font-inter text-white tracking-tight mb-3">Reset Password</Text>
                    <Text className="font-inter font-inter text-zinc-400 text-base leading-relaxed">
                        {isSubmitted
                            ? "We've sent a secure password reset link to your email."
                            : "Enter the email associated with your account and we'll send instructions to reset your password."}
                    </Text>
                </Animated.View>

                {/* Form Body */}
                {!isSubmitted ? (
                    <View className="space-y-6 flex-1">
                        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()}>
                            <Text className="font-inter font-inter text-zinc-400 text-sm mb-2 font-inter-medium ml-1">Email Address</Text>
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
                    </View>
                ) : (
                    <Animated.View
                        entering={FadeIn.delay(200).duration(600)}
                        className="flex-1 justify-center items-center pb-20"
                    >
                        <Animated.View
                            entering={FadeInDown.delay(300).springify()}
                            className="bg-amber-500/10 p-6 rounded-full border border-amber-500/20 mb-6"
                        >
                            <CheckCircle size={56} color="#f59e0b" strokeWidth={1.5} />
                        </Animated.View>
                        <Animated.Text entering={FadeInUp.delay(400).springify()} className="font-inter font-inter text-white text-2xl font-inter-bold mb-3">Check your mail</Animated.Text>
                        <Animated.Text entering={FadeInUp.delay(500).springify()} className="font-inter font-inter text-zinc-400 text-center px-6 text-base leading-relaxed">
                            We have sent detailed password recovery instructions to {email}.
                        </Animated.Text>
                    </Animated.View>
                )}

                {/* Footer Actions */}
                <Animated.View
                    entering={FadeInUp.delay(500).duration(800).springify()}
                    className="mt-auto pt-6 space-y-8"
                >
                    {!isSubmitted ? (
                        <TouchableOpacity
                            className={`w-full bg-amber-500 py-4 rounded-3xl flex-row justify-center items-center shadow-[0_8px_30px_rgba(245,158,11,0.25)] ${(isLoading || !email) ? 'opacity-100' : ''}`}
                            onPress={handleReset}
                            disabled={isLoading || !email}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#18181b" />
                            ) : (
                                <Text className="font-inter text-zinc-950 text-lg font-inter-bold text-center tracking-wide">Send Instructions</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className="w-full bg-zinc-900/50 border border-zinc-800 py-4 rounded-3xl flex-row justify-center items-center"
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text className="font-inter text-zinc-300 text-lg font-inter-bold text-center tracking-wide">Back to Sign In</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
