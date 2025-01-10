import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { SparklesCore } from "@/components/ui/sparkles";

const Index = () => {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-black to-theater-purple/90 relative overflow-hidden">
      {/* Top sparkles */}
      <div className="absolute top-0 left-0 w-full h-96 opacity-40 pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.2}
          maxSize={0.8}
          particleDensity={70}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </div>

      {/* Bottom right sparkles */}
      <div className="absolute right-0 bottom-0 w-96 h-96 opacity-30 pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.1}
          maxSize={0.6}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </div>

      <div className="relative z-10">
        <Hero />
        <Features />
      </div>
    </main>
  );
};

export default Index;