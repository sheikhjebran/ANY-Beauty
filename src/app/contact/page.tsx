
'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MainNav } from '@/components/main-nav';
import { Mail, Phone, MapPin } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z
    .string()
    .min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters.' })
    .max(500, { message: 'Message must not exceed 500 characters.' }),
});

export default function ContactPage() {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  function onSubmit(data: z.infer<typeof contactFormSchema>) {
    toast({
      title: 'Form Submitted!',
      description: 'Thank you for your message. We will get back to you soon.',
    });
    console.log(data);
    form.reset();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <MainNav />
      <main className="flex-grow">
        <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We'd love to hear from you. Whether you have a question about our
              products, pricing, or anything else, our team is ready to answer
              all your questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-headline font-semibold mb-4">
                  Get in Touch
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <a
                        href="mailto:aynbeautyweb@gmail.com"
                        className="hover:text-primary transition-colors"
                      >
                        aynbeautyweb@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Phone</h4>
                      <a
                        href="tel:+917019449136"
                        className="hover:text-primary transition-colors"
                      >
                        +91 7019449136
                      </a>
                    </div>
                  </div>
                   <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground">Our Location</h4>
                      <p>123 Beauty Lane, Glamour City, 110011</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-headline font-semibold mb-4">
                  Find Us Here
                </h3>
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border">
                   <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.175217997933!2d77.2177573150821!3d28.62450598242075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3ed2da5a29%3A0x1b02131234567890!2sIndia%20Gate!5e0!3m2!1sen!2sin!4v1622612345678!5m2!1sen!2sin"
                    width="100%"
                    height="350"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    title="Company Location"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg border">
              <h3 className="text-2xl font-headline font-semibold mb-6">
                Send us a Message
              </h3>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="jane.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Question about a product"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us what's on your mind..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg">
                    Send Message
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
