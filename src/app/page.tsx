
'use client';

import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { HeroCarousel } from '@/components/hero-carousel';
import { Footer } from '@/components/footer';
import { ProductCardClient } from '@/components/product-card-client';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  hint?: string;
  quantity: number;
  modifiedAt: any;
}

const categories = [
  { name: 'SkinCare', href: '/categories/skincare', image: 'https://placehold.co/300x300.png', hint: 'skincare products' },
  { name: 'Lips', href: '/categories/lips', image: 'https://placehold.co/300x300.png', hint: 'lipstick makeup' },
  { name: 'Bath & Body', href: '/categories/bath-body', image: 'https://placehold.co/300x300.png', hint: 'bath bombs' },
  { name: 'Fragrances', href: '/categories/fragrances', image: 'https://placehold.co/300x300.png', hint: 'perfume bottle' },
  { name: 'Eyes', href: '/categories/eyes', image: 'https://placehold.co/300x300.png', hint: 'eyeshadow palette' },
  { name: 'Nails', href: '/categories/nails', image: 'https://placehold.co/300x300.png', hint: 'nail polish' },
];

function ProductSection({ title, fetcher, limit: displayLimit }: { title: string, fetcher: () => Promise<Product[]>, limit?: number }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            setLoading(true);
            const fetchedProducts = await fetcher();
            setProducts(fetchedProducts);
            setLoading(false);
        }
        loadProducts();
    }, [fetcher]);

    const displayProducts = displayLimit ? products.slice(0, displayLimit) : products;

    return (
        <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-headline font-bold text-center mb-12">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {loading 
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-5 w-1/4" />
                        </div>
                    ))
                    : displayProducts.map((product) => (
                        <ProductCardClient key={product.id} product={product} />
                    ))
                }
            </div>
        </section>
    );
}

export default function Home() {
  
  async function getBestSellingProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'), where('isBestSeller', '==', true), limit(4));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error("Error fetching best selling products: ", error);
      return [];
    }
  }

  async function getNewlyAddedProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'), orderBy('modifiedAt', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error("Error fetching newly added products: ", error);
      return [];
    }
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <MainNav />
      <main className="flex-grow">
        <HeroCarousel />

        <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-headline font-bold text-center mb-12">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
              {categories.map((category) => (
                <Link href={category.href} key={category.name} className="group text-center">
                  <div className="aspect-square rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent group-hover:border-primary">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={category.hint}
                    />
                  </div>
                  <h3 className="mt-4 font-headline text-xl text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                </Link>
              ))}
            </div>
        </section>

        <section className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full aspect-[3/1] overflow-hidden rounded-lg shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&h=400&auto=format&fit=crop"
              alt="Special Offer Banner"
              width={1200}
              height={400}
              className="w-full h-full object-cover"
              data-ai-hint="beauty promotion"
            />
          </div>
        </section>
        
        <ProductSection title="Best selling products" fetcher={getBestSellingProducts} limit={4} />

        <section className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full aspect-[3/1] overflow-hidden rounded-lg shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&h=400&auto=format=fit=crop"
              alt="Special Offer Banner"
              width={1200}
              height={400}
              className="w-full h-full object-cover"
              data-ai-hint="beauty promotion"
            />
          </div>
        </section>
        
        <ProductSection title="Newly Added Products" fetcher={getNewlyAddedProducts} limit={8} />

        <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
             <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
                Please be aware that ingredient lists may change or vary from time to time. Please refer to the ingredient list on the product package you receive for the most up to date list of ingredients.
            </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
