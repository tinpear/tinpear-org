// lib/news.ts
import type { NewsItem } from './types';

const CACHE_HOURS = 12;
let cached: { data: NewsItem[]; expires: number } | null = null;

export async function getLatestNews(): Promise<NewsItem[]> {
  const now = Date.now();

  if (cached && now < cached.expires) {
    return cached.data;
  }

  const key = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
  if (!key) {
    console.warn('Using mock data - no API key found');
    return getMockNews();
  }

  try {
    // Build URL with required parameters
    const url = new URL('https://newsdata.io/api/1/news');
    url.searchParams.append('apikey', key);
    url.searchParams.append('qInTitle', 'AI OR "artificial intelligence"');
    url.searchParams.append('language', 'en');
    url.searchParams.append('category', 'technology');
    url.searchParams.append('image', '1');
    url.searchParams.append('size', '6'); // Reduced number of requests

    const res = await fetch(url.toString(), {
      next: { revalidate: CACHE_HOURS * 3600 },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TinpearAI/1.0'
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('API Error Details:', {
        status: res.status,
        statusText: res.statusText,
        errorCode: errorData?.results?.errorCode,
        message: errorData?.results?.message
      });
      return getMockNews();
    }

    const json = await res.json();
    const data = processNewsResults(json.results);
    
    cached = { data, expires: now + CACHE_HOURS * 3600 * 1000 };
    return data;

  } catch (error) {
    console.error('News fetch failed:', error);
    return getMockNews();
  }
}

function processNewsResults(results: any[]): NewsItem[] {
  if (!Array.isArray(results)) return getMockNews();

  return results
    .filter(item => item.title && item.description)
    .map(item => ({
      title: item.title.trim(),
      summary: item.description.trim(),
      url: item.link || '#',
      date: formatDate(item.pubDate),
      category: determineCategory(item.title, item.description),
      image: getValidImageUrl(item.image_url),
      source: item.source_id || 'Unknown'
    }));
}

function formatDate(dateString?: string): string {
  try {
    return dateString 
      ? new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : 'Recent';
  } catch {
    return 'Recent';
  }
}

function determineCategory(title: string, description: string): string {
  const content = `${title} ${description}`.toLowerCase();
  if (content.includes('chatgpt') || content.includes('openai')) return 'Generative AI';
  if (content.includes('machine learning')) return 'ML';
  if (content.includes('deep learning')) return 'DL';
  if (content.includes('computer vision')) return 'Vision';
  return 'AI News';
}

function getValidImageUrl(url?: string): string {
  // Use placeholder images instead of non-existent local files
  if (!url) return 'https://placehold.co/600x400?text=AI+News';
  try {
    new URL(url);
    return url;
  } catch {
    return 'https://placehold.co/600x400?text=AI+News';
  }
}

function getMockNews(): NewsItem[] {
  return [
    {
      title: 'Tinpear Launches AI Learning Platform',
      summary: 'New platform makes AI education accessible to everyone',
      url: 'https://tinpear.com/learn',
      date: 'Recent',
      category: 'AI Education',
      image: 'https://placehold.co/600x400?text=Tinpear',
      source: 'Tinpear'
    },
    {
      title: 'Advances in Natural Language Processing',
      summary: 'New models show improved understanding of human language',
      url: '#',
      date: 'Recent',
      category: 'NLP',
      image: 'https://placehold.co/600x400?text=NLP',
      source: 'AI Journal'
    }
  ];
}