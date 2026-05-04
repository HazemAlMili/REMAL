"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_REVIEWS } from '@/lib/mock-data';
import { Star, MessageSquare, Eye, Ban, CheckCircle2 } from 'lucide-react';

const REVIEW_FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'Pending' },
  { id: 'published', label: 'Published' },
  { id: 'hidden', label: 'Hidden' },
] as const;

function getReviewVariant(status: string) {
  switch (status) {
    case 'pending': return 'warning' as const;
    case 'published': return 'success' as const;
    case 'hidden': return 'neutral' as const;
    default: return 'danger' as const;
  }
}

export default function ReviewsPage() {
  const [filter, setFilter] = useState<(typeof REVIEW_FILTERS)[number]['id']>('all');
  const reviews = filter === 'all' ? MOCK_REVIEWS : MOCK_REVIEWS.filter((review) => review.status === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">المراجعات</h1>
          <p className="text-gray-500 font-medium">مراجعة سريعة للتقييمات مع badges واضحة للحالة.</p>
        </div>
        <Badge variant="info" className="px-4 py-2 text-sm">{MOCK_REVIEWS.length} مراجعات</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {REVIEW_FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === tab.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.map((review) => (
          <Card key={review.id} className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{review.client}</h2>
                <p className="text-sm text-gray-500">{review.unit} • {review.date}</p>
              </div>
              <Badge variant={getReviewVariant(review.status)}>{review.status}</Badge>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 text-gray-700 leading-7 flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
              <p>{review.comment}</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <Button variant="secondary" leftIcon={<Eye className="w-4 h-4" />}>إخفاء</Button>
              <Button variant="secondary" leftIcon={<CheckCircle2 className="w-4 h-4" />}>نشر</Button>
              <Button variant="danger" leftIcon={<Ban className="w-4 h-4" />}>رفض</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}