import { motion } from "framer-motion";

export const FounderStory = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/iconic-movie-frames/Roman-Holiday-Vespa-Tour.webp')] opacity-10 bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Story
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            AI Acting Coach was founded by a Drama School Alumni with a vision to revolutionize actor training. 
            Born from firsthand experience of the challenges faced by aspiring actors, our platform was created 
            with one goal in mind: to make every actor's journey more stable, interesting, and fun.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed mt-4">
            By combining traditional acting methodologies with cutting-edge AI technology, 
            we're making professional-level acting coaching accessible to everyone, 
            anywhere, anytime. Our mission is to support actors at every stage of their 
            journey, providing the tools and feedback needed to grow and excel in their craft.
          </p>
        </motion.div>
      </div>
    </section>
  );
};