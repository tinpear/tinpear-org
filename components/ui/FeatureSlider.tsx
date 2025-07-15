'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { NewsItem } from '@/lib/types';

export default function FeaturedSlider({ news }: { news: NewsItem[] }) {
  const featured = news.slice(0, 5); // top 5

  return (
    <div className="overflow-x-auto pb-4 -mx-4 relative">
      <div className="flex space-x-6 px-4 snap-x snap-mandatory">
        {featured.map((item, i) => (
          <Link
            key={i}
            href={item.url}
            target="_blank"
            className="min-w-[280px] max-w-xs snap-start bg-white rounded-xl shadow hover:shadow-lg transition flex-shrink-0"
          >
            <Image
              src={item.image || '/news/default.jpg'}
              alt={item.title}
              width={400}
              height={240}
              className="h-40 w-full object-cover rounded-t-xl"
            />
            <div className="p-4">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {item.category}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-gray-800 line-clamp-2">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
