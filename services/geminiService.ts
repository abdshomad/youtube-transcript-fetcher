import { GoogleGenAI, Type } from '@google/genai';
import type { Video } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PLAYLIST_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    videos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'A unique YouTube-like video ID, e.g., "dQw4w9WgXcQ"' },
          title: { type: Type.STRING, description: 'The title of the video' },
          thumbnailUrl: { type: Type.STRING, description: 'URL for the video thumbnail (use picsum.photos/480/270 with a unique seed)' },
          channelName: { type: Type.STRING, description: 'The name of the YouTube channel' },
        },
        required: ['id', 'title', 'thumbnailUrl', 'channelName'],
      },
    },
  },
  required: ['videos'],
};

const YOUTUBE_API_SIM_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        playlistTitle: { type: Type.STRING, description: 'A plausible title for the YouTube playlist, inferred from the URL and its likely content.' },
        items: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    snippet: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'The title of the video.' },
                            channelTitle: { type: Type.STRING, description: 'The name of the YouTube channel that likely uploaded this video.' },
                            thumbnails: {
                                type: Type.OBJECT,
                                properties: {
                                    medium: {
                                        type: Type.OBJECT,
                                        properties: {
                                            url: { type: Type.STRING, description: 'URL for a 480x270 thumbnail. Use picsum.photos with a unique seed.' }
                                        },
                                        required: ['url']
                                    }
                                },
                                required: ['medium']
                            },
                            resourceId: {
                                type: Type.OBJECT,
                                properties: {
                                    videoId: { type: Type.STRING, description: 'A unique YouTube-like video ID, e.g., "dQw4w9WgXcQ".' }
                                },
                                required: ['videoId']
                            }
                        },
                        required: ['title', 'channelTitle', 'thumbnails', 'resourceId']
                    }
                },
                required: ['snippet']
            }
        }
    },
    required: ['playlistTitle', 'items']
};


export const generatePlaylistByTopic = async (playlistTopic: string): Promise<Video[]> => {
  const prompt = `Generate a realistic list of 8 YouTube videos for a playlist about "${playlistTopic}". For thumbnails, use picsum.photos URLs with a size of 480x270 and unique seeds.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: PLAYLIST_SCHEMA,
      },
    });
    
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed.videos || [];
  } catch (error) {
    console.error("Error generating playlist data by topic:", error);
    throw new Error("Failed to parse playlist data from the API.");
  }
};

export const fetchPlaylistByUrl = async (url: string): Promise<{ playlistTitle: string; videos: Video[] }> => {
    const prompt = `You are a high-fidelity YouTube API simulator. A user has provided this YouTube playlist URL: "${url}".
    Your task is to generate a JSON response that mimics the data structure of the YouTube Data API.
    Specifically, generate a plausible title for the playlist and a list of 12 realistic video "items" that would be in it.
    For video thumbnails, use picsum.photos URLs with a size of 480x270 and unique seeds for each video.
    For video IDs, generate unique YouTube-like strings.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: YOUTUBE_API_SIM_SCHEMA,
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        const videos: Video[] = (parsed.items || []).map((item: any) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.medium.url,
            channelName: item.snippet.channelTitle,
        }));

        return {
            playlistTitle: parsed.playlistTitle || 'Untitled Playlist',
            videos: videos
        };
    } catch (error) {
        console.error("Error fetching playlist data by URL:", error);
        throw new Error("Failed to parse playlist data from the API for the given URL.");
    }
}

export const generateTranscript = async (videoTitle: string): Promise<string> => {
    const prompt = `Generate a plausible, paragraph-based English transcript for a YouTube video titled "${videoTitle}". Make it about 250 words long and realistic for a tutorial or informational video. Format it into several paragraphs separated by double newlines for readability.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating transcript:", error);
        throw new Error("The AI model could not generate a transcript for this video. This might be due to a network issue or API limitations. Please try another video.");
    }
};