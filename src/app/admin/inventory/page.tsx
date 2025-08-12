
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  LayoutDashboard,
  Package,
  Palette,
  User,
  PanelLeft,
  PlusCircle,
  FilePenLine,
  Trash2,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/inventory', icon: Package, label: 'Inventory' },
  { href: '/admin/customization', icon: Palette, label: 'Customization' },
  { href: '/admin/profile', icon: User, label: 'Profile' },
];

const products = [
  {
    image: 'https://placehold.co/64x64.png',
    hint: 'serum bottle',
    name: 'Radiant Glow Serum',
    category: 'Skincare',
    isBestSeller: true,
    price: 5999,
    quantity: 25,
  },
  {
    image: 'https://placehold.co/64x64.png',
    hint: 'lipstick product',
    name: 'Velvet Touch Lipstick',
    category: 'Lips',
    isBestSeller: false,
    price: 2499,
    quantity: 0,
  },
  {
    image: 'https://placehold.co/64x64.png',
    hint: 'foundation cosmetics',
    name: 'Silk Finish Foundation',
    category: 'Face',
    isBestSeller: true,
    price: 4500,
    quantity: 5,
  },
  {
    image: 'https://placehold.co/64x64.png',
    hint: 'face cream',
    name: 'Night Repair Cream',
    category: 'Skincare',
    isBestSeller: false,
    price: 6800,
    quantity: 50,
  },
   {
    image: 'https://placehold.co/64x64.png',
    hint: 'face mist',
    name: 'Hydrating Face Mist',
    category: 'Skincare',
    isBestSeller: true,
    price: 1999,
    quantity: 100,
  },
];

function InventoryContent() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage your products and their inventory levels.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Product
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-center">Best Seller</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.name}>
                                <TableCell>
                                    <Image
                                        alt={product.name}
                                        className="aspect-square rounded-md object-cover"
                                        height="64"
                                        src={product.image}
                                        width="64"
                                        data-ai-hint={product.hint}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell className="text-center">
                                    <Switch
                                        checked={product.isBestSeller}
                                        aria-label="Toggle best seller status"
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price / 100)}
                                </TableCell>
                                <TableCell className="text-right">{product.quantity}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon">
                                            <FilePenLine className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Button>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default function InventoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    setIsClient(true);
    const isAuthenticated =
      sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.replace('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      sessionStorage.removeItem('isAdminAuthenticated');
      router.push('/admin');
    }).catch((error) => {
        console.error("Logout failed:", error)
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-2xl font-bold text-primary px-2">AYN Beauty</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
            </SidebarTrigger>
            <h1 className="text-xl font-semibold text-primary">Inventory</h1>
          </header>
          <main className="flex-grow p-6">
            <InventoryContent />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
