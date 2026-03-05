import apiClient from '@/api/client';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import CommentsDrawer from '@/components/CommentsDrawer';
import DetailsDrawer from '@/components/DetailsDrawer';
import Skeleton from '@/components/Skeleton';
import { useAudio } from '@/contexts/AudioContext';
import DownloadService from '@/services/DownloadService';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import NetInfo from '@react-native-community/netinfo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ChevronDown, Clock, Download, Heart, Info, ListPlus, MessageCircle, Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Dummy data map removed as we use API data now

const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} `;
};

export default function PlayerScreen() {
    const { id, position: initialPositionParam } = useLocalSearchParams();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const {
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        loadAndPlayTrack,
        position,
        duration,
        seekTrack,
        playbackRate,
        setPlaybackRate,
        sleepTimerRemaining,
        setSleepTimer
    } = useAudio();

    const bookId = typeof id === 'string' ? id : '';

    const [bookData, setBookData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const commentsDrawerRef = useRef<BottomSheetModal>(null);
    const detailsDrawerRef = useRef<BottomSheetModal>(null);
    const addToPlaylistModalRef = useRef<BottomSheetModal>(null);

    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const initialPositionSec = Number(initialPositionParam) || 0;

    const fetchAudiobook = async () => {
        if (!bookId) return;

        // 1. Check if book is downloaded first
        const downloadedBook = await DownloadService.getDownloadedBook(bookId);
        if (downloadedBook) {
            console.log('Using local metadata for offline-ready book:', bookId);
            const localData = {
                _id: downloadedBook.id,
                title: downloadedBook.title,
                authorId: downloadedBook.author,
                coverImageUrl: downloadedBook.localCoverUri,
                audioUrl: downloadedBook.localAudioUri,
                description: downloadedBook.description,
                isOffline: true
            };
            setBookData(localData);
            setIsDownloaded(true);
            setLoading(false);

            // Load and play from local
            if (!currentTrack || currentTrack.id !== bookId) {
                loadAndPlayTrack({
                    id: downloadedBook.id,
                    title: downloadedBook.title,
                    author: downloadedBook.author as any,
                    coverUrl: downloadedBook.localCoverUri,
                    audioUrl: downloadedBook.localAudioUri
                }, initialPositionSec * 1000);
            }
            return;
        }

        // 2. If not downloaded, check connectivity
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            Alert.alert('Offline', 'This book is not available offline. Please connect to the internet.');
            setLoading(false);
            router.back();
            return;
        }

        try {
            const response = await apiClient.get(`/audiobooks/${bookId}`);
            const data = response.data.data;
            setBookData(data);
            setIsLiked(!!data.isLikedByUser);

            // Prefer API-returned progress over params, default to 0
            const resumePositionMillis = (data.progressInSeconds ?? initialPositionSec) * 1000;

            // Also load and play if not currently playing this track
            if (!currentTrack || currentTrack.id !== bookId) {
                loadAndPlayTrack({
                    id: data._id,
                    title: data.title,
                    author: data.authorId,
                    coverUrl: data.coverImageUrl,
                    audioUrl: data.audioUrl
                }, resumePositionMillis);
            }
        } catch (error) {
            console.error('Error fetching audiobook', error);
        } finally {
            setLoading(false);
        }
    };

    const checkDownloadStatus = async () => {
        const downloaded = await DownloadService.isBookDownloaded(bookId);
        setIsDownloaded(downloaded);
    };

    useEffect(() => {
        fetchAudiobook();
        checkDownloadStatus();
    }, [bookId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAudiobook();
        setRefreshing(false);
    }, [bookId]);

    const handleToggleLike = async () => {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
            Alert.alert('Offline', 'You need an internet connection to like audiobooks.');
            return;
        }
        try {
            await apiClient.post(`/interactions/audiobooks/${bookId}/like`);
            setIsLiked(!isLiked);
            setBookData((prev: any) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    likesCount: isLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1
                };
            });
        } catch (error) {
            console.error('Error toggling like', error);
        }
    };

    const handleOpenComments = () => {
        commentsDrawerRef.current?.present();
    };

    const handleOpenDetails = () => {
        detailsDrawerRef.current?.present();
    };

    const handleOpenAddToPlaylist = () => {
        addToPlaylistModalRef.current?.present();
    };

    const handleCommentAdded = () => {
        setBookData((prev: any) => {
            if (!prev) return prev;
            return {
                ...prev,
                commentsCount: (prev.commentsCount || 0) + 1
            };
        });
    };

    const handleCommentDeleted = () => {
        setBookData((prev: any) => {
            if (!prev) return prev;
            return {
                ...prev,
                commentsCount: Math.max(0, (prev.commentsCount || 0) - 1)
            };
        });
    };

    const handleDownload = async () => {
        if (isDownloaded) {
            Alert.alert(
                'Remove Download',
                'Are you sure you want to remove this audiobook from your downloads?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: async () => {
                            await DownloadService.removeDownloadedBook(bookId);
                            setIsDownloaded(false);
                            Alert.alert('Removed', 'Audiobook removed from local storage.');
                        }
                    }
                ]
            );
            return;
        }

        if (!bookData) return;

        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            const result = await DownloadService.downloadBook(
                {
                    id: bookId,
                    title: bookData.title,
                    author: bookData.authorId,
                    audioUrl: bookData.audioUrl,
                    coverUrl: bookData.coverImageUrl,
                    description: bookData.description
                },
                (progress) => setDownloadProgress(progress)
            );

            if (result) {
                setIsDownloaded(true);
                Alert.alert('Success', 'Audiobook downloaded for offline listening!');
            } else {
                Alert.alert('Download Failed', 'Could not download the audiobook. Please try again.');
            }
        } catch (err) {
            console.error('Download error:', err);
            Alert.alert('Error', 'An unexpected error occurred during download.');
        } finally {
            setIsDownloading(false);
        }
    };

    // The book displaying on screen
    const displayBook = currentTrack?.id === bookId ? currentTrack : (bookData ? {
        id: bookData._id,
        title: bookData.title,
        author: bookData.authorId,
        coverUrl: bookData.coverImageUrl,
        audioUrl: bookData.audioUrl
    } : null);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for the exit animations (300ms) to finish before the router actually unmounts the screen
        setTimeout(() => {
            router.back();
        }, 300);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            if (!currentTrack || currentTrack.id !== bookId) {
                if (displayBook) {
                    const resumePositionMillis = ((bookData?.progressInSeconds) ?? initialPositionSec) * 1000;
                    loadAndPlayTrack(displayBook as any, resumePositionMillis);
                }
            } else {
                playTrack();
            }
        }
    };

    const handleSeekBack = () => {
        seekTrack(Math.max(0, position - 15000));
    };

    const handleSeekForward = () => {
        seekTrack(Math.min(duration, position + 15000));
    };

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    const handleSpeedChange = () => {
        const nextSpeed = playbackRate === 1.0 ? 1.25 : playbackRate === 1.25 ? 1.5 : playbackRate === 1.5 ? 2.0 : 1.0;
        setPlaybackRate(nextSpeed);
    };

    const handleSleepTimerPress = () => {
        if (sleepTimerRemaining === null) {
            setSleepTimer(1); // 1 minute for testing
        } else if (sleepTimerRemaining <= 1 * 60) {
            setSleepTimer(15);
        } else if (sleepTimerRemaining <= 15 * 60) {
            setSleepTimer(30);
        } else if (sleepTimerRemaining <= 30 * 60) {
            setSleepTimer(45);
        } else if (sleepTimerRemaining <= 45 * 60) {
            setSleepTimer(60);
        } else {
            setSleepTimer(null);
        }
    };

    const formatSleepTimer = (seconds: number | null) => {
        if (seconds === null) return 'Sleep';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <View className="flex-1 pb-20 justify-between">
                {isVisible && (
                    <>
                        {/* Dynamic Ambient Background Blur */}
                        <Animated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)} className="absolute top-0 left-0 right-0 h-96 bg-amber-900/20" />

                        {/* Darker overlay to ensure text contrast */}
                        <Animated.View entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)} className="absolute top-0 left-0 right-0 bottom-0 bg-zinc-950/60" pointerEvents="none" />

                        {/* Header */}
                        <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutDown.duration(300)} className="px-6 pt-2 pb-6 flex-row justify-between items-center z-10">
                            <TouchableOpacity onPress={handleClose} className="p-3 -ml-3" activeOpacity={0.7}>
                                <ChevronDown size={32} color="#f4f4f5" />
                            </TouchableOpacity>
                            <Text className="text-zinc-400 font-inter-semibold text-xs tracking-widest uppercase">Now Playing</Text>
                            <View className="flex-row">
                                <TouchableOpacity className="p-3 flex-row items-center" activeOpacity={0.7} onPress={handleToggleLike}>
                                    <Heart size={24} color={isLiked ? "#ef4444" : "#f4f4f5"} fill={isLiked ? "#ef4444" : "transparent"} />
                                    <Text className="text-zinc-400 font-inter-medium text-xs ml-1.5">{bookData?.likesCount || 0}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="p-3 -mr-3 flex-row items-center" activeOpacity={0.7} onPress={handleOpenComments}>
                                    <MessageCircle size={24} color="#f4f4f5" />
                                    <Text className="text-zinc-400 font-inter-medium text-xs ml-1.5">{bookData?.commentsCount || 0}</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {loading || !displayBook ? (
                            <View className="flex-1 px-10 pt-4">
                                {/* Cover Art Skeleton */}
                                <View className="items-center mt-2 mb-10">
                                    <Skeleton width={width * 0.75} height={width * 0.75} borderRadius={24} />
                                </View>
                                {/* Info Skeleton */}
                                <View className="items-center mb-8 px-4">
                                    <Skeleton width="80%" height={36} className="mb-3" />
                                    <Skeleton width="50%" height={24} />
                                </View>
                                {/* Scrubber Skeleton */}
                                <View className="mb-10 w-full">
                                    <Skeleton width="100%" height={8} borderRadius={4} className="mb-2" />
                                    <View className="flex-row justify-between">
                                        <Skeleton width={32} height={12} />
                                        <Skeleton width={32} height={12} />
                                    </View>
                                </View>
                                {/* Controls Skeleton */}
                                <View className="flex-row justify-between items-center mb-12">
                                    <Skeleton width={64} height={64} borderRadius={32} />
                                    <Skeleton width={96} height={96} borderRadius={48} />
                                    <Skeleton width={64} height={64} borderRadius={32} />
                                </View>
                            </View>
                        ) : (
                            <>
                                {/* Content Wrapper (Flex to fill remaining space minus absolute bottom bar) */}
                                <View className="flex-1 justify-center pb-2">
                                    {/* Cover Art */}
                                    <Animated.View entering={SlideInDown.duration(600).springify()} exiting={SlideOutDown.duration(300)} className="flex-1 items-center justify-center px-10 mb-4 shadow-[0_30px_60px_rgba(245,158,11,0.2)]">
                                        <Image
                                            source={{ uri: displayBook.coverUrl }}
                                            className="w-full h-full max-w-[280px] rounded-3xl bg-zinc-800 border border-zinc-800/50"
                                            resizeMode="contain"
                                            style={{ aspectRatio: 3 / 4 }}
                                        />
                                    </Animated.View>

                                    {/* Book Info */}
                                    <Animated.View entering={FadeInDown.delay(100).duration(600)} exiting={FadeOutDown.duration(300)} className="px-8 items-center mb-4 mt-auto">
                                        <Text className="text-white font-inter-bold text-2xl mb-1 text-center" numberOfLines={2}>
                                            {displayBook.title}
                                        </Text>

                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                const authorId = bookData?.authorId?._id || displayBook.author._id;
                                                const authorName = bookData?.authorId?.name || displayBook.author.name;
                                                if (authorId) {
                                                    handleClose();
                                                    setTimeout(() => router.push(`/collection?type=author&id=${authorId}&name=${encodeURIComponent(authorName)}`), 300);
                                                }
                                            }}
                                        >
                                            <Text className="text-amber-500 font-inter-medium text-base mb-1">
                                                {bookData?.authorId?.name || displayBook.author.name}
                                            </Text>
                                        </TouchableOpacity>

                                        {bookData?.narratorId?.name && (
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    handleClose();
                                                    setTimeout(() => router.push(`/collection?type=narrator&id=${bookData.narratorId._id}&name=${encodeURIComponent(bookData.narratorId.name)}`), 300);
                                                }}
                                            >
                                                <Text className="text-zinc-400 font-inter-medium text-xs mb-2">
                                                    Narrated by <Text className="text-zinc-300 font-inter-semibold">{bookData.narratorId.name}</Text>
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {bookData?.categoryId?.name && (
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                className="bg-zinc-800/60 px-3 py-1 rounded-full border border-zinc-700/50 mt-1"
                                                onPress={() => {
                                                    handleClose();
                                                    setTimeout(() => router.push(`/collection?type=category&id=${bookData.categoryId._id}&name=${encodeURIComponent(bookData.categoryId.name)}`), 300);
                                                }}
                                            >
                                                <Text className="text-zinc-300 font-inter-medium text-[10px] tracking-wide">
                                                    {bookData.categoryId.name}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </Animated.View>

                                    {/* Progress Scrubber */}
                                    <Animated.View entering={FadeInDown.delay(200).duration(600)} exiting={FadeOutDown.duration(300)} className="px-8 mb-3 w-full">
                                        {/* Scrubber Line container with larger touch area */}
                                        <View className="py-2 justify-center mb-1">
                                            <View className="h-2 bg-zinc-800 rounded-full w-full">
                                                <View className="h-full bg-amber-500 rounded-full relative" style={{ width: `${progressPercent}%` }}>
                                                    {/* Larger handle for better touch ergonomics */}
                                                    <View className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white rounded-full shadow-md items-center justify-center">
                                                        <View className="w-2 h-2 rounded-full bg-amber-500" />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Timestamps */}
                                        <View className="flex-row justify-between w-full mt-1">
                                            <Text className="text-zinc-400 font-inter-medium text-xs">
                                                {formatTime(position)}
                                            </Text>
                                            <Text className="text-zinc-400 font-inter-medium text-xs">
                                                -{formatTime(Math.max(0, duration - position))}
                                            </Text>
                                        </View>
                                    </Animated.View>

                                    {/* Main Controls */}
                                    <Animated.View entering={FadeInDown.delay(300).duration(600)} exiting={FadeOutDown.duration(300)} className="px-10 flex-row justify-between items-center">
                                        <TouchableOpacity onPress={handleSeekBack} className="items-center justify-center relative w-[60px] h-[60px] rounded-full bg-zinc-800/40 active:bg-zinc-800/80 transition-colors">
                                            <RotateCcw size={28} color="#e4e4e7" strokeWidth={1.5} />
                                            <Text className="absolute text-zinc-300 font-inter-bold text-[9px] mt-1">15</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="w-[80px] h-[80px] rounded-full bg-amber-500 items-center justify-center shadow-[0_10px_40px_rgba(245,158,11,0.4)]"
                                            activeOpacity={0.8}
                                            onPress={handlePlayPause}
                                        >
                                            {isPlaying ? (
                                                <Pause size={36} color="#18181b" fill="#18181b" />
                                            ) : (
                                                <Play size={36} color="#18181b" fill="#18181b" className="ml-1.5" />
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={handleSeekForward} className="items-center justify-center relative w-[60px] h-[60px] rounded-full bg-zinc-800/40 active:bg-zinc-800/80 transition-colors">
                                            <RotateCw size={28} color="#e4e4e7" strokeWidth={1.5} />
                                            <Text className="absolute text-zinc-300 font-inter-bold text-[9px] mt-1">15</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>

                                {/* Secondary Controls - Bottom Navigation Style */}
                                <Animated.View entering={FadeInDown.delay(400).duration(800)} exiting={FadeOutDown.duration(300)} className="flex-row items-center border-t border-zinc-800/80 bg-zinc-900/50 absolute bottom-0 left-0 right-0 h-20 px-8 pb-0 justify-between rounded-t-3xl">
                                    <TouchableOpacity
                                        className="flex-1 items-center justify-center p-2 opacity-80 active:opacity-100"
                                        onPress={handleSpeedChange}
                                    >
                                        <Text className="text-white font-inter-bold text-lg mb-1">{playbackRate}x</Text>
                                        {/* <Text className="text-zinc-500 font-inter-medium text-[10px] uppercase tracking-wider">Speed</Text> */}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1 items-center justify-center p-2 opacity-80 active:opacity-100 border-x border-zinc-800/50"
                                        onPress={handleOpenDetails}
                                    >
                                        <Info size={26} color="#f4f4f5" className="mb-1.5" />
                                        {/* <Text className="text-zinc-500 font-inter-medium text-[10px] uppercase tracking-wider">Details</Text> */}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1 items-center justify-center p-2 opacity-80 active:opacity-100"
                                        onPress={handleOpenAddToPlaylist}
                                    >
                                        <ListPlus size={26} color="#f4f4f5" className="mb-1.5" />
                                        {/* <Text className="text-zinc-500 font-inter-medium text-[10px] uppercase tracking-wider">Add To</Text> */}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1 items-center justify-center p-2 opacity-80 active:opacity-100"
                                        onPress={handleDownload}
                                        disabled={isDownloading}
                                    >
                                        <View className="relative mb-1.5">
                                            {isDownloading ? (
                                                <View className="items-center justify-center">
                                                    <View className="w-7 h-7 rounded-full border-2 border-zinc-700 items-center justify-center">
                                                        <View
                                                            className="w-7 h-7 rounded-full border-2 border-amber-500 absolute"
                                                            style={{
                                                                borderTopColor: 'transparent',
                                                                borderRightColor: 'transparent',
                                                                transform: [{ rotate: `${downloadProgress * 360}deg` }]
                                                            }}
                                                        />
                                                        <Text className="text-[8px] text-amber-500 font-inter-bold">
                                                            {Math.round(downloadProgress * 100)}%
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : isDownloaded ? (
                                                <CheckCircle size={26} color="#f59e0b" />
                                            ) : (
                                                <Download size={26} color="#f4f4f5" />
                                            )}
                                        </View>
                                        {/* <Text className={`font-inter-medium text-[10px] uppercase tracking-wider ${isDownloaded || isDownloading ? 'text-amber-500' : 'text-zinc-500'}`}>
                                            {isDownloading ? 'Downloading' : isDownloaded ? 'Downloaded' : 'Download'}
                                        </Text> */}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1 items-center justify-center p-2 opacity-80 active:opacity-100"
                                        onPress={handleSleepTimerPress}
                                    >
                                        <Clock size={26} color={sleepTimerRemaining ? "#f59e0b" : "#f4f4f5"} className="mb-1.5" />
                                        <Text className={`font-inter-medium text-[10px] uppercase tracking-wider ${sleepTimerRemaining ? 'text-amber-500' : 'text-zinc-500'}`}>
                                            {formatSleepTimer(sleepTimerRemaining)}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </>
                        )}
                    </>
                )}
            </View>

            {/* Render Bottom Sheet Modal locally */}
            <CommentsDrawer
                ref={commentsDrawerRef}
                bookId={bookId}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
            />
            <DetailsDrawer ref={detailsDrawerRef} bookData={bookData} />
            <AddToPlaylistModal ref={addToPlaylistModalRef} bookId={bookId} />
        </SafeAreaView>
    );
}
