import type { Video } from '../types';

const API_KEY = process.env.API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_PLAYLIST_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/;

// Helper to handle API responses
const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(message);
    }
    return response.json();
};

// Fetches playlist items
const getPlaylistItems = async (playlistId: string): Promise<Video[]> => {
    const url = `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await handleApiResponse(response);
    
    return (data.items || []).map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || 'https://picsum.photos/480/270',
        channelName: item.snippet.channelTitle,
    })).filter((video: Video) => video.title !== 'Private video' && video.title !== 'Deleted video');
};

// Fetches playlist details (like title)
const getPlaylistDetails = async (playlistId: string): Promise<{ title: string }> => {
    const url = `${YOUTUBE_API_BASE_URL}/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await handleApiResponse(response);

    if (!data.items || data.items.length === 0) {
        throw new Error('Playlist not found.');
    }
    return { title: data.items[0].snippet.title };
};

// Searches for a playlist by a topic
const searchForPlaylist = async (topic: string): Promise<string | null> => {
    const url = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(topic)}&type=playlist&maxResults=1&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await handleApiResponse(response);

    if (data.items && data.items.length > 0) {
        return data.items[0].id.playlistId;
    }
    return null;
};


export const fetchYouTubePlaylist = async (input: string): Promise<{ playlistTitle: string; videos: Video[] }> => {
    let playlistId: string | null = null;

    // Check if input is a playlist URL
    const urlMatch = input.match(YOUTUBE_PLAYLIST_URL_REGEX);

    if (urlMatch && urlMatch[1]) {
        playlistId = urlMatch[1];
    } else {
        // Otherwise, treat it as a search topic
        playlistId = await searchForPlaylist(input);
    }

    if (!playlistId) {
        throw new Error(`Could not find a playlist for "${input}".`);
    }
    
    // Fetch details and items in parallel for efficiency
    const [details, videos] = await Promise.all([
        getPlaylistDetails(playlistId),
        getPlaylistItems(playlistId)
    ]);

    if (videos.length === 0) {
        // Use the fetched title in the error message for clarity
        throw new Error(`The playlist "${details.title}" appears to be empty or private.`);
    }

    return { playlistTitle: details.title, videos };
};
