'use client';

import { useEffect, useState } from 'react';
import { NewsItem } from '@/lib/types';
import Link from 'next/link';

type Props = {
  featuredNews: NewsItem[];
};

export default function AutoSlideshow({ featuredNews }: Props) {
  const [current, setCurrent] = useState(0);
  const delay = 6000; // 6 seconds per slide

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featuredNews.length);
    }, delay);
    return () => clearInterval(interval);
  }, [featuredNews.length]);

  return (
    <div className="relative w-full h-[350px] bg-gray-200 rounded-xl overflow-hidden shadow-lg">
      {featuredNews.map((item, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={item.image || '/news/default.jpg'}
            alt={item.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute bottom-0 w-full bg-black/70 text-white p-4">
            <h3 className="text-lg font-bold leading-tight mb-1 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-200 line-clamp-2">{item.summary}</p>
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-blue-300 hover:text-white underline"
            >
              Read full story →
            </Link>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
        {featuredNews.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === current ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
