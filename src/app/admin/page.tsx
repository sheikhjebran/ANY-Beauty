
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

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSignIn = () => {
    if (email === 'admin@gmail.com' && password === 'admin@123') {
      toast({
        title: "Login Successful",
        description: "Welcome, Admin!",
      });
      // In a real application, you would redirect to a protected admin dashboard.
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    }
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

  useEffect(() => {
    setIsClient(true)
  }, [])


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      {isClient ? <AdminLoginForm /> : null}
    </div>
  );
}
