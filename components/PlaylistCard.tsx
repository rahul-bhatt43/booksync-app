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
            className="flex-row items-center py-4 border-b border-border/60"
        >
            <View className="w-14 h-14 bg-secondary rounded-xl items-center justify-center border border-border">
                <ListMusic color="hsl(20.5 90.2% 48.2%)" size={24} />
            </View>

            <View className="flex-1 ml-4">
                <Text className="text-foreground font-inter-bold text-base mb-1" numberOfLines={1}>
                    {playlist.name}
                </Text>
                <Text className="text-muted-foreground/60 font-inter text-sm" numberOfLines={1}>
                    {bookCount} {bookCount === 1 ? 'Audiobook' : 'Audiobooks'} • {playlist.isPublic ? 'Public' : 'Private'}
                </Text>
            </View>

            <ChevronRight color="hsl(24 5.4% 63.9%)" size={20} />
        </TouchableOpacity>
    );
}
