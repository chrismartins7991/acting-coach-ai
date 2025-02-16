
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ResultsOverviewProps {
  onNext: () => void;
}

export const ResultsOverview = ({ onNext }: ResultsOverviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Your Acting Profile</h2>
        <p className="text-gray-300">Here's what we've learned about your acting journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/30 p-6 rounded-lg border border-theater-gold">
          <h3 className="text-xl font-semibold text-theater-gold mb-3">Strengths</h3>
          <ul className="space-y-2 text-white">
            <li>• Strong emotional range</li>
            <li>• Natural stage presence</li>
            <li>• Quick character adaptation</li>
          </ul>
        </div>

        <div className="bg-black/30 p-6 rounded-lg border border-theater-gold">
          <h3 className="text-xl font-semibold text-theater-gold mb-3">Areas for Growth</h3>
          <ul className="space-y-2 text-white">
            <li>• Voice projection techniques</li>
            <li>• Physical movement awareness</li>
            <li>• Script analysis skills</li>
          </ul>
        </div>
      </div>

      <div className="bg-black/30 p-6 rounded-lg border border-theater-gold">
        <h3 className="text-xl font-semibold text-theater-gold mb-3">Recommended Focus Areas</h3>
        <p className="text-white">
          Based on your profile, we recommend focusing on voice work and movement techniques. 
          These areas will help you develop a stronger stage presence and more versatile performance style.
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          className="bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-8 py-3"
        >
          Set Your Goals
        </Button>
      </div>
    </motion.div>
  );
};
