import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export interface TrackParams {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    audioUrl: string;
}

interface AudioContextType {
    sound: Audio.Sound | null;
    isPlaying: boolean;
    isLoading: boolean;
    currentTrack: TrackParams | null;
    position: number;
    duration: number;
    loadAndPlayTrack: (track: TrackParams) => Promise<void>;
    playTrack: () => Promise<void>;
    pauseTrack: () => Promise<void>;
    seekTrack: (positionMillis: number) => Promise<void>;
    stopTrack: () => Promise<void>;
    clearAudio: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<TrackParams | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    // Clean up sound object when component unmounts
    useEffect(() => {
        return sound
            ? () => {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis ?? 0);
            setPosition(status.positionMillis ?? 0);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(status.durationMillis ?? 0);
            }
        } else if (status.error) {
            console.error(`Playback Error: ${status.error}`);
        }
    }, []);

    const loadAndPlayTrack = async (track: TrackParams) => {
        setIsLoading(true);
        try {
            // Unload previous sound if it exists
            if (sound) {
                await sound.unloadAsync();
            }

            // Configure audio session to play in background (if needed later)
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.audioUrl },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setCurrentTrack(track);
            setIsPlaying(true);
        } catch (e) {
            console.error("Error loading track", e);
        } finally {
            setIsLoading(false);
        }
    };

    const playTrack = async () => {
        if (sound) {
            try {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } catch (e) { console.error(e) }
        }
    };

    const pauseTrack = async () => {
        if (sound) {
            try {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                }
            } catch (e) { console.error(e) }
        }
    };

    const seekTrack = async (positionMillis: number) => {
        if (sound) {
            await sound.setPositionAsync(positionMillis);
        }
    };

    const stopTrack = async () => {
        if (sound) {
            await sound.stopAsync();
            setIsPlaying(false);
            setPosition(0);
        }
    }

    const clearAudio = async () => {
        if (sound) {
            await sound.unloadAsync();
        }
        setSound(null);
        setIsPlaying(false);
        setCurrentTrack(null);
        setPosition(0);
        setDuration(0);
    }

    return (
        <AudioContext.Provider
            value={{
                sound,
                isPlaying,
                isLoading,
                currentTrack,
                position,
                duration,
                loadAndPlayTrack,
                playTrack,
                pauseTrack,
                seekTrack,
                stopTrack,
                clearAudio
            }}
        >
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
