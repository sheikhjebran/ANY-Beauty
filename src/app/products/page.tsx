
import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  hint?: string;
  quantity: number;
  modifiedAt: any; // Firestore timestamp
}

async function getAllProducts(): Promise<Product[]> {
    try {
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error("Error fetching all products: ", error);
        return [];
    }
}

export default async function AllProductsPage() {
    const products = await getAllProducts();

    const sortedProducts = products.sort((a, b) => {
        const aIsOutOfStock = a.quantity === 0;
        const bIsOutOfStock = b.quantity === 0;

        // If one is out of stock and the other isn't, the out of stock one goes to the end
        if (aIsOutOfStock && !bIsOutOfStock) return 1;
        if (!aIsOutOfStock && bIsOutOfStock) return -1;

        // Otherwise, sort by modified date
        const dateA = a.modifiedAt?.toDate ? a.modifiedAt.toDate() : new Date(0);
        const dateB = b.modifiedAt?.toDate ? b.modifiedAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <div className="flex flex-col min-h-screen bg-background font-body">
            <Header />
            <MainNav />
            <main className="flex-grow">
                <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-12 text-center">
                        All Products
                    </h1>

                    {sortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {sortedProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none group flex flex-col">
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
                                         {product.quantity === 0 && (
                                            <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
                                        )}
                                    </CardContent>
                                    <CardHeader className="flex-grow">
                                        <CardTitle className="font-headline text-xl">{product.name}</CardTitle>
                                        <p className="text-lg text-primary font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price / 100)}</p>
                                    </CardHeader>
                                </Card>
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

export const metadata = {
  title: 'All Products | AYN Beauty',
  description: 'Browse our full collection of premium beauty products.',
};
