import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTranscript = async (videoTitle: string, language: string = 'English'): Promise<string> => {
    const prompt = `Generate a plausible, paragraph-based transcript in ${language} for a YouTube video titled "${videoTitle}". Make it about 250 words long and realistic for a tutorial or informational video. Format it into several paragraphs separated by double newlines for readability.`;

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

export const generateSummary = async (transcript: string): Promise<string> => {
    const prompt = `Please provide a concise, bullet-point summary of the following transcript. Focus on the key topics and main conclusions.

Transcript:
---
${transcript}
---

Summary:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("The AI model could not generate a summary. This might be due to a network issue or API limitations.");
    }
};