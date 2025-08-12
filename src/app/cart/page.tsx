
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  id: string;
  name: string;
  price: number;
  images: string[];
  quantity: number;
  stock: number;
  hint?: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    // We need to transform the data slightly to have stock available
    const transformedCart = cartData.map((item: any) => ({
      ...item,
      stock: item.quantity, // The original quantity from product is the stock
      quantity: item.quantity, // The quantity in cart, might be different
    }));
     setCart(transformedCart);
  }, []);

  const updateCartInStorage = (updatedCart: CartItem[]) => {
      const cartForStorage = updatedCart.map(({stock, ...item}) => item);
      localStorage.setItem('cart', JSON.stringify(cartForStorage));
      window.dispatchEvent(new Event('storage'));
      setCart(updatedCart);
  };

  const handleQuantityChange = (productId: string, amount: number) => {
    const updatedCart = cart.map((item) => {
      if (item.id === productId) {
        const newQuantity = item.quantity + amount;
        if (newQuantity < 1) return item;
        const productStock = item.stock; // We need original product stock here
        if (newQuantity > productStock) {
           toast({
                variant: 'destructive',
                title: 'Not enough stock!',
                description: `Only ${productStock} items available.`,
            });
           return { ...item, quantity: productStock };
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    updateCartInStorage(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    updateCartInStorage(updatedCart);
    toast({
      title: 'Item Removed',
      description: 'The item has been removed from your cart.',
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price / 100) * item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <MainNav />
      <main className="flex-grow">
        <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-12">
            Shopping Cart
          </h1>

          {cart.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-xl text-muted-foreground">Your cart is empty.</p>
              <Button asChild className="mt-6">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-6 p-4 border rounded-lg shadow-sm">
                    <div className="relative h-24 w-24 rounded-md overflow-hidden">
                       <Image
                        src={item.images?.[0] || 'https://placehold.co/100x100.png'}
                        alt={item.name}
                        fill
                        sizes="100px"
                        className="object-cover"
                        data-ai-hint={item.hint}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-muted-foreground">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price / 100)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, -1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, 1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                     <p className="w-24 text-right font-semibold">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((item.price / 100) * item.quantity)}
                     </p>
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-5 w-5" />
                     </Button>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-card border rounded-lg shadow-sm p-6 space-y-4">
                    <h2 className="text-2xl font-headline font-bold">Order Summary</h2>
                    <Separator />
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-xl">
                        <span>Grand Total</span>
                        <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}</span>
                    </div>
                    <Button className="w-full" size="lg">
                        Proceed to Checkout
                    </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
