import apiClient from '@/api/client';
import GlassContainer from '@/components/GlassContainer';
import Skeleton from '@/components/Skeleton';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, Clock, CreditCard, Headphones, HelpCircle, LogOut, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { clearAudio } = useAudio();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            try {
                const response = await apiClient.get(`/users/profile/${user.id}`);
                setProfileData(response.data.data);
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.id]);

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
            {loading ? (
                <View className="flex-1 px-6 pt-6">
                    <View className="items-center pb-8 border-b border-zinc-800/50">
                        <Skeleton width={96} height={96} borderRadius={48} className="mb-4" />
                        <Skeleton width={160} height={28} className="mb-2" />
                        <Skeleton width={120} height={16} className="mb-6" />
                        <View className="flex-row justify-between w-full px-4">
                            <Skeleton width="45%" height={80} borderRadius={16} className="mr-3" />
                            <Skeleton width="45%" height={80} borderRadius={16} className="ml-3" />
                        </View>
                    </View>
                    <View className="pt-8 mb-16">
                        <Skeleton width={80} height={14} className="mb-4" />
                        <Skeleton width="100%" height={200} borderRadius={16} className="mb-8" />
                        <Skeleton width="100%" height={56} borderRadius={16} />
                    </View>
                </View>
            ) : (
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
                                <Text className="text-white font-inter-bold text-xl mb-1">{profileData?.user?.createdAt ? new Date(profileData.user.createdAt).getFullYear() : 'New'}</Text>
                                <Text className="text-zinc-500 font-inter-medium text-xs">Joined</Text>
                            </GlassContainer>
                            <GlassContainer intensity="light" className="flex-1 items-center py-4 ml-3">
                                <Headphones size={24} color="#f59e0b" className="mb-2" />
                                <Text className="text-white font-inter-bold text-xl mb-1">{profileData?.likes?.length || 0}</Text>
                                <Text className="text-zinc-500 font-inter-medium text-xs">Likes</Text>
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
            )}
        </SafeAreaView>
    );
}
