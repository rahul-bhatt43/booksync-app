import { Play } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import GlassContainer from './GlassContainer';

export interface Audiobook {
    id: string;
    title: string;
    author: {
        name: string;
        _id: string;
    };
    coverUrl: string;
    progress?: number; // 0 to 100
    position?: number; // exact progress in seconds
}

interface AudiobookCardProps {
    book: Audiobook;
    variant?: 'featured' | 'grid' | 'list';
    onPress?: (book: Audiobook) => void;
}

export default function AudiobookCard({
    book,
    variant = 'grid',
    onPress
}: AudiobookCardProps) {

    if (variant === 'featured') {
        return (
            <TouchableOpacity activeOpacity={0.82} onPress={() => onPress?.(book)}>
                <GlassContainer className="flex-row p-4" intensity="light">
                    <View className="relative">
                        <Image
                            source={{ uri: book.coverUrl }}
                            className="w-24 h-36 rounded-xl bg-zinc-800"
                            resizeMode="cover"
                        />
                        {/* Play overlay on cover */}
                        <View className="absolute bottom-2 right-2 w-8 h-8 bg-amber-500 rounded-full items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
                            <Play fill="#18181b" color="#18181b" size={12} style={{ marginLeft: 1 }} />
                        </View>
                    </View>
                    <View className="flex-1 ml-4 justify-center">
                        {/* Continue Listening Badge */}
                        <View className="flex-row items-center mb-2 self-start bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
                            <Text className="text-amber-400 font-inter-bold text-[10px] tracking-wider uppercase">
                                Continue Listening
                            </Text>
                        </View>
                        <Text className="text-white font-inter-bold text-lg mb-1" numberOfLines={2}>
                            {book.title}
                        </Text>
                        <Text className="text-zinc-400 font-inter-medium text-sm mb-4">
                            {book.author.name}
                        </Text>

                        {book.progress !== undefined && (
                            <View className="mt-auto">
                                <View className="h-1.5 bg-zinc-800 rounded-full w-full overflow-hidden mb-1.5">
                                    <View
                                        className="h-full bg-amber-500 rounded-full"
                                        style={{ width: `${book.progress}%` }}
                                    />
                                </View>
                                <Text className="text-zinc-500 text-xs font-inter-medium">
                                    {book.progress}% completed
                                </Text>
                            </View>
                        )}
                    </View>
                </GlassContainer>
            </TouchableOpacity>
        );
    }

    if (variant === 'list') {
        return (
            <TouchableOpacity activeOpacity={0.75} onPress={() => onPress?.(book)} className="flex-row items-center py-3 border-b border-zinc-800/60">
                <Image
                    source={{ uri: book.coverUrl }}
                    className="w-16 h-24 rounded-xl bg-zinc-800"
                    resizeMode="cover"
                />
                <View className="flex-1 ml-4">
                    <Text className="text-white font-inter-bold text-base mb-0.5" numberOfLines={1}>
                        {book.title}
                    </Text>
                    <Text className="text-zinc-400 font-inter text-sm mb-3" numberOfLines={1}>
                        {book.author.name}
                    </Text>
                    {book.progress !== undefined && (
                        <View className="flex-row items-center">
                            <View className="h-1.5 bg-zinc-800 rounded-full flex-1 overflow-hidden mr-3">
                                <View
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{ width: `${book.progress}%` }}
                                />
                            </View>
                            <Text className="text-zinc-500 text-xs font-inter-medium w-9 text-right">{book.progress}%</Text>
                        </View>
                    )}
                </View>

                {/* Play button */}
                <View className="ml-3 w-9 h-9 bg-zinc-800 rounded-full items-center justify-center border border-zinc-700/60">
                    <Play fill="#f59e0b" color="#f59e0b" size={14} style={{ marginLeft: 1 }} />
                </View>
            </TouchableOpacity>
        );
    }

    // Default: Grid
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={() => onPress?.(book)} className="w-[140px] mr-4">
            <View className="relative mb-3">
                <Image
                    source={{ uri: book.coverUrl }}
                    className="w-[140px] h-[210px] rounded-2xl bg-zinc-800"
                    resizeMode="cover"
                />
                {/* Gradient overlay at bottom for text readability */}
                <View
                    className="absolute bottom-0 left-0 right-0 h-16 rounded-b-2xl"
                />
                {/* Small play button on bottom-right of cover */}
                <View className="absolute bottom-2 right-2 w-8 h-8 bg-zinc-900/80 rounded-full border border-zinc-700/60 items-center justify-center">
                    <Play fill="#f59e0b" color="#f59e0b" size={12} style={{ marginLeft: 1 }} />
                </View>
            </View>
            <Text className="text-white font-inter-semibold text-sm mb-0.5" numberOfLines={2}>
                {book.title}
            </Text>
            <Text className="text-zinc-500 font-inter text-xs" numberOfLines={1}>
                {book.author.name}
            </Text>
        </TouchableOpacity>
    );
}
