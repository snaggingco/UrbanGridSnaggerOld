import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    quote: "The UrbanGrid team conducted a thorough RERA audit of our property with exceptional attention to detail. The reserve fund analysis helps us plan our community's finances with confidence.",
    author: "Mohammed Al Shamsi",
    position: "HOA President, Marina Heights",
    rating: 5,
    image: "/assets/testimonials/avatar-1.jpg"
  },
  {
    id: 2,
    quote: "Their condition survey identified critical issues we hadn't noticed before. The comprehensive report and clear recommendations saved us from potential major expenses down the line.",
    author: "Sarah Johnson",
    position: "Property Manager, Downtown Views",
    rating: 5,
    image: "/assets/testimonials/avatar-2.jpg"
  },
  {
    id: 3,
    quote: "We've been using UrbanGrid for all our inspection needs. Their RERA audit service is highly professional and their RICS NRM3 classification approach provides excellent insights for our building maintenance.",
    author: "Ahmed Qureshi",
    position: "Facilities Director, Palm Residences",
    rating: 5,
    image: "/assets/testimonials/avatar-3.jpg"
  }
];

export default function TestimonialSection({ 
  title = "What Our Clients Say",
  subtitle = "Read testimonials from property managers and owners who trust our inspection services"
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 relative">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 border-4 border-primary/10">
                <img 
                  src={testimonials[activeIndex].image} 
                  alt={testimonials[activeIndex].author} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <div className="flex mb-4">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-lg md:text-xl text-gray-700 italic mb-6">
                  "{testimonials[activeIndex].quote}"
                </blockquote>
                
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonials[activeIndex].author}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonials[activeIndex].position}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevTestimonial}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === activeIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextTestimonial}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}