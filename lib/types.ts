// lib/types.ts

export type NewsItem = {
  title: string;
  summary: string;
  date: string;
  url: string;
  source?: string;
  category?: string;
  image?: string;
};
