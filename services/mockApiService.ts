import type { Video } from '../types';

const MOCK_VIDEOS: Video[] = [
  {
    id: 'mock_id_1',
    title: 'Mastering CSS Grid Layout in 20 Minutes',
    thumbnailUrl: 'https://picsum.photos/seed/css1/480/270',
    channelName: 'CSS Masters',
  },
  {
    id: 'mock_id_2',
    title: 'Flexbox vs. Grid: Which One Should You Use?',
    thumbnailUrl: 'https://picsum.photos/seed/css2/480/270',
    channelName: 'Frontend Dev Explained',
  },
  {
    id: 'mock_id_3',
    title: 'Creative Animations with CSS Transforms & Transitions',
    thumbnailUrl: 'https://picsum.photos/seed/css3/480/270',
    channelName: 'Web Wizardry',
  },
  {
    id: 'mock_id_4',
    title: 'Deep Dive into CSS Custom Properties (Variables)',
    thumbnailUrl: 'https://picsum.photos/seed/css4/480/270',
    channelName: 'CodeCraft',
  },
  {
    id: 'mock_id_5',
    title: 'Responsive Design Made Easy with Clamp() and Min()',
    thumbnailUrl: 'https://picsum.photos/seed/css5/480/270',
    channelName: 'UI Gurus',
  },
  {
    id: 'mock_id_6',
    title: 'The Power of CSS Blend Modes',
    thumbnailUrl: 'https://picsum.photos/seed/css6/480/270',
    channelName: 'Design to Code',
  },
  {
    id: 'mock_id_7',
    title: 'Optimizing CSS for Performance: A Practical Guide',
    thumbnailUrl: 'https://picsum.photos/seed/css7/480/270',
    channelName: 'Speedy Web',
  },
  {
    id: 'mock_id_8',
    title: 'Understanding CSS Specificity and the Cascade',
    thumbnailUrl: 'https://picsum.photos/seed/css8/480/270',
    channelName: 'CSS Foundations',
  },
];

const MOCK_TRANSCRIPT = `Hello everyone and welcome back to the channel! In today's video, we're going to take a deep dive into one of the most powerful and flexible layout modules in CSS: Grid Layout. We'll cover everything from the basic concepts to more advanced techniques that will allow you to create complex, responsive layouts with ease.

First, let's talk about the core idea behind CSS Grid. It's a two-dimensional layout system, meaning it can handle both columns and rows, unlike Flexbox which is largely a one-dimensional system. This makes Grid the perfect tool for creating the main page layouts, such as headers, footers, sidebars, and the main content area. To get started, you just need a container element, which you'll declare as a grid with 'display: grid', and then you can define your columns and rows using the 'grid-template-columns' and 'grid-template-rows' properties.

One of the most useful features of Grid is the 'fr' unit, which stands for "fractional unit". This allows you to divide the available space in a flexible way. For example, 'grid-template-columns: 1fr 2fr' would create two columns, where the second column is twice as wide as the first. This is incredibly powerful for responsive design because you don't have to deal with complex percentage calculations.

We'll also explore how to place items onto the grid. You can do this explicitly using line numbers with 'grid-column-start' and 'grid-row-start', or you can name grid lines and areas for a more semantic and readable layout. We'll build a complete example together to see these concepts in action. So, make sure you have your code editor open, and let's get started mastering CSS Grid! Thanks for watching, and don't forget to like and subscribe for more content.`;


export const generatePlaylistData = async (playlistTopic: string): Promise<Video[]> => {
  console.log(`[MOCK] Fetching playlist for topic: "${playlistTopic}"`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('[MOCK] Playlist data fetched.');
      resolve(MOCK_VIDEOS);
    }, 1500);
  });
};

export const generateTranscript = async (videoTitle: string): Promise<string> => {
  console.log(`[MOCK] Fetching transcript for video: "${videoTitle}"`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('[MOCK] Transcript fetched.');
      resolve(MOCK_TRANSCRIPT);
    }, 2000);
  });
};
