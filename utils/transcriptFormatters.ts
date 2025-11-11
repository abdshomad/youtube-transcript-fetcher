const WORDS_PER_MINUTE = 150;

const formatTimestamp = (totalSeconds: number, format: 'srt' | 'vtt'): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);

    const padded = (num: number, length: number = 2) => num.toString().padStart(length, '0');

    const separator = format === 'srt' ? ',' : '.';
    
    return `${padded(hours)}:${padded(minutes)}:${padded(seconds)}${separator}${padded(milliseconds, 3)}`;
};

export const toSrt = (transcript: string): string => {
    const paragraphs = transcript.split('\n\n').filter(p => p.trim().length > 0);
    let currentTime = 0; // in seconds
    let srtContent = '';

    paragraphs.forEach((paragraph, index) => {
        const wordCount = paragraph.trim().split(/\s+/).length;
        const duration = (wordCount / WORDS_PER_MINUTE) * 60;

        const startTime = currentTime;
        const endTime = startTime + duration;
        
        srtContent += `${index + 1}\n`;
        srtContent += `${formatTimestamp(startTime, 'srt')} --> ${formatTimestamp(endTime, 'srt')}\n`;
        srtContent += `${paragraph}\n\n`;

        currentTime = endTime + 0.5; // Add a half-second pause between subtitles
    });

    return srtContent;
};

export const toVtt = (transcript: string): string => {
    const paragraphs = transcript.split('\n\n').filter(p => p.trim().length > 0);
    let currentTime = 0; // in seconds
    let vttContent = 'WEBVTT\n\n';

    paragraphs.forEach((paragraph) => {
        const wordCount = paragraph.trim().split(/\s+/).length;
        const duration = (wordCount / WORDS_PER_MINUTE) * 60;

        const startTime = currentTime;
        const endTime = startTime + duration;

        vttContent += `${formatTimestamp(startTime, 'vtt')} --> ${formatTimestamp(endTime, 'vtt')}\n`;
        vttContent += `${paragraph}\n\n`;
        
        currentTime = endTime + 0.5; // Add a half-second pause between subtitles
    });

    return vttContent;
};
