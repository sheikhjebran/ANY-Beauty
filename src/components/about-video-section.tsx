'use client';

import { useState, useEffect } from 'react';

export function AboutVideoSection() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <section className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-xl">
                    {isClient && (
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/E6RPyVqGjbQ"
                            title="ANY Beauty - Your Ultimate Beauty Destination"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    )}
                </div>
                <div className="space-y-6">
                    <h2 className="text-3xl font-headline font-bold text-gray-900">Welcome to ANY Beauty</h2>
                    <div className="prose prose-lg">
                        <p className="text-gray-600">
                            Discover your perfect beauty essentials at ANY Beauty. We curate the finest selection of makeup,
                            skincare, and beauty products to help you enhance your natural beauty and express yourself confidently.
                        </p>
                        <p className="text-gray-600">
                            Our carefully selected range includes everything from luxurious skincare treatments to vibrant makeup collections,
                            ensuring you find exactly what you need to create your perfect beauty routine.
                        </p>
                        <p className="text-gray-600">
                            With expert advice, premium products, and a passion for beauty, we&apos;re here to make your beauty journey
                            extraordinary.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
