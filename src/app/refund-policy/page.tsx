import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Exchange and Refund Policy</h1>
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
          <p className="mb-4">
            We want you to be completely satisfied with your purchase. If you&apos;re not happy with your order, you can return it within 30 days of delivery.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Items must be unused and in original packaging</li>
            <li>Original receipt or proof of purchase required</li>
            <li>Refunds will be processed within 5-7 business days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Exchange Process</h2>
          <p className="mb-4">
            To exchange an item:
          </p>
          <ol className="list-decimal pl-6 mb-4">
            <li>Contact our customer service</li>
            <li>Obtain a return authorization number</li>
            <li>Send the item back using our return label</li>
            <li>Choose your replacement item</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Non-Returnable Items</h2>
          <p className="mb-4">
            For hygiene and safety reasons, the following items cannot be returned:
          </p>
          <ul className="list-disc pl-6">
            <li>Opened cosmetics</li>
            <li>Personal care items</li>
            <li>Sale items marked as final sale</li>
          </ul>
        </section>
      </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
