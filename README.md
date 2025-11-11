# YouTube Playlist Transcript Fetcher

An application that uses the official **YouTube Data API** to fetch real video playlists and the **Google Gemini API** to generate transcripts for them. Provide any public YouTube playlist URL or a topic, and the application will fetch the videos and allow you to generate, download, and edit a transcript for any video in the list.

## ✨ Features

- **Real Playlist Fetching**: Enter a YouTube playlist URL or any topic (e.g., "Beginner Python"), and the app will use the YouTube Data API to fetch the real list of videos.
- **AI-Powered Transcripts**: Select any video from the generated playlist to get a plausible, AI-generated transcript.
- **Multi-Language Support**: Generate transcripts in various languages, including Spanish, French, German, and more.
- **AI-Powered Summarization**: Generate a concise, bullet-point summary for any transcript with a single click.
- **Key Topic Extraction**: Automatically identify and display key topics from the transcript as clickable tags for easy navigation.
- **Responsive UI**: A clean, modern interface built with Tailwind CSS that works seamlessly on desktop and mobile devices.
- **Interactive Modals**: Transcripts are displayed in an easy-to-read, accessible modal.
- **Loading & Error States**: Smooth user experience with clear loading indicators and graceful error handling.

## 🚀 How It Works

This application is built entirely on the frontend and leverages two key Google APIs:

- **Frontend**: Built with **React** and **TypeScript** for a robust and type-safe user interface. Styling is handled by **Tailwind CSS**.
- **APIs**:
    1.  **YouTube Data API**: When a user submits a playlist URL or a topic, the application makes live calls to the YouTube Data API v3. It fetches the real playlist title and a list of up to 50 videos from that playlist. If a topic is provided, it searches for a relevant playlist first.
    2.  **Google Gemini API**: When a user requests a transcript, `gemini-2.5-flash` is used to generate a realistic, paragraph-based transcript for a video with the given title.

## 🧑‍💻 Development (Live vs. Mock API)

This project uses the live **YouTube Data API** (`services/youtubeService.ts`) and the **Google Gemini API** (`services/geminiService.ts`). Both require a valid API key to be configured in the environment.

A mock service is available at `services/mockApiService.ts` for **transcript generation only**. This allows for frontend development and testing of the transcript modal without consuming Gemini API credits. Playlist fetching will still require a live YouTube API key.
To use the mock transcript service, swap the imports in `App.tsx`:

```tsx
// In App.tsx

// Comment out the live service:
// import { generateTranscript } from './services/geminiService';

// And uncomment the mock service:
import { generateTranscript } from './services/mockApiService';
```

## Usage

1.  Enter a public YouTube playlist URL into the first input field, **OR** search for a topic in the second input field (e.g., "baking sourdough bread").
2.  Click the **"Fetch Playlist"** button.
3.  Wait for the playlist to be fetched and displayed.
4.  Click the **"Get Transcript"** button on any video card.
5.  A modal will appear, prompting you to select a language.
6.  Choose a language and click "Generate" to get the AI-generated transcript.
7.  Click the '×' button, press the `Escape` key, or click outside the modal to close it.