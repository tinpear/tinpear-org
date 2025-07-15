// lib/blogs.ts
export type Blog = {
  title: string;
  summary: string;
  author: string;
  date: string;
  image: string;
  url: string;
};

export const blogs: Blog[] = [
  {
    title: 'How to Build with OpenAI in 2025',
    summary: 'Learn how to use GPT-4.5 and OpenAI APIs for real-world projects.',
    author: 'Samuel Adeniyi',
    date: 'July 5, 2025',
    image: '/news/blog1.jpg',
    url: '/blog/how-to-build-with-openai',
  },
  {
    title: '10 AI Tools That Save You Hours Daily',
    summary: 'Productivity-boosting tools for creators, devs, and teams.',
    author: 'Sailat Musa',
    date: 'June 29, 2025',
    image: '/news/blog2.jpg',
    url: '/blog/top-10-ai-tools',
  },
];
