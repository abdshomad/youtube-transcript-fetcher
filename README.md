# YouTube Playlist Transcript Fetcher

A mockup application that demonstrates the power of the Google Gemini API to generate dynamic content. This tool allows users to input a topic, generate a realistic-looking YouTube playlist, and then fetch an AI-generated transcript for any video in that list.

## ✨ Features

- **Dynamic Playlist Generation**: Enter any topic (e.g., "Beginner Python," "React Hooks Tutorial"), and the app uses the Gemini API to create a list of 8 relevant videos with titles, channel names, and placeholder thumbnails.
- **AI-Powered Transcripts**: Select any video from the generated playlist to get a plausible, AI-generated transcript.
- **Responsive UI**: A clean, modern interface built with Tailwind CSS that works seamlessly on desktop and mobile devices.
- **Interactive Modals**: Transcripts are displayed in an easy-to-read, accessible modal.
- **Loading & Error States**: Smooth user experience with clear loading indicators and graceful error handling.

## 🚀 How It Works

This application is built entirely on the frontend and leverages the Google Gemini API for its core functionality.

- **Frontend**: Built with **React** and **TypeScript** for a robust and type-safe user interface. Styling is handled by **Tailwind CSS**.
- **AI Model**: It uses `gemini-2.5-flash` via the `@google/genai` SDK for two main tasks:
    1.  **Playlist Generation**: When a user submits a topic, a structured prompt is sent to Gemini, asking for a JSON object containing a list of videos that matches a predefined schema.
    2.  **Transcript Generation**: When a user requests a transcript for a specific video, a second prompt is sent to Gemini, asking it to generate a realistic, paragraph-based transcript for a video with that title.

## 🧑‍💻 Development (Using Mock API)

This project is currently configured to use a **mock API service** (`services/mockApiService.ts`). This allows for rapid UI development and testing without making actual calls to the Gemini API, which is useful for demonstrating the app's functionality without needing an API key. The mock service simulates network latency and returns realistic, hardcoded data.

To switch to the live Gemini API, simply change the import in `App.tsx`:

```javascript
// From this:
import { generatePlaylistData, generateTranscript } from './services/mockApiService';

// To this:
// import { generatePlaylistData, generateTranscript } from './services/geminiService';
```

## Usage

1.  Enter a topic for a playlist into the input field (e.g., "baking sourdough bread").
2.  Click the **"Fetch Playlist"** button.
3.  Wait for the mock playlist to be generated and displayed.
4.  Click the **"Get Transcript"** button on any video card.
5.  A modal will appear, showing the AI-generated transcript for the selected video.
6.  Click the '×' button, press the `Escape` key, or click outside the modal to close it.
