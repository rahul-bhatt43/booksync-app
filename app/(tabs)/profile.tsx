import apiClient from '@/api/client';
import Skeleton from '@/components/Skeleton';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, Clock, CreditCard, Headphones, HelpCircle, LogOut, Settings } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { clearAudio } = useAudio();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    useEffect(() => {
        fetchProfile();
    }, [user?.id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProfile();
        setRefreshing(false);
    }, [user?.id]);

    const handleSignOut = async () => {
        await clearAudio();
        signOut();
    };

    const menuItems = [
        { icon: Settings, label: 'Account Settings', subtitle: 'Edit profile & preferences' },
        { icon: CreditCard, label: 'Subscription', subtitle: 'Manage your plan' },
        { icon: HelpCircle, label: 'Help & Support', subtitle: 'FAQs and contact us' },
    ];

    const firstName = user?.name?.split(' ')[0] || 'U';

    return (
        <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
            {loading ? (
                <View className="flex-1 px-6 pt-6">
                    <View className="items-center pb-8 border-b border-zinc-800/50">
                        <Skeleton width={96} height={96} borderRadius={48} className="mb-4" />
                        <Skeleton width={160} height={28} className="mb-2" />
                        <Skeleton width={120} height={16} className="mb-6" />
                        <View className="flex-row justify-between w-full px-4">
                            <Skeleton width="45%" height={88} borderRadius={20} />
                            <Skeleton width="45%" height={88} borderRadius={20} />
                        </View>
                    </View>
                    <View className="pt-8">
                        <Skeleton width={80} height={14} className="mb-4" />
                        <Skeleton width="100%" height={180} borderRadius={20} className="mb-6" />
                        <Skeleton width="100%" height={56} borderRadius={16} />
                    </View>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" colors={['#f59e0b']} />
                    }
                >
                    {/* Header & Avatar */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} className="px-6 pt-6 pb-8 items-center">
                        {/* Avatar with gradient ring effect */}
                        <View className="relative mb-4">
                            {/* Outer glow ring */}
                            <View
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    padding: 3,
                                    backgroundColor: '#f59e0b',
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        borderRadius: 47,
                                        backgroundColor: '#27272a',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={{ color: '#f59e0b', fontFamily: 'Inter-Bold', fontSize: 32 }}>
                                        {firstName.charAt(0)}
                                    </Text>
                                </View>
                            </View>
                            {/* Online dot */}
                            <View className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                        </View>

                        <Text className="text-white font-inter-bold text-2xl tracking-tight mb-1">{user?.name || 'User'}</Text>
                        <Text className="text-zinc-500 font-inter text-sm mb-6">{user?.email || 'user@example.com'}</Text>

                        {/* Quick Stats */}
                        <View className="flex-row w-full" style={{ gap: 12 }}>
                            <View className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl items-center py-4">
                                <View className="w-10 h-10 bg-amber-500/15 rounded-full items-center justify-center mb-2">
                                    <Clock size={20} color="#f59e0b" />
                                </View>
                                <Text className="text-white font-inter-bold text-xl mb-0.5">
                                    {profileData?.user?.createdAt ? new Date(profileData.user.createdAt).getFullYear() : 'New'}
                                </Text>
                                <Text className="text-zinc-500 font-inter-medium text-xs">Joined</Text>
                            </View>
                            <View className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl items-center py-4">
                                <View className="w-10 h-10 bg-amber-500/15 rounded-full items-center justify-center mb-2">
                                    <Headphones size={20} color="#f59e0b" />
                                </View>
                                <Text className="text-white font-inter-bold text-xl mb-0.5">
                                    {profileData?.likes?.length || 0}
                                </Text>
                                <Text className="text-zinc-500 font-inter-medium text-xs">Liked</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Divider */}
                    <View className="h-px bg-zinc-800/60 mx-6 mb-8" />

                    {/* Menu Items */}
                    <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} className="px-6">
                        <Text className="text-zinc-500 font-inter-semibold text-xs uppercase tracking-wider mb-4">Settings</Text>

                        <View className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
                            {menuItems.map((item, index) => {
                                const IconComp = item.icon;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        className={`flex-row items-center py-4 px-4 ${index !== menuItems.length - 1 ? 'border-b border-zinc-800/60' : ''}`}
                                        activeOpacity={0.7}
                                    >
                                        <View className="w-9 h-9 bg-zinc-800/80 rounded-xl items-center justify-center mr-3">
                                            <IconComp size={18} color="#a1a1aa" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-white font-inter-semibold text-base">{item.label}</Text>
                                            <Text className="text-zinc-500 font-inter text-xs mt-0.5">{item.subtitle}</Text>
                                        </View>
                                        <ChevronRight size={19} color="#3f3f46" />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Sign Out */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-4 rounded-2xl bg-red-500/8 border border-red-500/25"
                            onPress={handleSignOut}
                            activeOpacity={0.75}
                        >
                            <LogOut size={18} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text className="text-red-500 font-inter-semibold text-base">Sign Out</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
