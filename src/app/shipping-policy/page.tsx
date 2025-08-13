import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Delivery Information</h2>
              <p className="mb-4">
                We strive to deliver your orders as quickly and efficiently as possible. Here&apos;s what you need to know about our shipping process:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Standard shipping: 3-5 business days</li>
                <li>Express shipping: 1-2 business days</li>
                <li>Free shipping on orders over $50</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Shipping Methods</h2>
              <p className="mb-4">
                We offer various shipping methods to accommodate your needs:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Standard Ground Shipping</li>
                <li>Express Shipping</li>
                <li>International Shipping</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Tracking Your Order</h2>
              <p>
                Once your order is shipped, you will receive a confirmation email with tracking information.
                You can track your order status through our website or the shipping carrier&apos;s website.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
