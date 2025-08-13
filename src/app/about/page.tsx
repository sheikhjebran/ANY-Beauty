
import { Header } from '@/components/header';
import { MainNav } from '@/components/main-nav';
import { Footer } from '@/components/footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <MainNav />
      <main className="flex-grow">
        <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-lg text-muted-foreground">
              <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-8">
                ABOUT US
              </h1>
              <p>
                At AYN Beauty, we believe that beautiful skin knows no borders.
                Our journey began with one simple goal: to bring some of the globally loved skincare products accessible to you. 
                Being a licensed Aesthetican, I saw how the right skincare can transform not only your skin but also your confidence. With AYN Beauty, you're not just buying skincare, you are getting the support of someone who truly understands skin.
              </p>
              <p>
                After exploring global beauty trends that couldn't be found locally, we decided making them easily accessible to our skincare lovers. Each product is chosen with care and quality checked by us before bringing it to our beauties.
              </p>
            </div>
            <div className="aspect-w-1 aspect-h-1">
                <Image
                    src="/assets/logo/logo.png"
                    alt="About AYN Beauty"
                    width={600}
                    height={600}
                    className="rounded-lg object-cover shadow-xl"
                    data-ai-hint="cosmetics flatlay"
                />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
