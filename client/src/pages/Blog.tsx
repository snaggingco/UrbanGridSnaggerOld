import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogListing from '@/components/blog/BlogListing';

const Blog: React.FC = () => {
  return (
    <AppLayout
      title="Property Snagging Blog | Expert Advice from Urban Grid"
      description="Expert advice on property snagging, inspection services, and real estate quality control in Dubai and the UAE."
    >
      <Header />
      <main>
        <BlogListing />
      </main>
      <Footer />
    </AppLayout>
  );
};

export default Blog;