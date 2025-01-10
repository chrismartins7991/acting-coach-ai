import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";

const Index = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-theater-purple/90">
      <div className="container mx-auto px-4">
        <Hero />
        <Features />
      </div>
    </main>
  );
};

export default Index;