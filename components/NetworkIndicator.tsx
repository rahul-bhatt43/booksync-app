import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NetworkIndicator() {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    if (isConnected !== false) return null;

    return (
        <Animated.View
            entering={FadeInUp.duration(400).springify()}
            exiting={FadeOutUp.duration(300)}
            className="absolute left-0 right-0 flex-row justify-center"
            style={{ top: Math.max(insets.top + 10, 40), zIndex: 9999, elevation: 9999 }}
            pointerEvents="none"
        >
            <View className="bg-red-500/95 border border-red-400/50 rounded-full px-5 py-2.5 flex-row items-center shadow-[0_4px_20px_rgba(239,68,68,0.4)]">
                <WifiOff size={16} color="white" className="mr-2.5" />
                <Text className="text-white font-inter-semibold text-sm">
                    No internet connection
                </Text>
            </View>
        </Animated.View>
    );
}
