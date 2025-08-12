
'use client';

import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { ProductCardClient } from '@/components/product-card-client';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

function formatCategoryName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' & ');
}

export default function CategoryPage({ params }: { params: { categoryName: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const categoryName = formatCategoryName(params.categoryName);

    useEffect(() => {
        async function getProductsByCategory(category: string) {
            setLoading(true);
            try {
                const q = query(collection(db, 'products'), where('category', '==', category));
                const querySnapshot = await getDocs(q);
                const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(fetchedProducts);
            } catch (error) {
                console.error(`Error fetching products for category ${category}: `, error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        
        if (categoryName) {
            getProductsByCategory(categoryName);
            document.title = `${categoryName} | AYN Beauty`;
        }
    }, [categoryName]);

    const pageTitle = `${categoryName} Products`;

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <Header />
            <MainNav />
            <main className="flex-grow">
                <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-12 text-center">
                        {pageTitle}
                    </h1>

                    {loading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="aspect-square w-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-5 w-1/4" />
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <ProductCardClient key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-xl text-muted-foreground">No products available under the selected category.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
