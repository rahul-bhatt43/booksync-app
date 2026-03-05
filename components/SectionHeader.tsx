import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
    title: string;
    onPressSeeAll?: () => void;
    showSeeAll?: boolean;
    className?: string;
}

export default function SectionHeader({
    title,
    onPressSeeAll,
    showSeeAll = true,
    className = ''
}: SectionHeaderProps) {
    return (
        <View className={`flex-row justify-between items-center mb-4 px-1 ${className}`}>
            <View className="flex-row items-center">
                {/* Primary accent bar */}
                <View className="w-1 h-5 bg-primary rounded-full mr-2.5" />
                <Text className="text-foreground text-xl font-inter-bold tracking-tight">
                    {title}
                </Text>
            </View>

            {showSeeAll && (
                <TouchableOpacity
                    className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
                    onPress={onPressSeeAll}
                    activeOpacity={0.7}
                >
                    <Text className="text-primary text-xs font-inter-semibold mr-0.5">
                        See All
                    </Text>
                    <ChevronRight size={13} color="hsl(20.5 90.2% 48.2%)" />
                </TouchableOpacity>
            )}
        </View>
    );
}
