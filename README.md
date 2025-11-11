# YouTube Playlist Transcript Fetcher

An application that demonstrates the power of the Google Gemini API to **simulate interactions with external services**. This tool allows users to enter a YouTube playlist URL or a general topic, and it uses Gemini to **simulate fetching a playlist** and its videos. Users can then fetch an AI-generated transcript for any video in the list.

## ✨ Features

- **Simulated Playlist Generation**: Enter a YouTube playlist URL or any topic (e.g., "Beginner Python"), and the Gemini API will generate a realistic, plausible list of videos.
- **AI-Powered Transcripts**: Select any video from the generated playlist to get a plausible, AI-generated transcript.
- **Responsive UI**: A clean, modern interface built with Tailwind CSS that works seamlessly on desktop and mobile devices.
- **Interactive Modals**: Transcripts are displayed in an easy-to-read, accessible modal.
- **Loading & Error States**: Smooth user experience with clear loading indicators and graceful error handling.

## 🚀 How It Works

This application is built entirely on the frontend and leverages the Google Gemini API for its core functionality.

- **Frontend**: Built with **React** and **TypeScript** for a robust and type-safe user interface. Styling is handled by **Tailwind CSS**.
- **AI Model**: It uses `gemini-2.5-flash` via the `@google/genai` SDK for its main tasks:
    1.  **High-Fidelity Playlist Simulation**: When a user submits a playlist URL, a structured prompt is sent to Gemini asking it to return a JSON object that closely mimics the response structure of the official YouTube Data API. This provides a more realistic simulation of fetching playlist data. For topic-based searches, a simpler list is generated.
    2.  **Transcript Generation**: When a user requests a transcript for a specific video, a second prompt is sent to Gemini, asking it to generate a realistic, paragraph-based transcript for a video with that title.

## 🧑‍💻 Development (Live vs. Mock API)

This project uses the live **Google Gemini API** (`services/geminiService.ts`) by default.

For offline development or testing without an API key, a mock service is available at `services/mockApiService.ts`. To use it, simply swap the imports in `App.tsx`.

```tsx
// In App.tsx

// Comment out the live service:
// import { generatePlaylistByTopic, fetchPlaylistByUrl, generateTranscript } from './services/geminiService';

// And uncomment the mock service:
import { generatePlaylistData, generateTranscript } from './services/mockApiService';
```

## Usage

1.  Enter a YouTube playlist URL or a topic into the input field (e.g., "baking sourdough bread").
2.  Click the **"Fetch Playlist"** button.
3.  Wait for the AI-simulated playlist to be generated and displayed.
4.  Click the **"Get Transcript"** button on any video card.
5.  A modal will appear, showing the AI-generated transcript for the selected video.
6.  Click the '×' button, press the `Escape` key, or click outside the modal to close it.