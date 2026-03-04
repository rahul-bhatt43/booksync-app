import DownloadService from '@/services/DownloadService';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import apiClient from '../api/client';

export interface TrackParams {
    id: string;
    title: string;
    author: {
        name: string;
        _id: string;
    };
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
    playbackRate: number;
    sleepTimerRemaining: number | null;
    setPlaybackRate: (rate: number) => Promise<void>;
    setSleepTimer: (minutes: number | null) => void;
    loadAndPlayTrack: (track: TrackParams, initialPositionMillis?: number) => Promise<void>;
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
    const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
    const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

    // Use refs for latest state values needed in callbacks without triggering re-creation
    const positionRef = useRef(0);
    const durationRef = useRef(0);
    const isPlayingRef = useRef(false);
    const currentTrackRef = useRef<TrackParams | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        positionRef.current = position;
        durationRef.current = duration;
        isPlayingRef.current = isPlaying;
        currentTrackRef.current = currentTrack;
        soundRef.current = sound;
    }, [position, duration, isPlaying, currentTrack, sound]);

    useEffect(() => {
        return () => {
            if (sleepTimerRef.current) {
                clearInterval(sleepTimerRef.current);
            }
        };
    }, []);

    const syncHistory = async (forceCompleted = false) => {
        const track = currentTrackRef.current;
        if (!track) return;
        try {
            const progressInSeconds = Math.floor(positionRef.current / 1000);
            const isCompleted = forceCompleted || (durationRef.current > 0 && positionRef.current >= durationRef.current - 1000);
            await apiClient.post('/history/update', {
                audiobookId: track.id,
                progressInSeconds,
                isCompleted
            });
        } catch (error) {
            console.error('Error syncing history', error);
        }
    };

    // Clean up sound object when component unmounts
    useEffect(() => {
        return () => {
            if (sound) {
                console.log('Unloading Sound');
                if (isPlayingRef.current || positionRef.current > 0) {
                    syncHistory().catch(console.error);
                }
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis ?? 0);
            setPosition(status.positionMillis ?? 0);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(status.durationMillis ?? 0);
                syncHistory(true);
            }
        } else if (status.error) {
            console.error(`Playback Error: ${status.error}`);
        }
    }, []);

    const loadAndPlayTrack = async (track: TrackParams, initialPositionMillis?: number) => {
        setIsLoading(true);
        try {
            // Unload previous sound if it exists
            if (sound) {
                if (isPlayingRef.current || positionRef.current > 0) {
                    await syncHistory();
                }
                await sound.unloadAsync();
            }

            // Configure audio session to play in background
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            // Check if book is downloaded
            let audioUri = track.audioUrl;
            try {
                const downloadedBook = await DownloadService.getDownloadedBook(track.id);
                if (downloadedBook) {
                    console.log('Using local audio for track:', track.id);
                    audioUri = downloadedBook.localAudioUri;
                }
            } catch (err) {
                console.error('Error checking local files:', err);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                {
                    shouldPlay: true,
                    positionMillis: initialPositionMillis || 0,
                    rate: playbackRate,
                    shouldCorrectPitch: true
                },
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

    const setPlaybackRate = async (rate: number) => {
        if (sound) {
            await sound.setRateAsync(rate, true);
        }
        setPlaybackRateState(rate);
    };

    const setSleepTimer = (minutes: number | null) => {
        if (sleepTimerRef.current) {
            clearInterval(sleepTimerRef.current);
            sleepTimerRef.current = null;
        }

        if (minutes === null) {
            setSleepTimerRemaining(null);
            return;
        }

        let secondsRemaining = minutes * 60;
        setSleepTimerRemaining(secondsRemaining);

        sleepTimerRef.current = setInterval(async () => {
            secondsRemaining -= 1;
            setSleepTimerRemaining(secondsRemaining);

            if (secondsRemaining <= 0) {
                if (sleepTimerRef.current) {
                    clearInterval(sleepTimerRef.current);
                    sleepTimerRef.current = null;
                }
                setSleepTimerRemaining(null);

                if (soundRef.current) {
                    try {
                        const status = await soundRef.current.getStatusAsync();
                        if (status.isLoaded) {
                            await soundRef.current.pauseAsync();
                            setIsPlaying(false);
                            await syncHistory();
                        }
                    } catch (e) {
                        console.error("Error in sleep timer", e);
                    }
                }
            }
        }, 1000);
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
                    await syncHistory();
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
            await syncHistory();
            setPosition(0);
        }
    }

    const clearAudio = async () => {
        if (sound) {
            if (isPlayingRef.current || positionRef.current > 0) {
                await syncHistory();
            }
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
                playbackRate,
                sleepTimerRemaining,
                setPlaybackRate,
                setSleepTimer,
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
