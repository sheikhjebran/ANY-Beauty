"use client"
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { cn } from '@/lib/utils';

const banners = [
    { src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1800&h=900&auto=format&fit=crop", alt: "Promotional banner 1", hint: "cosmetics flatlay" },
    { src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1800&h=900&auto=format&fit=crop", alt: "Promotional banner 2", hint: "beauty promotion" },
    { src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1800&h=900&auto=format&fit=crop", alt: "Promotional banner 3", hint: "bath bombs" },
]

export function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index)
  }, [api]);

  return (
    <section className="w-full relative">
       <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          className="w-full"
          opts={{
            loop: true,
          }}
        >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={index}>
              <div className="w-full aspect-[2/1] md:aspect-[2.5/1] lg:aspect-[2/1] xl:aspect-[18/7.5] overflow-hidden">
                <Image 
                  src={banner.src}
                  alt={banner.alt}
                  width={1800}
                  height={900}
                  className="w-full h-full object-cover"
                  data-ai-hint={banner.hint}
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/50 hover:bg-background/80" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background/50 hover:bg-background/80" />
      </Carousel>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-all",
                current === index ? "w-4 bg-primary" : "bg-primary/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
        ))}
      </div>
    </section>
  )
}
