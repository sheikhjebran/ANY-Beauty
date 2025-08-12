
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function getProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);
          if (productData.images && productData.images.length > 0) {
            setSelectedImage(productData.images[0]);
          }
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    getProduct();
  }, [id]);
  
  if (loading) {
    return (
       <div className="flex flex-col min-h-screen bg-background font-body">
        <Header />
        <MainNav />
        <main className="flex-grow container mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <div className="flex gap-4 mt-4">
                        <Skeleton className="w-24 h-24 rounded-lg" />
                        <Skeleton className="w-24 h-24 rounded-lg" />
                        <Skeleton className="w-24 h-24 rounded-lg" />
                    </div>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <Header />
            <MainNav />
            <main className="flex-grow container mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-2xl text-muted-foreground">Product not found.</h1>
                 <Button asChild className="mt-6">
                    <Link href="/products">Go back to Products</Link>
                </Button>
            </main>
            <Footer />
        </div>
    );
  }
  
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
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
      window.dispatchEvent(new Event('storage'));

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

  const adjustQuantity = (amount: number) => {
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


  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <MainNav />
      <main className="flex-grow">
        <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button variant="outline" size="sm" asChild>
                <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Image Gallery */}
            <div className="flex flex-col gap-4 sticky top-28">
              <div className="aspect-square w-full rounded-lg overflow-hidden border shadow-lg">
                <Image
                  src={selectedImage || product.images?.[0] || 'https://placehold.co/600x600.png'}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  data-ai-hint={product.hint}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${selectedImage === image ? 'border-primary' : 'border-transparent'}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <Badge variant="secondary">{product.category}</Badge>
              <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">{product.name}</h1>
              <p className="text-3xl font-semibold text-foreground">
                 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', currencyDisplay: 'symbol' }).format(product.price / 100)}
              </p>
              <div className="text-muted-foreground prose">
                <p>{product.description}</p>
              </div>

             <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                 <div className="w-full max-w-xs space-y-2">
                    <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-muted-foreground">QUANTITY</label>
                     <div className="flex items-center justify-between w-full rounded-full bg-background p-1 border">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full h-9 w-9" 
                            onClick={() => adjustQuantity(-1)} 
                            disabled={isOutOfStock || quantity <= 1}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span id={`quantity-${product.id}`} className="font-bold text-xl text-primary px-4">{quantity}</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full h-9 w-9"
                            onClick={() => adjustQuantity(1)} 
                            disabled={isOutOfStock || quantity >= product.quantity}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <Button onClick={handleAddToCart} disabled={isOutOfStock} className="w-full rounded-full" size="lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
             </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

