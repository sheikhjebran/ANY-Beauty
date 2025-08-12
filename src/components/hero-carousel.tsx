"use client"
import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

const banners = [
    { src: "https://placehold.co/1800x900.png", alt: "Promotional banner 1", hint: "beauty product" },
    { src: "https://placehold.co/1800x900.png", alt: "Promotional banner 2", hint: "cosmetics model" },
    { src: "https://placehold.co/1800x900.png", alt: "Promotional banner 3", hint: "skincare routine" },
]

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  return (
    <section className="w-full">
       <Carousel
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
    </section>
  )
}
