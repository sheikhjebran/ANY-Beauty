
import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  hint?: string;
}

function formatCategoryName(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' & ');
}

async function getProductsByCategory(categoryName: string): Promise<Product[]> {
    try {
        const q = query(collection(db, 'products'), where('category', '==', categoryName));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
        console.error(`Error fetching products for category ${categoryName}: `, error);
        return [];
    }
}

export default async function CategoryPage({ params }: { params: { categoryName: string } }) {
    const categoryName = formatCategoryName(params.categoryName);
    const products = await getProductsByCategory(categoryName);
    
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

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none group">
                                    <CardContent className="p-0">
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
                                    </CardContent>
                                    <CardHeader>
                                        <CardTitle className="font-headline text-xl">{product.name}</CardTitle>
                                        <p className="text-lg text-primary font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price / 100)}</p>
                                    </CardHeader>
                                </Card>
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

export async function generateMetadata({ params }: { params: { categoryName: string } }) {
  const categoryName = formatCategoryName(params.categoryName);
  return {
    title: `${categoryName} | AYN Beauty`,
    description: `Shop for the best ${categoryName} products at AYN Beauty.`,
  };
}

