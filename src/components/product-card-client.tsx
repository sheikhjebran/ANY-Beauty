
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category: string;
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

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    try {
      if (isOutOfStock) return;
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingProductIndex = cart.findIndex((item: any) => item.id === product.id);

      if (existingProductIndex > -1) {
        const newQuantity = cart[existingProductIndex].quantity + quantity;
        if (newQuantity > product.quantity) {
             toast({
                variant: 'destructive',
                title: 'Not enough stock!',
                description: `Only ${product.quantity - cart[existingProductIndex].quantity} more items available.`,
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
        cart.push({ 
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
            category: product.category,
            hint: product.hint,
            quantity: quantity, 
            stock: product.quantity,
        });
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

  const adjustQuantity = (e: React.MouseEvent<HTMLButtonElement>, amount: number) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = quantity + amount;
    if (newQuantity < 1) {
        setQuantity(1);
    } else if (newQuantity > product.quantity) {
        setQuantity(product.quantity);
        toast({
            variant: 'destructive',
            title: 'Limited Stock',
            description: `You can only add up to ${product.quantity} items.`
        })
    } else {
        setQuantity(newQuantity);
    }
  }

  const shortDescription = product.description.length > 100 
    ? `${product.description.substring(0, 100)}...` 
    : product.description;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none group flex flex-col">
      <Link href={`/products/${product.id}`} className="flex flex-col flex-grow">
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
          <p className="text-sm text-muted-foreground mt-2">{shortDescription}</p>
          <p className="text-lg text-primary font-semibold pt-2">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', currencyDisplay: 'symbol' }).format(product.price / 100)}
          </p>
        </CardHeader>
      </Link>
      <CardFooter className="flex-col items-start gap-4 w-full pt-0">
        <div className="w-full space-y-2">
            <Label htmlFor={`quantity-${product.id}`} className="text-xs font-medium text-muted-foreground">QUANTITY</Label>
             <div className="flex items-center justify-between w-full rounded-full bg-secondary p-1">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-background/50 hover:bg-background h-8 w-8 shadow-sm" 
                    onClick={(e) => adjustQuantity(e, -1)} 
                    disabled={isOutOfStock || quantity <= 1}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span id={`quantity-${product.id}`} className="font-bold text-lg text-primary px-4">{quantity}</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full bg-background/50 hover:bg-background h-8 w-8 shadow-sm" 
                    onClick={(e) => adjustQuantity(e, 1)} 
                    disabled={isOutOfStock || quantity >= product.quantity}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <Button onClick={handleAddToCart} disabled={isOutOfStock} className="w-full rounded-full" size="lg">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
