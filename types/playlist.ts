
export interface Audiobook {
    _id: string;
    title: string;
    authorId: string | { name: string; _id: string }; // Author can be populated
    narratorId?: string | { name: string; _id: string };
    description: string;
    categoryId: string;
    audioUrl: string;
    audioPublicId: string;
    coverImageUrl: string;
    coverImagePublicId: string;
    durationInSeconds: number;
    averageRating: number;
    reviewsCount: number;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Playlist {
    _id: string;
    name: string;
    description: string;
    userId: string;
    audiobooks: string[] | Audiobook[]; // Can be IDs or populated Audiobooks
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface CreatePlaylistDTO {
    name: string;
    description?: string;
    isPublic?: boolean;
}

export interface UpdatePlaylistDTO {
    name?: string;
    description?: string;
    isPublic?: boolean;
}
