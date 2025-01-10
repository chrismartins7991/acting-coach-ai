import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";

const Index = () => {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-black to-theater-purple/90">
      <Hero />
      <Features />
    </main>
  );
};

export default Index;