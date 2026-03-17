import { Star } from 'lucide-react';

type RatingStarsProps = {
  rating: number;
};

export const RatingStars = ({ rating }: RatingStarsProps) => {
  return (
    <div className='flex items-center gap-0.5'>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          }
        />
      ))}
    </div>
  );
};
