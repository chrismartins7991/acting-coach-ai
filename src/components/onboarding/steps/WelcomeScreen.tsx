
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { testimonials } from "@/components/testimonials/testimonialsData";

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const controls = useAnimation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate testimonials
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const nextIndex = (activeTestimonial + 1) % testimonials.length;
      setActiveTestimonial(nextIndex);
      controls.start({
        opacity: [0.6, 1],
        scale: [0.9, 1],
        transition: { duration: 0.5 }
      });
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTestimonial, controls]);

  return (
    <div 
      className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-black"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=1200" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/80 to-black"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between px-4 py-8 sm:py-12">
        {/* Logo Section */}
        <div className="flex justify-center items-center mb-8">
          <div className="flex items-center">
            <span className="text-6xl text-theater-gold font-bold mr-1">AI</span>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl text-white font-bold tracking-wider">ACTING</span>
              <span className="text-lg sm:text-xl text-white font-bold tracking-[0.5em]">STUDIO</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-6 mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Your Personal Path to Stardom
          </h1>
          
          <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto">
            Powered by advanced AI that understands the art of performance
          </p>
          
          <div className="flex flex-col space-y-1 items-center mt-8">
            <span className="text-md sm:text-lg text-gray-300 font-semibold tracking-wide">AI Selftape Guidance</span>
            <span className="text-md sm:text-lg text-gray-300 font-semibold tracking-wide">AI Cold Reader</span>
            <span className="text-md sm:text-lg text-gray-300 font-semibold tracking-wide">AI Acting Coach</span>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="w-full max-w-3xl mx-auto mb-12">
          <motion.div
            animate={controls}
            initial={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6 mx-auto max-w-lg"
          >
            <div className="flex items-center mb-4">
              <img 
                src={testimonials[activeTestimonial].image} 
                alt={testimonials[activeTestimonial].name} 
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <div className="text-white font-semibold">{testimonials[activeTestimonial].name}</div>
                <div className="text-gray-400 text-sm">{testimonials[activeTestimonial].role}</div>
              </div>
            </div>
            
            <div className="flex mb-2">
              {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-theater-gold text-theater-gold" />
              ))}
            </div>
            
            <p className="text-gray-300 text-sm">{testimonials[activeTestimonial].text}</p>
          </motion.div>
          
          {/* Dots for pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2 h-2 rounded-full ${
                  activeTestimonial === index ? "bg-theater-gold" : "bg-gray-600"
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="w-full max-w-md mx-auto space-y-3">
          <Button 
            onClick={onNext}
            className="w-full bg-theater-gold hover:bg-theater-gold/90 text-black font-bold py-4"
            size="lg"
          >
            Start Your Journey
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/login'}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
            size="lg"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
};
