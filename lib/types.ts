// lib/types.ts

export type NewsItem = {

  title: string;
  summary: string;
  url: string;
  date: string;
  category: string;
  image: string;
  source: string;
  credibilityScore?: number;
}