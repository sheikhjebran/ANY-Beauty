import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { HeroCarousel } from '@/components/hero-carousel';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const featuredProducts = [
  {
    name: 'Radiant Glow Serum',
    price: '$75',
    image: 'https://placehold.co/400x400.png',
    hint: 'serum bottle'
  },
  {
    name: 'Velvet Touch Lipstick',
    price: '$32',
    image: 'https://placehold.co/400x400.png',
    hint: 'lipstick product'
  },
  {
    name: 'Silk Finish Foundation',
    price: '$58',
    image: 'https://placehold.co/400x400.png',
    hint: 'foundation cosmetics'
  },
  {
    name: 'Night Repair Cream',
    price: '$85',
    image: 'https://placehold.co/400x400.png',
    hint: 'face cream'
  }
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <MainNav />
      <main className="flex-grow">
        <HeroCarousel />
        
        <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-headline font-bold text-center mb-12">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.name} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-none group">
                   <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={product.image}
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
                    <p className="text-lg text-primary font-semibold">{product.price}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
