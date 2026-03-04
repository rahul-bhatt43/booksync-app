import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;
const METADATA_KEY = 'offline_downloads_metadata';

export interface DownloadedBook {
    id: string;
    title: string;
    author: string | { _id: string; name: string };
    localAudioUri: string;
    localCoverUri: string;
    remoteAudioUrl: string;
    remoteCoverUrl: string;
    description?: string;
    downloadedAt: number;
}

class DownloadService {
    private async ensureDownloadDir() {
        const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
        }
    }

    private async getMetadata(): Promise<DownloadedBook[]> {
        try {
            const data = await AsyncStorage.getItem(METADATA_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading download metadata:', error);
            return [];
        }
    }

    private async saveMetadata(metadata: DownloadedBook[]) {
        try {
            await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
        } catch (error) {
            console.error('Error saving download metadata:', error);
        }
    }

    async downloadBook(
        book: { id: string; title: string; author: any; audioUrl: string; coverUrl: string; description?: string },
        onProgress?: (progress: number) => void
    ): Promise<DownloadedBook | null> {
        await this.ensureDownloadDir();
        const bookDir = `${DOWNLOAD_DIR}${book.id}/`;

        // Create book-specific directory
        await FileSystem.makeDirectoryAsync(bookDir, { intermediates: true });

        const localAudioUri = `${bookDir}audio.mp3`;
        const localCoverUri = `${bookDir}cover.jpg`;

        try {
            // 1. Download Cover Image (usually small, don't track progress separately)
            await FileSystem.downloadAsync(book.coverUrl, localCoverUri);

            // 2. Download Audio File with progress
            const downloadResumable = FileSystem.createDownloadResumable(
                book.audioUrl,
                localAudioUri,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    if (onProgress) onProgress(progress);
                }
            );

            const result = await downloadResumable.downloadAsync();
            if (!result) throw new Error('Download failed');

            const downloadedBook: DownloadedBook = {
                id: book.id,
                title: book.title,
                author: book.author,
                localAudioUri,
                localCoverUri,
                remoteAudioUrl: book.audioUrl,
                remoteCoverUrl: book.coverUrl,
                description: book.description,
                downloadedAt: Date.now(),
            };

            const metadata = await this.getMetadata();
            // Replace if already exists
            const filteredMetadata = metadata.filter(b => b.id !== book.id);
            await this.saveMetadata([...filteredMetadata, downloadedBook]);

            return downloadedBook;
        } catch (error) {
            console.error(`Error downloading book ${book.id}:`, error);
            // Cleanup on failure
            await FileSystem.deleteAsync(bookDir, { idempotent: true });
            return null;
        }
    }

    async getDownloadedBooks(): Promise<DownloadedBook[]> {
        return await this.getMetadata();
    }

    async isBookDownloaded(bookId: string): Promise<boolean> {
        const metadata = await this.getMetadata();
        return metadata.some(b => b.id === bookId);
    }

    async getDownloadedBook(bookId: string): Promise<DownloadedBook | undefined> {
        const metadata = await this.getMetadata();
        return metadata.find(b => b.id === bookId);
    }

    async removeDownloadedBook(bookId: string) {
        try {
            const bookDir = `${DOWNLOAD_DIR}${bookId}/`;
            await FileSystem.deleteAsync(bookDir, { idempotent: true });

            const metadata = await this.getMetadata();
            const updatedMetadata = metadata.filter(b => b.id !== bookId);
            await this.saveMetadata(updatedMetadata);
            return true;
        } catch (error) {
            console.error(`Error removing book ${bookId}:`, error);
            return false;
        }
    }
}

export default new DownloadService();
