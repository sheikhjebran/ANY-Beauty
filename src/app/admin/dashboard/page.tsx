
'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  LayoutDashboard,
  Package,
  Palette,
  User,
  PanelLeft,
  ShoppingBag,
  PackageX,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
  FilePenLine,
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
import { getAuth, signOut } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProductChart } from '@/components/product-chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/inventory', icon: Package, label: 'Inventory' },
  { href: '/admin/customization', icon: Palette, label: 'Customization' },
  { href: '/admin/profile', icon: User, label: 'Profile' },
];

function DashboardContent() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categoryData = useMemo(() => {
        const quantityPerCategory = products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + (product.quantity || 0);
            return acc;
        }, {} as { [key: string]: number });
        
        return Object.keys(quantityPerCategory).map(category => ({
            name: category,
            total: quantityPerCategory[category],
        }));
    }, [products]);

    const outOfStockProducts = useMemo(() => products.filter(p => p.quantity === 0), [products]);
    const lowStockProducts = useMemo(() => products.filter(p => p.quantity > 0 && p.quantity < 10), [products]);
    const bestSellers = useMemo(() => products.filter(p => p.isBestSeller), [products]);
    const recentlyAdded = useMemo(() => products.slice(0, 5), [products]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                    <CardTitle>Product Category Quantity</CardTitle>
                    <CardDescription>Total quantity of products in each category.</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ProductChart data={categoryData} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PackageX className="h-5 w-5 text-destructive" /> Out of Stock</CardTitle>
                    <CardDescription>Products with zero quantity.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductTable products={outOfStockProducts} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-yellow-500" /> Low Stock</CardTitle>
                    <CardDescription>Products with quantity less than 10.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductTable products={lowStockProducts} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" /> Best Sellers</CardTitle>
                    <CardDescription>Products marked as best sellers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductTable products={bestSellers} />
                </CardContent>
            </Card>
            
            <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Recently Added Products</CardTitle>
                    <CardDescription>The last 5 products added to your inventory.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductTable products={recentlyAdded} showCategory />
                </CardContent>
            </Card>
        </div>
    );
}

function ProductTable({ products, showCategory = false }: { products: any[], showCategory?: boolean }) {
    const router = useRouter();
    if (products.length === 0) {
        return <p className="text-sm text-muted-foreground">No products to display.</p>
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[64px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    {showCategory && <TableHead>Category</TableHead>}
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                             <Image
                                alt={product.name}
                                className="aspect-square rounded-md object-cover"
                                height="40"
                                src={product.images?.[0] || 'https://placehold.co/40x40.png'}
                                width="40"
                                data-ai-hint={product.hint}
                            />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        {showCategory && <TableCell>{product.category}</TableCell>}
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', currencyDisplay: 'symbol' }).format(product.price / 100)}</TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/inventory/edit/${product.id}`)}>
                                <FilePenLine className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function AdminDashboardPage() {
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
    return (
         <div className="flex min-h-screen bg-background items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
         </div>
    );
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
            <h1 className="text-xl font-semibold text-primary">Dashboard</h1>
          </header>
          <main className="flex-grow p-6">
            <DashboardContent />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
