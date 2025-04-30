import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogPostComponent from '@/components/blog/BlogPost';

const BlogPost: React.FC = () => {
  return (
    <AppLayout>
      <Header />
      <main>
        <BlogPostComponent />
      </main>
      <Footer />
    </AppLayout>
  );
};

export default BlogPost;