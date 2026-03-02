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
                {/* Amber accent bar */}
                <View className="w-1 h-5 bg-amber-500 rounded-full mr-2.5" />
                <Text className="text-white text-xl font-inter-bold tracking-tight">
                    {title}
                </Text>
            </View>

            {showSeeAll && (
                <TouchableOpacity
                    className="flex-row items-center bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20"
                    onPress={onPressSeeAll}
                    activeOpacity={0.7}
                >
                    <Text className="text-amber-500 text-xs font-inter-semibold mr-0.5">
                        See All
                    </Text>
                    <ChevronRight size={13} color="#f59e0b" />
                </TouchableOpacity>
            )}
        </View>
    );
}
