import { GoogleGenAI, Type } from '@google/genai';

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

export const extractKeyTopics = async (transcript: string): Promise<string[]> => {
    const prompt = `Extract the key topics and main concepts from the following transcript. Focus on specific terms, technologies, or ideas discussed. Provide between 5 and 10 topics. Return them as a JSON array of strings.

Transcript:
---
${transcript}
---

Key Topics (as JSON array):`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: 'A key topic or concept from the transcript.'
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const topics = JSON.parse(jsonText);
        
        return Array.isArray(topics) ? topics : [];
    } catch (error) {
        console.error("Error extracting key topics:", error);
        throw new Error("The AI model could not extract topics. This might be due to a network issue or API limitations.");
    }
};