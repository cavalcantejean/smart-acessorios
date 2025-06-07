
"use client";

import type { Coupon } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface CouponCardProps {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: CouponCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [formattedExpiryDate, setFormattedExpiryDate] = useState<string | null>(null);

  useEffect(() => {
    if (coupon.expiryDate) {
      // Formata a data apenas no cliente
      setFormattedExpiryDate(new Date(coupon.expiryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }));
    }
  }, [coupon.expiryDate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code)
      .then(() => {
        setCopied(true);
        toast({
          title: 'Código Copiado!',
          description: `O código ${coupon.code} foi copiado para a área de transferência.`,
        });
        setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
      })
      .catch(err => {
        console.error('Falha ao copiar código: ', err);
        toast({
          title: 'Erro ao Copiar',
          description: 'Não foi possível copiar o código. Tente manualmente.',
          variant: 'destructive',
        });
      });
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg h-full bg-secondary/20 border-dashed border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-primary flex items-center">
            {coupon.discount}
          </CardTitle>
          {coupon.store && <Badge variant="outline">{coupon.store}</Badge>}
        </div>
        <CardDescription className="text-sm">{coupon.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="flex items-center justify-between p-3 bg-background rounded-md border border-dashed">
          <span className="text-lg font-mono font-semibold text-accent">{coupon.code}</span>
          <Button variant="ghost" size="icon" onClick={handleCopyCode} aria-label="Copiar código do cupom">
            {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          </Button>
        </div>
      </CardContent>
      {coupon.expiryDate && (
        <CardFooter className="text-xs text-muted-foreground pt-0 pb-3">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>Válido até: {formattedExpiryDate || '...'}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

