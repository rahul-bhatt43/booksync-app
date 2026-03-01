import apiClient from '@/api/client';
import { Download } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Linking, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

// Current static build links for each platform
const CURRENT_ANDROID_LINK = 'https://expo.dev/accounts/rahulbhatt3578/projects/BookSync/builds/57288cec-bf14-4aa5-b290-def87188010c';
const CURRENT_IOS_LINK = ''; // Update when iOS link is available

export default function UpdateIndicator() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateLink, setUpdateLink] = useState('');

    useEffect(() => {
        const checkUpdate = async () => {
            try {
                const response = await apiClient.get('/app-links/active');
                const activeLinks = response.data?.data || [];

                // Find link for current platform
                const platformLink = activeLinks.find((link: any) => link.platform === Platform.OS);

                if (platformLink && platformLink.isActive) {
                    let currentLink = '';
                    if (Platform.OS === 'android') currentLink = CURRENT_ANDROID_LINK;
                    else if (Platform.OS === 'ios') currentLink = CURRENT_IOS_LINK;

                    // If current link is set and fetched URL is different, we have an update
                    if (currentLink && platformLink.url !== currentLink) {
                        setUpdateLink(platformLink.url);
                        setUpdateAvailable(true);
                    }
                }
            } catch (error) {
                console.log('Error checking for updates:', error);
            }
        };

        checkUpdate();
    }, []);

    if (!updateAvailable) return null;

    return (
        <Modal visible={updateAvailable} transparent={true} animationType="fade">
            <View className="flex-1 bg-black/80 justify-center items-center px-6">
                <Animated.View entering={SlideInDown.duration(400).springify()} className="bg-zinc-900 w-full rounded-3xl p-6 items-center border border-zinc-800 shadow-2xl">
                    <View className="w-16 h-16 bg-amber-500/20 rounded-full items-center justify-center mb-4">
                        <Download size={32} color="#f59e0b" />
                    </View>
                    <Text className="text-white font-inter-bold text-2xl mb-2">Update Available</Text>
                    <Text className="text-zinc-400 font-inter-medium text-center mb-8 px-2 leading-6">
                        A newer version of the app is available. Please update to enjoy the latest features and improvements.
                    </Text>
                    <TouchableOpacity
                        className="bg-amber-500 w-full py-4 rounded-2xl items-center shadow-[0_4px_14px_rgba(245,158,11,0.39)]"
                        activeOpacity={0.8}
                        onPress={() => {
                            if (updateLink) Linking.openURL(updateLink);
                        }}
                    >
                        <Text className="text-zinc-950 font-inter-bold text-lg">Download Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="mt-4 p-2"
                        onPress={() => setUpdateAvailable(false)}
                    >
                        <Text className="text-zinc-500 font-inter-medium text-sm">Maybe Later</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}
