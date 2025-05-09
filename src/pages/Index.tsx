import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { WhyUseSection } from "@/components/WhyUseSection";
import { IconicCoachesSection } from "@/components/IconicCoachesSection";
import { LearningProcess } from "@/components/learning-process/LearningProcess";
import { OscarWinnersCarousel } from "@/components/OscarWinnersCarousel";
import { Testimonials } from "@/components/Testimonials";
import { CTASection } from "@/components/CTASection";
import { FounderStory } from "@/components/FounderStory";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLoginTransition = () => {
    const element = document.getElementById('landing-container');
    if (element) {
      element.classList.add('transitioning');
    }
    
    setTimeout(() => {
      navigate('/dashboard', { state: { fromLanding: true } });
    }, 1000);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main 
        id="landing-container"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen w-full bg-gradient-to-b from-black to-theater-purple/90 relative overflow-hidden"
      >
        <div className="relative z-10">
          <Hero />
          <LearningProcess />
          <IconicCoachesSection />
          <Features />
          <WhyUseSection />
          <OscarWinnersCarousel />
          <Testimonials />
          <CTASection onGetStarted={handleLoginTransition} />
          <FounderStory />
        </div>
      </motion.main>
    </AnimatePresence>
  );
};

export default Index;