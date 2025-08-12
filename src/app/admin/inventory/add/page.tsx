
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
  ArrowLeft,
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
import { getAuth, signOut } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/inventory', icon: Package, label: 'Inventory' },
  { href: '/admin/customization', icon: Palette, label: 'Customization' },
  { href: '/admin/profile', icon: User, label: 'Profile' },
];

const categories = ['Skincare', 'Lips', 'Face', 'Eyes', 'Nails', 'Bath & Body', 'Fragrances'];

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  isBestSeller: z.boolean(),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be a positive number')
  ),
  quantity: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().nonnegative('Quantity must be a non-negative integer')
  ),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});


function AddProductForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
        name: '',
        category: '',
        isBestSeller: false,
        price: 0,
        quantity: 0,
        image: '',
    }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const newProduct = {
        ...data,
        price: data.price * 100, // Store price in cents
        image: data.image || `https://placehold.co/64x64.png?text=${data.name.charAt(0)}`,
        hint: `${data.name.toLowerCase()} product`,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "products"), newProduct);

      toast({
        title: 'Product Added!',
        description: `${data.name} has been added to your inventory.`,
      });
      
      router.push('/admin/inventory');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem adding the product. Please try again.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
        <CardDescription>Fill out the details below to add a new product to your inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Radiant Glow Serum" disabled={isSubmitting} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="category">Category</Label>
             <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message as string}</p>}
          </div>

           <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" type="number" {...register('price')} placeholder="e.g. 59.99" step="0.01" disabled={isSubmitting} />
                    {errors.price && <p className="text-sm text-destructive">{errors.price.message as string}</p>}
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" {...register('quantity')} placeholder="e.g. 100" disabled={isSubmitting} />
                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message as string}</p>}
                </div>
           </div>

           <div className="grid gap-3">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" {...register('image')} placeholder="https://your-image-url.com/image.png" disabled={isSubmitting} />
                {errors.image && <p className="text-sm text-destructive">{errors.image.message as string}</p>}
           </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="isBestSeller" className="flex-shrink-0">Best Seller</Label>
            <Controller
                name="isBestSeller"
                control={control}
                render={({ field }) => (
                    <Switch
                        id="isBestSeller"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                    />
                )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href="/admin/inventory">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


export default function AddProductPage() {
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
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/admin/inventory">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold text-primary">Add New Product</h1>
            </div>
          </header>
          <main className="flex-grow p-6">
            <AddProductForm />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
