import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";

const Index = () => {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-black to-theater-purple/90 relative overflow-hidden">
      <div className="relative z-10">
        <Hero />
        <Features />
      </div>
    </main>
  );
};

export default Index;