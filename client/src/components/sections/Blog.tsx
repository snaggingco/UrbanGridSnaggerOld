import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/blogData";

export default function Blog() {
  return (
    <section className="py-24 bg-white">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6"
      >
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-4xl font-normal mb-4">Latest Insights</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Expert property inspection guides and market insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <motion.div
              key={post.slug}
              variants={fadeIn}
              className="group"
            >
              <Card 
                className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => window.location.href = `/blog/${post.slug}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#34A853] font-medium">{post.category}</span>
                    <span className="text-sm text-muted-foreground">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-xl font-normal group-hover:text-[#34A853] transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {post.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeIn} className="text-center mt-16">
          <Button 
            variant="outline" 
            size="lg"
            className="gap-2 rounded-full border-2 hover:bg-gray-50"
            asChild
          >
            <a href="/blog">
              View All Articles
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}