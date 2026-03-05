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
    const [error, setError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState(false);

    const handleReset = async () => {
        if (!email) return;
        setError(null);
        try {
            await resetPassword(email);
            setIsSubmitted(true);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to send reset instructions. Please try again.';
            setError(message);
        }
    };

    const isDisabled = isLoading || !email;

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
                    <Text className="text-4xl font-inter-extrabold text-foreground tracking-tight mb-2">Reset Password</Text>
                    <Text className="text-muted-foreground text-base leading-relaxed font-inter">
                        {isSubmitted
                            ? "We've sent a secure password reset link to your email."
                            : "Enter your email address and we'll send you instructions to reset your password."}
                    </Text>
                </Animated.View>

                {/* Form Body */}
                {!isSubmitted ? (
                    <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} className="flex-1">
                        <Text className="text-muted-foreground text-xs mb-2 font-inter-medium ml-1 tracking-wide uppercase">Email Address</Text>
                        <View
                            className={`flex-row items-center rounded-2xl px-4 py-4 border ${focusedField
                                ? 'bg-secondary border-primary/60'
                                : error ? 'bg-secondary border-red-500/50' : 'bg-secondary/60 border-border'
                                }`}
                        >
                            <Mail size={20} color={focusedField ? 'hsl(20.5 90.2% 48.2%)' : error ? '#ef4444' : '#71717a'} style={{ marginRight: 12 }} />
                            <TextInput
                                className="flex-1 text-foreground text-base font-inter-medium"
                                placeholder="name@example.com"
                                placeholderTextColor="#52525b"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (error) setError(null);
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setFocusedField(true)}
                                onBlur={() => setFocusedField(false)}
                            />
                        </View>
                        {error && (
                            <Animated.Text entering={FadeIn.duration(300)} className="text-red-400 text-xs mt-2 ml-1 font-inter-medium">
                                {error}
                            </Animated.Text>
                        )}
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={FadeIn.delay(200).duration(600)}
                        className="flex-1 justify-center items-center pb-20"
                    >
                        <Animated.View
                            entering={FadeInDown.delay(300).springify()}
                            className="bg-primary/10 p-7 rounded-full border border-primary/20 mb-6"
                        >
                            <CheckCircle size={56} color="hsl(20.5 90.2% 48.2%)" strokeWidth={1.5} />
                        </Animated.View>
                        <Animated.Text entering={FadeInUp.delay(400).springify()} className="text-foreground text-2xl font-inter-bold mb-3">
                            Check your mail
                        </Animated.Text>
                        <Animated.Text entering={FadeInUp.delay(500).springify()} className="text-muted-foreground text-center px-6 text-base leading-relaxed font-inter">
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
                            className={`w-full py-[17px] rounded-2xl flex-row justify-center items-center shadow-md ${isDisabled ? 'bg-primary/50' : 'bg-primary'}`}
                            onPress={handleReset}
                            disabled={isDisabled}
                            activeOpacity={0.85}
                        >
                            {isLoading
                                ? <ActivityIndicator color="hsl(20 14.3% 4.1%)" />
                                : <Text className="text-background text-base font-inter-bold text-center tracking-wide">Send Instructions</Text>
                            }
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            className="w-full bg-secondary/50 border border-border py-[17px] rounded-2xl flex-row justify-center items-center"
                            onPress={() => router.push('/(auth)/login')}
                            activeOpacity={0.8}
                        >
                            <Text className="text-muted-foreground text-base font-inter-semibold text-center tracking-wide">Back to Sign In</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
