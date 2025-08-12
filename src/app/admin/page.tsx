
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';

function AdminLoginForm() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        });
        router.push('/admin/dashboard');
      })
      .catch((error) => {
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = "Invalid email or password.";
        } else {
          errorMessage = error.message;
        }
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorMessage,
        });
      });
  };

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-headline">Admin Access</CardTitle>
        <CardDescription>
          Please sign in to manage your store.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@gmail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <Button className="w-full" onClick={handleSignIn}>Sign In</Button>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          &larr; Back to AYN Beauty
        </Link>
      </CardFooter>
    </Card>
  );
}


export default function AdminLoginPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter();

  useEffect(() => {
    setIsClient(true)
    // If user is already authenticated, redirect to dashboard
    if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
      router.replace('/admin/dashboard');
    }
  }, [router])


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {isClient ? <AdminLoginForm /> : null}
    </div>
  );
}
