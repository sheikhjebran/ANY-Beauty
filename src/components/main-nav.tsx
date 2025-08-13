
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'All Products', href: '/products' },
  { 
    name: 'Categories', 
    href: '/categories',
    subItems: [
        { name: 'SkinCare', href: '/categories/skincare' },
        { name: 'Lips', href: '/categories/lips' },
        { name: 'Bath & Body', href: '/categories/bath-body' },
        { name: 'Fragrances', href: '/categories/fragrances' },
        { name: 'Eyes', href: '/categories/eyes' },
        { name: 'Nails', href: '/categories/nails' },
    ]
  },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
];

export function MainNav() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="border-b bg-background shadow-sm sticky top-20 z-30">
      <div className="container mx-auto flex justify-center items-center h-12 px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center space-x-6 lg:space-x-10">
          {navItems.map((item) => (
            <li key={item.name}>
              {item.subItems && isClient ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 font-headline text-lg text-foreground/70 transition-colors hover:text-primary focus:outline-none">
                    {item.name}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.subItems.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link href={subItem.href}>{subItem.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href={item.href}
                  className="font-headline text-lg text-foreground/70 transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
