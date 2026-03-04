import { CreatePlaylistDTO, Playlist, UpdatePlaylistDTO } from '../types/playlist';
import apiClient from './client';

const PlaylistService = {
    createPlaylist: async (data: CreatePlaylistDTO): Promise<Playlist> => {
        const response = await apiClient.post('/playlists', data);
        return response.data;
    },

    getUserPlaylists: async (): Promise<Playlist[]> => {
        const response = await apiClient.get('/playlists/user');
        return response.data;
    },

    getPlaylistById: async (id: string): Promise<Playlist> => {
        const response = await apiClient.get(`/playlists/${id}`);
        return response.data;
    },

    updatePlaylist: async (id: string, data: UpdatePlaylistDTO): Promise<Playlist> => {
        const response = await apiClient.patch(`/playlists/${id}`, data);
        return response.data;
    },

    deletePlaylist: async (id: string): Promise<void> => {
        await apiClient.delete(`/playlists/${id}`);
    },

    addAudiobookToPlaylist: async (playlistId: string, audiobookId: string): Promise<Playlist> => {
        const response = await apiClient.post(`/playlists/${playlistId}/audiobooks`, { audiobookId });
        return response.data;
    },

    removeAudiobookFromPlaylist: async (playlistId: string, audiobookId: string): Promise<Playlist> => {
        const response = await apiClient.delete(`/playlists/${playlistId}/audiobooks/${audiobookId}`);
        return response.data;
    },
};

export default PlaylistService;
