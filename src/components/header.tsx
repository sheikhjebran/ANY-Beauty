
"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, User, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import debounce from 'lodash.debounce';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  hint?: string;
}

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  
  const updateCartCount = useCallback(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setCartCount(totalItems);
  },[]);
  
  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, [updateCartCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchResults([]);
        setSearchQuery('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const performSearch = async (searchVal: string) => {
    if (searchVal.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
        const productsRef = collection(db, "products");
        const lowercasedQuery = searchVal.toLowerCase();
        
        const nameQuery = query(productsRef, 
            where('name', '>=', lowercasedQuery), 
            where('name', '<=', lowercasedQuery + '\uf8ff')
        );

        const descriptionQuery = query(productsRef, 
            where('description', '>=', lowercasedQuery), 
            where('description', '<=', lowercasedQuery + '\uf8ff')
        );
        
        const nameSnapshot = await getDocs(nameQuery);
        const descriptionSnapshot = await getDocs(descriptionQuery);

        const combinedResults: { [key: string]: Product } = {};

        nameSnapshot.docs.forEach(doc => {
            if (!combinedResults[doc.id]) {
                combinedResults[doc.id] = { id: doc.id, ...doc.data() } as Product;
            }
        });
        descriptionSnapshot.docs.forEach(doc => {
             if (!combinedResults[doc.id]) {
                const productData = { id: doc.id, ...doc.data() } as Product;
                 if (productData.description.toLowerCase().includes(lowercasedQuery)) {
                    combinedResults[doc.id] = productData;
                 }
            }
        });
        
        const filteredProducts = Object.values(combinedResults);

        setSearchResults(filteredProducts);
    } catch (error) {
        console.error("Error performing search: ", error);
        setSearchResults([]);
    } finally {
        setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 500), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 3) {
      setIsSearching(true);
      debouncedSearch(query);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      debouncedSearch.cancel();
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
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
                isSearchOpen ? 'w-64 md:w-80 lg:w-96 opacity-100' : 'w-0 opacity-0'
              )}
            >
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={cn(
                  "pl-12 h-10 transition-all duration-300",
                  isSearchOpen ? 'opacity-100' : 'opacity-0'
                )}
              />
              {isSearchOpen && searchQuery && (
                <Button variant="ghost" size="icon" className="absolute right-0 h-10 w-10" onClick={clearSearch}>
                  <X className="h-4 w-4"/>
                </Button>
              )}
            </div>
             {isSearchOpen && (searchQuery.length >= 3) && (
              <div className="absolute top-full mt-2 w-64 md:w-80 lg:w-96 bg-background border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                   <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                   </div>
                ) : searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map(product => (
                      <li key={product.id}>
                        <Link href={`/products/${product.id}`} onClick={clearSearch} className="flex items-center gap-4 p-3 hover:bg-accent transition-colors">
                          <Image
                            src={product.images?.[0] || 'https://placehold.co/40x40.png'}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                            data-ai-hint={product.hint}
                          />
                          <div className="flex-grow">
                             <p className="font-semibold text-sm">{product.name}</p>
                             <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-sm text-muted-foreground text-center">No products found.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center w-1/3">
          <Link href="/" className="flex items-center gap-2 text-2xl md:text-3xl font-headline font-bold text-primary">
            <Image 
              src="/logo.png"
              alt="AYN Beauty Logo"
              width={60}
              height={60}
              className="rounded-full h-10 w-10 md:h-14 md:w-14"
            />
            <span>AYN Beauty</span>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-6 w-1/3">
          <Link href="/admin" aria-label="Admin Login">
            <User className="h-8 w-8 text-foreground/80 hover:text-primary transition-colors" />
          </Link>
          <Link href="/cart" className="relative" aria-label={`Shopping cart with ${cartCount} items`}>
            <ShoppingBag className="h-8 w-8 text-foreground/80 hover:text-primary transition-colors" />
            {cartCount > 0 && (
                <div className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {cartCount}
                </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
