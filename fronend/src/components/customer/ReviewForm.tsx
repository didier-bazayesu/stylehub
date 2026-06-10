/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewInput } from '../../lib/validators';
import { Button, Card, CardHeader, CardBody } from '../ui';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (data: ReviewInput) => void;
  isLoading?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isLoading = false }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    }
  });

  const handleStarClick = (rate: number) => {
    setRating(rate);
    setValue('rating', rate);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="garment-review-form">
      <div>
        <label className="text-xs font-semibold text-neutral-500 font-mono mb-2 block">Curation Rating (1-5 Stars)</label>
        <div className="flex gap-1.5" id="stars-row">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = hoverRating !== null ? star <= hoverRating : star <= rating;
            return (
              <button
                type="button"
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 text-amber-400 focus:outline-none cursor-pointer"
              >
                <Star className={`w-6 h-6 ${active ? 'fill-amber-400' : 'text-neutral-200'}`} />
              </button>
            );
          })}
        </div>
        {errors.rating && <p className="text-xs text-rose-500 mt-1">{errors.rating.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-550 font-mono">Bespoke Curation Feedback Comment</label>
        <textarea
          placeholder="How did the fit, stitching, and feel of this vintage garment elevate your daily style?"
          rows={3}
          className="flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
          {...register('comment')}
        />
        {errors.comment && <p className="text-xs text-rose-500 mt-1">{errors.comment.message}</p>}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Publish Authentic Review
      </Button>
    </form>
  );
};
export default ReviewForm;
