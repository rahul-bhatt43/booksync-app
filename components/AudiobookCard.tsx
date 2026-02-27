import { Play } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import GlassContainer from './GlassContainer';

export interface Audiobook {
    id: string;
    title: string;
    author: string;
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
            <TouchableOpacity activeOpacity={0.8} onPress={() => onPress?.(book)}>
                <GlassContainer className="flex-row p-4" intensity="light">
                    <Image
                        source={{ uri: book.coverUrl }}
                        className="w-24 h-36 rounded-xl bg-zinc-800"
                        resizeMode="cover"
                    />
                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-amber-500 font-inter-medium text-xs mb-1 tracking-wider uppercase">
                            Continue Listening
                        </Text>
                        <Text className="text-white font-inter-bold text-xl mb-1 numberOfLines={2}">
                            {book.title}
                        </Text>
                        <Text className="text-zinc-400 font-inter-medium text-sm mb-4">
                            {book.author}
                        </Text>

                        {book.progress !== undefined && (
                            <View className="flex-row items-center mt-auto">
                                <TouchableOpacity className="w-10 h-10 bg-amber-500 rounded-full items-center justify-center mr-3 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                    <Play fill="#18181b" color="#18181b" size={18} className="ml-1" />
                                </TouchableOpacity>
                                <View className="flex-1">
                                    <View className="h-1.5 bg-zinc-800 rounded-full w-full overflow-hidden">
                                        <View
                                            className="h-full bg-amber-500 rounded-full"
                                            style={{ width: `${book.progress}%` }}
                                        />
                                    </View>
                                    <Text className="text-zinc-500 text-xs mt-1 font-inter-medium">
                                        {book.progress}% completed
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </GlassContainer>
            </TouchableOpacity>
        );
    }

    if (variant === 'list') {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(book)} className="flex-row items-center mb-4">
                <Image
                    source={{ uri: book.coverUrl }}
                    className="w-16 h-24 rounded-lg bg-zinc-800"
                    resizeMode="cover"
                />
                <View className="flex-1 ml-4">
                    <Text className="text-white font-inter-bold text-base mb-1" numberOfLines={1}>
                        {book.title}
                    </Text>
                    <Text className="text-zinc-400 font-inter text-sm mb-2" numberOfLines={1}>
                        {book.author}
                    </Text>
                    {book.progress !== undefined && (
                        <View className="flex-row items-center">
                            <View className="h-1 bg-zinc-800 rounded-full flex-1 overflow-hidden mr-3">
                                <View
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{ width: `${book.progress}%` }}
                                />
                            </View>
                            <Text className="text-zinc-500 text-xs font-inter-medium">{book.progress}%</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }

    // Default: Grid
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(book)} className="w-[140px] mr-4">
            <Image
                source={{ uri: book.coverUrl }}
                className="w-[140px] h-[210px] rounded-2xl bg-zinc-800 mb-3"
                resizeMode="cover"
            />
            <Text className="text-white font-inter-semibold text-sm mb-1" numberOfLines={2}>
                {book.title}
            </Text>
            <Text className="text-zinc-400 font-inter text-xs" numberOfLines={1}>
                {book.author}
            </Text>
        </TouchableOpacity>
    );
}
