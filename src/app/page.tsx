
import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { HeroCarousel } from '@/components/hero-carousel';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

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
];

const newlyAddedProducts = [
  {
    name: 'Hydrating Face Mist',
    price: '$25',
    image: 'https://placehold.co/400x400.png',
    hint: 'face mist'
  },
  {
    name: 'Matte Liquid Eyeliner',
    price: '$28',
    image: 'https://placehold.co/400x400.png',
    hint: 'eyeliner product'
  },
  {
    name: 'Exfoliating Body Scrub',
    price: '$42',
    image: 'https://placehold.co/400x400.png',
    hint: 'body scrub'
  },
  {
    name: 'Cuticle Care Oil',
    price: '$18',
    image: 'https://placehold.co/400x400.png',
    hint: 'cuticle oil'
  }
];

const categories = [
  { name: 'SkinCare', href: '/categories/skincare', image: 'https://placehold.co/300x300.png', hint: 'skincare products' },
  { name: 'Lips', href: '/categories/lips', image: 'https://placehold.co/300x300.png', hint: 'lipstick makeup' },
  { name: 'Bath & Body', href: '/categories/bath-body', image: 'https://placehold.co/300x300.png', hint: 'bath bombs' },
  { name: 'Fragrances', href: '/categories/fragrances', image: 'https://placehold.co/300x300.png', hint: 'perfume bottle' },
  { name: 'Eyes', href: '/categories/eyes', image: 'https://placehold.co/300x300.png', hint: 'eyeshadow palette' },
  { name: 'Nails', href: '/categories/nails', image: 'https://placehold.co/300x300.png', hint: 'nail polish' },
];

export default function Home() {
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
              src="https://placehold.co/1200x400.png"
              alt="Special Offer Banner"
              width={1200}
              height={400}
              className="w-full h-full object-cover"
              data-ai-hint="beauty promotion"
            />
          </div>
        </section>
        
        <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-headline font-bold text-center mb-12">Best selling products</h2>
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
        <section className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full aspect-[3/1] overflow-hidden rounded-lg shadow-lg">
            <Image
              src="https://placehold.co/1200x400.png"
              alt="Special Offer Banner"
              width={1200}
              height={400}
              className="w-full h-full object-cover"
              data-ai-hint="beauty promotion"
            />
          </div>
        </section>
        <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-headline font-bold text-center mb-12">Newly Added Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newlyAddedProducts.map((product) => (
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
            <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
              Please be aware that ingredient lists may change or vary from time to time. Please refer to the ingredient list on the product package you receive for the most up to date list of ingredients.
            </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
