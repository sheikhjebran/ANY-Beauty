"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);


  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Search */}
        <div className="flex items-center w-1/3" ref={searchRef}>
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
              className="z-20"
            >
              <Search className="h-8 w-8" />
            </Button>
            <div
              className={cn(
                'absolute left-0 transition-all duration-300 ease-in-out flex items-center',
                isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
              )}
            >
               <Input
                type="search"
                placeholder="Search..."
                className={cn(
                  "pl-12 h-10 transition-all duration-300",
                  isSearchOpen ? 'opacity-100' : 'opacity-0'
                )}
              />
            </div>
          </div>
        </div>

        {/* Center Section: Logo */}
        <div className="flex justify-center w-1/3">
          <Link href="/" className="text-3xl font-headline font-bold text-primary">
            AYN Beauty
          </Link>
        </div>

        {/* Right Section: Icons */}
        <div className="flex items-center justify-end gap-6 w-1/3">
          <Link href="/admin" aria-label="Admin Login">
            <User className="h-8 w-8 text-foreground/80 hover:text-primary transition-colors" />
          </Link>
          <Link href="/cart" className="relative" aria-label={`Shopping cart with ${cartCount} items`}>
            <ShoppingCart className="h-8 w-8 text-foreground/80 hover:text-primary transition-colors" />
            <div className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {cartCount}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
