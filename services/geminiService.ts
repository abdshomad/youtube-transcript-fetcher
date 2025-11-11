
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
          thumbnailUrl: { type: Type.STRING, description: 'URL for the video thumbnail (use picsum.photos/480/270)' },
          channelName: { type: Type.STRING, description: 'The name of the YouTube channel' },
        },
        required: ['id', 'title', 'thumbnailUrl', 'channelName'],
      },
    },
  },
  required: ['videos'],
};


export const generatePlaylistData = async (playlistTopic: string): Promise<Video[]> => {
  const prompt = `Generate a realistic list of 8 YouTube videos for a playlist about "${playlistTopic}". For thumbnails, use picsum.photos URLs with a size of 480x270.`;

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
    console.error("Error generating playlist data:", error);
    throw new Error("Failed to parse playlist data from the API.");
  }
};

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
