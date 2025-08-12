
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Footer } from '@/components/footer';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.replace('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    router.push('/admin');
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">AYN Beauty Admin</h1>
            <Button onClick={handleLogout} variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
            <h2 className="text-4xl font-headline font-bold">Admin Dashboard</h2>
            <p className="text-lg text-muted-foreground">
              Welcome, Admin! You can manage your store from here.
            </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
