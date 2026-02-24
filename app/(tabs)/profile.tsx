import GlassContainer from '@/components/GlassContainer';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, Clock, CreditCard, Headphones, HelpCircle, LogOut, Settings } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { clearAudio } = useAudio();

    const handleSignOut = async () => {
        await clearAudio();
        signOut();
    };

    const menuItems = [
        { icon: <Settings size={22} color="#a1a1aa" />, label: 'Account Settings' },
        { icon: <CreditCard size={22} color="#a1a1aa" />, label: 'Subscription' },
        { icon: <HelpCircle size={22} color="#a1a1aa" />, label: 'Help & Support' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Header & Avatar */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="px-6 pt-6 pb-8 items-center border-b border-zinc-800/50">
                    <View className="w-24 h-24 rounded-full bg-zinc-800 mb-4 items-center justify-center border-2 border-amber-500/30">
                        <Text className="text-amber-500 font-inter-bold text-3xl">
                            {user?.name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <Text className="text-white font-inter-bold text-2xl tracking-tight mb-1">{user?.name || 'User'}</Text>
                    <Text className="text-zinc-400 font-inter text-sm mb-6">{user?.email || 'user@example.com'}</Text>

                    {/* Quick Stats */}
                    <View className="flex-row justify-between w-full px-4">
                        <GlassContainer intensity="light" className="flex-1 items-center py-4 mr-3">
                            <Clock size={24} color="#f59e0b" className="mb-2" />
                            <Text className="text-white font-inter-bold text-xl mb-1">124h</Text>
                            <Text className="text-zinc-500 font-inter-medium text-xs">Listened</Text>
                        </GlassContainer>
                        <GlassContainer intensity="light" className="flex-1 items-center py-4 ml-3">
                            <Headphones size={24} color="#f59e0b" className="mb-2" />
                            <Text className="text-white font-inter-bold text-xl mb-1">12</Text>
                            <Text className="text-zinc-500 font-inter-medium text-xs">Finished</Text>
                        </GlassContainer>
                    </View>
                </Animated.View>

                {/* Menu Items */}
                <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="px-6 pt-8 mb-16">
                    <Text className="text-zinc-500 font-inter-semibold text-xs uppercase tracking-wider mb-4 px-2">Settings</Text>
                    <GlassContainer intensity="light" className="mb-8 p-2">
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                className={`flex-row items-center py-4 px-4 ${index !== menuItems.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                                activeOpacity={0.7}
                            >
                                <View className="w-8">{item.icon}</View>
                                <Text className="flex-1 text-white font-inter-medium text-base">{item.label}</Text>
                                <ChevronRight size={20} color="#52525b" />
                            </TouchableOpacity>
                        ))}
                    </GlassContainer>

                    <TouchableOpacity
                        className="flex-row items-center justify-center py-4 rounded-2xl bg-zinc-900 border border-zinc-800"
                        onPress={handleSignOut}
                        activeOpacity={0.7}
                    >
                        <LogOut size={20} color="#ef4444" className="mr-2" />
                        <Text className="text-red-500 font-inter-semibold text-base">Sign Out</Text>
                    </TouchableOpacity>
                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    );
}
