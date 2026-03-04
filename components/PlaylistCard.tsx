import { ChevronRight, ListMusic } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Playlist } from '../types/playlist';

interface PlaylistCardProps {
    playlist: Playlist;
    onPress?: (playlist: Playlist) => void;
}

export default function PlaylistCard({ playlist, onPress }: PlaylistCardProps) {
    const bookCount = playlist.audiobooks.length;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPress?.(playlist)}
            className="flex-row items-center py-4 border-b border-zinc-800/60"
        >
            <View className="w-14 h-14 bg-zinc-900 rounded-xl items-center justify-center border border-zinc-800">
                <ListMusic color="#f59e0b" size={24} />
            </View>

            <View className="flex-1 ml-4">
                <Text className="text-white font-inter-bold text-base mb-1" numberOfLines={1}>
                    {playlist.name}
                </Text>
                <Text className="text-zinc-500 font-inter text-sm" numberOfLines={1}>
                    {bookCount} {bookCount === 1 ? 'Audiobook' : 'Audiobooks'} • {playlist.isPublic ? 'Public' : 'Private'}
                </Text>
            </View>

            <ChevronRight color="#3f3f46" size={20} />
        </TouchableOpacity>
    );
}
