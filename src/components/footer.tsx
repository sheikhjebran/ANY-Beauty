
'use client'

import Link from 'next/link';
import { Instagram, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';

const customerServiceLinks = [
  { name: 'Contact Us', href: '/contact' },
  { name: 'Shipping Policy', href: '/shipping-policy' },
  { name: 'Exchange & Refund Policy', href: '/refund-policy' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-headline font-bold text-primary">AYN Beauty</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto md:mx-0">
              Discover your inner radiance with our exclusive collection of premium beauty products. Crafted with care, designed for elegance.
            </p>
          </div>

          {/* Customer Service Section */}
          <div className="space-y-4">
            <h4 className="font-semibold uppercase tracking-wider text-foreground">Customer Service</h4>
            <ul className="space-y-2">
              {customerServiceLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect With Us Section */}
          <div className="space-y-4">
            <h4 className="font-semibold uppercase tracking-wider text-foreground">Connect With Us</h4>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="https://www.instagram.com/aynbeauty_ae?igsh=MWNqbnl6bjVlYjFydg==" aria-label="Instagram">
                <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
              <Link href="https://youtube.com/@yamenshariff998?si=-Sswkf7comZN2dIO" aria-label="YouTube">
                <Youtube className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear || new Date().getFullYear()} AYN Beauty. All Rights Reserved | Developer: sheikhjebran@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}
