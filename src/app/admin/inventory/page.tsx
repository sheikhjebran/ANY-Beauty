
'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Loader2,
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
import { app, db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
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
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/inventory', icon: Package, label: 'Inventory' },
  { href: '/admin/customization', icon: Palette, label: 'Customization' },
  { href: '/admin/profile', icon: User, label: 'Profile' },
];

function InventoryContent() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const { toast } = useToast();
    const router = useRouter();


    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
        } catch (error) {
            console.error("Error fetching products: ", error);
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not fetch products.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleBestSellerToggle = async (product: any, isChecked: boolean) => {
        const optimisticProducts = products.map(p => 
            p.id === product.id ? { ...p, isBestSeller: isChecked } : p
        );
        setProducts(optimisticProducts);

        try {
            const productRef = doc(db, "products", product.id);
            await updateDoc(productRef, {
                isBestSeller: isChecked
            });
            toast({
                title: 'Success!',
                description: `${product.name} has been updated.`,
            });
        } catch (error) {
            console.error("Error updating best seller status: ", error);
            // Revert optimistic update on error
            setProducts(products);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update best seller status.',
            });
        }
    };


    const handleDelete = async () => {
        if (!productToDelete) return;

        setIsDeleting(true);
        try {
            // Delete images from Firebase Storage
            if (productToDelete.images && productToDelete.images.length > 0) {
                for (const imageUrl of productToDelete.images) {
                    if (imageUrl.includes('firebasestorage.googleapis.com')) {
                        const imageRef = ref(storage, imageUrl);
                        await deleteObject(imageRef);
                    }
                }
            }

            // Delete product document from Firestore
            await deleteDoc(doc(db, "products", productToDelete.id));

            toast({
                title: 'Product Deleted',
                description: `${productToDelete.name} has been successfully deleted.`,
            });
            
            setProducts(products.filter(p => p.id !== productToDelete.id));

        } catch (error) {
            console.error("Error deleting product: ", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'There was a problem deleting the product.',
            });
        } finally {
            setIsDeleting(false);
            setProductToDelete(null);
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>Manage your products and their inventory levels.</CardDescription>
                    </div>
                    <Button asChild>
                    <Link href="/admin/inventory/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Product
                    </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-center">Best Seller</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product: any) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <Image
                                                alt={product.name}
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                src={product.images?.[0] || 'https://placehold.co/64x64.png'}
                                                width="64"
                                                data-ai-hint={product.hint}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={product.isBestSeller}
                                                onCheckedChange={(isChecked) => handleBestSellerToggle(product, isChecked)}
                                                aria-label="Toggle best seller status"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', currencyDisplay: 'symbol' }).format(product.price / 100)}
                                        </TableCell>
                                        <TableCell className="text-right">{product.quantity}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link href={`/admin/inventory/edit/${product.id}`}>
                                                        <FilePenLine className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Link>
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => setProductToDelete(product)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product
                        "{productToDelete?.name}" and all its associated images from the servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
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
                    isActive={pathname.startsWith(item.href)}
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
