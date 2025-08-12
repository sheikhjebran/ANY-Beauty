
'use client';

import { useEffect, useState, useRef } from 'react';
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
  UploadCloud,
  X,
  GripVertical
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
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
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
  images: z.any().refine((files) => files?.length >= 1, 'At least one image is required.'),
});


function AddProductForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
        name: '',
        category: '',
        isBestSeller: false,
        price: 0,
        quantity: 0,
        images: undefined,
    }
  });

  const images = watch('images');

  useEffect(() => {
    if (images && images.length > 0) {
      const previews = Array.from(images).map((file: any) => URL.createObjectURL(file as Blob));
      setImagePreviews(previews);
      return () => previews.forEach(url => URL.revokeObjectURL(url));
    } else {
      setImagePreviews([]);
    }
  }, [images]);

  const removeImage = (indexToRemove: number) => {
    const currentImages = watch('images');
    const updatedImages = Array.from(currentImages).filter((_, index) => index !== indexToRemove);
    setValue('images', updatedImages, { shouldValidate: true });
  }

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const imageFile of data.images) {
        const storageRef = ref(storage, `products/${uuidv4()}-${(imageFile as File).name}`);
        await uploadBytes(storageRef, imageFile as Blob);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }

      if (imageUrls.length === 0) {
        imageUrls.push(`https://placehold.co/64x64.png?text=${data.name.charAt(0)}`);
      }

      const newProduct = {
        name: data.name,
        category: data.category,
        isBestSeller: data.isBestSeller,
        price: data.price * 100, // Store price in cents
        quantity: data.quantity,
        images: imageUrls,
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
  
  const fileRef = register("images");

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
                    <Input id="price" type="number" {...register('price')} placeholder="e.g. 5999" step="0.01" disabled={isSubmitting} />
                    {errors.price && <p className="text-sm text-destructive">{errors.price.message as string}</p>}
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" type="number" {...register('quantity')} placeholder="e.g. 100" disabled={isSubmitting} />
                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message as string}</p>}
                </div>
           </div>

          <div className="grid gap-3">
            <Label htmlFor="images">Product Images</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted border-border">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                </div>
                 <input 
                  id="dropzone-file" 
                  type="file" 
                  multiple 
                  className="hidden"
                  accept="image/*"
                  disabled={isSubmitting}
                  {...fileRef}
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files);
                      const currentFiles = watch('images') || [];
                      setValue('images', [...currentFiles, ...newFiles], { shouldValidate: true });
                    }
                  }}
                />
              </label>
            </div>
             {errors.images && <p className="text-sm text-destructive">{errors.images.message as string}</p>}

            {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mt-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-square">
                      <Image src={src} alt={`Preview ${index}`} fill className="rounded-md object-cover"/>
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="destructive" size="icon" type="button" onClick={() => removeImage(index)} disabled={isSubmitting}>
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                          Default
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            )}
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

    