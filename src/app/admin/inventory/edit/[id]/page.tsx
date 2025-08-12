
'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
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
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
import { Skeleton } from '@/components/ui/skeleton';


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
  images: z.any().optional(),
});


function EditProductForm() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

    const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            category: '',
            isBestSeller: false,
            price: 0,
            quantity: 0,
            images: [],
        }
    });

    const newImageFiles = watch('images');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            setIsLoading(true);
            try {
                const docRef = doc(db, 'products', productId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const productData = docSnap.data();
                    reset({
                        ...productData,
                        price: (productData.price / 100).toFixed(2), // Convert from cents
                        images: [], // Don't load existing images into the file input
                    });
                    const imageUrls = productData.images || [];
                    setExistingImageUrls(imageUrls);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Product not found.',
                    });
                    router.push('/admin/inventory');
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to fetch product data.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productId, reset, router, toast]);

    useEffect(() => {
        const newPreviews = newImageFiles ? Array.from(newImageFiles).filter((file: any) => file instanceof File).map((file: any) => URL.createObjectURL(file)) : [];
        setImagePreviews([...existingImageUrls, ...newPreviews]);
        
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newImageFiles, existingImageUrls]);


    const removeImage = (indexToRemove: number) => {
        const imageUrlToRemove = imagePreviews[indexToRemove];
        
        // Check if it's an existing image url
        const existingUrlIndex = existingImageUrls.indexOf(imageUrlToRemove);
        if (existingUrlIndex > -1) {
            setExistingImageUrls(prev => prev.filter(url => url !== imageUrlToRemove));
            // If it's a firebase storage url, add to removal queue
            if (imageUrlToRemove.includes('firebasestorage.googleapis.com')) {
                setImagesToRemove(prev => [...prev, imageUrlToRemove]);
            }
        } else {
             // It's a new file preview, remove it from the form's file list
            const updatedFiles = Array.from(newImageFiles || []).filter((_, i) => {
                // This is a bit of a hack, but we find the corresponding blob url to remove
                const url = URL.createObjectURL(_ as Blob);
                const match = url === imageUrlToRemove;
                URL.revokeObjectURL(url); // clean up immediately
                return !match;
            });

             // We need to find the correct file to remove from the FileList
             const dataTransfer = new DataTransfer();
             const currentFiles = Array.from(watch('images') || []);
             const urlMap = new Map(currentFiles.map(file => [URL.createObjectURL(file), file]));
             
             let fileToRemove: File | undefined;
             urlMap.forEach((file, url) => {
                 if (url === imageUrlToRemove) {
                    fileToRemove = file;
                 }
                 URL.revokeObjectURL(url);
             });
 
             if(fileToRemove) {
                const newFiles = currentFiles.filter(f => f !== fileToRemove);
                newFiles.forEach(file => dataTransfer.items.add(file));
                setValue('images', dataTransfer.files, { shouldValidate: true });
             }
        }
    }


    const onSubmit = async (data: z.infer<typeof productSchema>) => {
        setIsSubmitting(true);
        try {
            // Delete images marked for removal
            for (const imageUrl of imagesToRemove) {
                try {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                } catch (error) {
                    console.warn(`Failed to delete image ${imageUrl}:`, error);
                }
            }

            const uploadedImageUrls: string[] = [];
            // Upload new images
            if (data.images && data.images.length > 0) {
                for (const imageFile of data.images) {
                    if (imageFile instanceof File) {
                        const storageRef = ref(storage, `products/${uuidv4()}-${imageFile.name}`);
                        await uploadBytes(storageRef, imageFile);
                        const downloadURL = await getDownloadURL(storageRef);
                        uploadedImageUrls.push(downloadURL);
                    }
                }
            }

            const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

            if (finalImageUrls.length === 0) {
                finalImageUrls.push(`https://placehold.co/400x400.png?text=${encodeURIComponent(data.name)}`);
            }

            const updatedProduct = {
                name: data.name,
                category: data.category,
                isBestSeller: data.isBestSeller,
                price: Math.round(data.price * 100), // Store price in cents
                quantity: data.quantity,
                images: finalImageUrls,
                hint: `${data.name.toLowerCase()} product`,
            };

            const docRef = doc(db, 'products', productId);
            await updateDoc(docRef, updatedProduct);

            toast({
                title: 'Product Updated!',
                description: `${data.name} has been updated.`,
            });
            
            router.push('/admin/inventory');
        } catch (error) {
            console.error("Error updating document: ", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'There was a problem updating the product. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const fileRef = register("images");

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                     <Skeleton className="h-8 w-1/2" />
                     <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="grid gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="grid gap-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-11 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                     <div className="flex justify-end gap-2">
                         <Skeleton className="h-10 w-24" />
                         <Skeleton className="h-10 w-24" />
                    </div>
                </CardContent>
            </Card>
        )
    }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>Update the details for this product.</CardDescription>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-xs text-muted-foreground">Add more images. The first image is the default.</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    multiple 
                    className="hidden"
                    accept="image/*"
                    disabled={isSubmitting}
                    {...fileRef}
                  />
                </label>
              </div>
              {errors.images && <p className="text-sm text-destructive">{errors.images.message as string}</p>}

              {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((src, index) => (
                      <div key={src} className="relative group aspect-square">
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
              <Label htmlFor="isBestSeller" className="flex-shrink-0">Mark as Best Seller</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild disabled={isSubmitting}>
                  <Link href="/admin/inventory">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


export default function EditProductPage() {
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
                    isActive={pathname.startsWith('/admin/inventory')}
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
                <h1 className="text-xl font-semibold text-primary">Edit Product</h1>
            </div>
          </header>
          <main className="flex-grow p-6">
            <EditProductForm />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

