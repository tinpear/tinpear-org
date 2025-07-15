import type { NewsItem } from './types';

const CACHE_HOURS = 12;
let cached: { data: NewsItem[]; expires: number } | null = null;

export async function getLatestNews(): Promise<NewsItem[]> {
  const now = Date.now();

  // ✅ 1. Use cache if available
  if (cached && now < cached.expires) {
    console.log('✅ Using cached news');
    return cached.data;
  }

  // ✅ 2. Build API call
  const key = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
  if (!key) {
    console.warn('⚠️ No NEWSDATA_API_KEY found in .env.local');
    return getMockNews(); // fallback for dev
  }

  const url = `https://newsdata.io/api/1/latest?apikey=${key}&q=ai OR machine learning OR iot OR web3&language=en&country=us&category=technology`;


  try {
    const res = await fetch(url, {
      next: { revalidate: CACHE_HOURS * 3600 },
    });

    const json = await res.json();

    // ✅ 3. Validate response
    if (!Array.isArray(json.results)) {
      console.warn('⚠️ Unexpected API response:', json);
      return getMockNews(); // fallback
    }

    const data: NewsItem[] = json.results.map((item: any) => ({
      title: item.title || 'Untitled News',
      summary: item.description || 'No description available.',
      url: item.link || '#',
      date: new Date(item.pubDate || Date.now()).toLocaleDateString(),
      category: item.category?.[0] ?? 'AI',
      image: item.image_url || '/news/default.jpg',
      source: item.source_id || 'Unknown Source',
    }));

    // ✅ 4. Cache and return
    cached = { data, expires: now + CACHE_HOURS * 3600 * 1000 };
    return data;
  } catch (err) {
    console.error('❌ News API fetch error:', err);
    return getMockNews(); // fallback
  }
}

// ✅ 5. Development fallback data
function getMockNews(): NewsItem[] {
  return [
    {
      title: 'Tinpear launches new AI learning path',
      summary: 'An all-new guided curriculum on AI from Tinpear is here for beginners and devs alike.',
      url: 'https://tinpear.com/learn',
      date: 'July 10, 2025',
      category: 'AI',
      image: '/news/default.jpg',
      source: 'Tinpear',
    },
    {
      title: 'Open Source Robotics on the Rise',
      summary: 'Open-source robotics projects are seeing massive growth on GitHub in 2025.',
      url: 'https://example.com/robotics',
      date: 'July 9, 2025',
      category: 'Robotics',
      image: '/news/default.jpg',
      source: 'Example News',
    },
  ];
}
