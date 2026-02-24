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
        <View className={`flex-row justify-between items-end mb-4 px-1 ${className}`}>
            <Text className="text-white text-xl font-inter-bold tracking-tight">
                {title}
            </Text>

            {showSeeAll && (
                <TouchableOpacity
                    className="flex-row items-center"
                    onPress={onPressSeeAll}
                    activeOpacity={0.7}
                >
                    <Text className="text-amber-500 text-sm font-inter-semibold mr-1">
                        See All
                    </Text>
                    <ChevronRight size={16} color="#f59e0b" />
                </TouchableOpacity>
            )}
        </View>
    );
}
