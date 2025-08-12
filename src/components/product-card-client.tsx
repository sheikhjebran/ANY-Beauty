
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  hint?: string;
  quantity: number;
}

interface ProductCardClientProps {
  product: Product;
}

export function ProductCardClient({ product }: ProductCardClientProps) {
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingProductIndex = cart.findIndex((item: any) => item.id === product.id);

      if (existingProductIndex > -1) {
        // We can decide to update quantity or just notify it's already there.
        // For simplicity, we'll just update the quantity.
        const newQuantity = cart[existingProductIndex].quantity + quantity;
        if (newQuantity > product.quantity) {
             toast({
                variant: 'destructive',
                title: 'Not enough stock!',
                description: `Only ${product.quantity} items available.`,
            });
            return;
        }
        cart[existingProductIndex].quantity = newQuantity;
      } else {
        if (quantity > product.quantity) {
             toast({
                variant: 'destructive',
                title: 'Not enough stock!',
                description: `Only ${product.quantity} items available.`,
            });
            return;
        }
        cart.push({ ...product, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage')); // To update header cart count

      toast({
        title: 'Added to Cart!',
        description: `${product.name} (x${quantity}) has been added to your cart.`,
      });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add item to cart.',
        });
        console.error("Failed to add to cart:", error);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    if (value > product.quantity) {
        value = product.quantity;
        toast({
            variant: 'destructive',
            title: 'Limited Stock',
            description: `You can only add up to ${product.quantity} items.`
        })
    }
    setQuantity(value);
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none group flex flex-col">
      <CardContent className="p-0 relative">
        <div className="aspect-square overflow-hidden">
          <Image
            src={product.images?.[0] || 'https://placehold.co/400x400.png'}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={product.hint}
          />
        </div>
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
        )}
      </CardContent>
      <CardHeader className="flex-grow">
        <CardTitle className="font-headline text-xl">{product.name}</CardTitle>
        <p className="text-lg text-primary font-semibold">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price / 100)}
        </p>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex items-center gap-2 w-full">
            <Input
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 text-center"
                disabled={isOutOfStock}
            />
            <Button onClick={handleAddToCart} disabled={isOutOfStock} className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
