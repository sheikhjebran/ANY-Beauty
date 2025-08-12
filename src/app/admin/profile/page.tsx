
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
  KeyRound,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuth, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { app } from '@/lib/firebase';


const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/inventory', icon: Package, label: 'Inventory' },
  { href: '/admin/customization', icon: Palette, label: 'Customization' },
  { href: '/admin/profile', icon: User, label: 'Profile' },
];

const passwordFormSchema = z.object({
  oldPassword: z.string().min(1, { message: "Old password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


function ProfileContent() {
    const { toast } = useToast();
    const auth = getAuth(app);
    const form = useForm<z.infer<typeof passwordFormSchema>>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    function onSubmit(data: z.infer<typeof passwordFormSchema>) {
        const user = auth.currentUser;
        if (!user || !user.email) {
            toast({ variant: 'destructive', title: 'Error', description: 'No user is signed in.' });
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, data.oldPassword);

        reauthenticateWithCredential(user, credential).then(() => {
            updatePassword(user, data.newPassword).then(() => {
                toast({
                    title: 'Success!',
                    description: 'Your password has been updated successfully.',
                });
                form.reset();
            }).catch((error) => {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: `Password update failed: ${error.message}`,
                });
            });
        }).catch((error) => {
            let errorMessage = "An unknown error occurred during re-authentication.";
             if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
               errorMessage = "Your old password is not correct.";
             } else {
                errorMessage = error.message
             }
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMessage,
            });
        });
    }
    
    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
        <Card className="w-full flex flex-col items-center justify-center text-center p-6 shadow-lg">
            <Avatar className="w-32 h-32 mb-4 border-4 border-primary">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop" alt="Admin" data-ai-hint="user avatar"/>
                <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold font-headline">Admin User</h2>
            <p className="text-muted-foreground">Administrator</p>
        </Card>

        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                    Update your password here. Make sure it's a strong one.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Old Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter your old password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter your new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Confirm your new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">
                            <KeyRound className="mr-2 h-4 w-4" />
                            Update Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    );
}


export default function ProfilePage() {
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
        console.error("Logout Failed: ", error)
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
            <h1 className="text-xl font-semibold text-primary">Profile</h1>
          </header>
          <main className="flex-grow p-6">
            <ProfileContent />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
