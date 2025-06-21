import type { Testimonial } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg h-full bg-card">
      <CardHeader className="pb-2 pt-6 px-6">
        <Quote className="h-8 w-8 text-primary/50 mb-2 transform scale-x-[-1]" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-grow">
        <blockquote className="text-base text-foreground leading-relaxed italic">
          "{testimonial.quote}"
        </blockquote>
      </CardContent>
      <CardFooter className="p-6 pt-4 border-t bg-secondary/30">
        <div>
          <p className="font-semibold text-foreground">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
