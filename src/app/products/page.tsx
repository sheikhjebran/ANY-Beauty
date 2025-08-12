
'use client';

import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { ProductCardClient } from '@/components/product-card-client';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  hint?: string;
  quantity: number;
  modifiedAt: any; // Firestore timestamp
}

export default function AllProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getAllProducts() {
            setLoading(true);
            try {
                const q = query(collection(db, 'products'));
                const querySnapshot = await getDocs(q);
                const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                
                const sortedProducts = fetchedProducts.sort((a, b) => {
                    const aIsOutOfStock = a.quantity === 0;
                    const bIsOutOfStock = b.quantity === 0;

                    if (aIsOutOfStock && !bIsOutOfStock) return 1;
                    if (!aIsOutOfStock && bIsOutOfStock) return -1;

                    const dateA = a.modifiedAt?.toDate ? a.modifiedAt.toDate() : new Date(0);
                    const dateB = b.modifiedAt?.toDate ? b.modifiedAt.toDate() : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });
                
                setProducts(sortedProducts);
            } catch (error) {
                console.error("Error fetching all products: ", error);
            } finally {
                setLoading(false);
            }
        }
        getAllProducts();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <Header />
            <MainNav />
            <main className="flex-grow">
                <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-12 text-center">
                        All Products
                    </h1>

                    {loading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Array.from({ length: 12 }).map((_, i) => (
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
                            <p className="text-xl text-muted-foreground">No products available.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
