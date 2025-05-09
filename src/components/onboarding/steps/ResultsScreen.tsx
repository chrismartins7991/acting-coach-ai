
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { analyzeAssessmentAnswers } from "@/utils/assessmentAnalysis";

interface ResultsScreenProps {
  onNext: () => void;
  assessmentAnswers?: Record<string, string>;
}

export const ResultsScreen = ({ onNext, assessmentAnswers = {} }: ResultsScreenProps) => {
  // Generate results based on assessment answers or use fallback data if no answers
  const results = Object.keys(assessmentAnswers).length > 0
    ? analyzeAssessmentAnswers(assessmentAnswers)
    : {
        total: 68,
        strengths: [
          { name: 'Character Development', score: 82 },
          { name: 'Emotional Connection', score: 78 },
        ],
        areasForGrowth: [
          { name: 'Voice Projection', score: 45 },
          { name: 'Physical Presence', score: 51 },
        ],
        recommendedFocus: [
          'Use our AI Reader tool to practice voice projection and modulation with guidance',
          'Record yourself in our Self-Tape Studio to analyze and improve your physical presence',
          'Continue your progress by practicing regularly with our Rehearsal Room tools',
        ],
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-6 sm:p-8"
    >
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Your Acting Profile</h2>
          <p className="text-base sm:text-lg text-gray-300">Here's what we've learned about your acting journey</p>
        </div>

        {/* Overall Score */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#333" 
                strokeWidth="8"
              />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#FFD700" 
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 45 * results.total / 100} ${2 * Math.PI * 45 * (1 - results.total / 100)}`}
                strokeDashoffset={2 * Math.PI * 45 * 0.25}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-3xl font-bold text-white">{results.total}</div>
              <div className="text-xs text-gray-400">OVERALL</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Strengths Section */}
          <div className="bg-black/30 p-4 sm:p-6 rounded-lg border border-theater-gold">
            <h3 className="text-lg sm:text-xl font-semibold text-theater-gold mb-4">Strengths</h3>
            <div className="space-y-4">
              {results.strengths.map((strength, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white">{strength.name}</span>
                    <span className="text-white">{strength.score}%</span>
                  </div>
                  <Progress value={strength.score} className="h-2 bg-neutral-800" />
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Growth Section */}
          <div className="bg-black/30 p-4 sm:p-6 rounded-lg border border-theater-gold">
            <h3 className="text-lg sm:text-xl font-semibold text-theater-gold mb-4">Areas for Growth</h3>
            <div className="space-y-4">
              {results.areasForGrowth.map((area, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white">{area.name}</span>
                    <span className="text-white">{area.score}%</span>
                  </div>
                  <Progress value={area.score} className="h-2 bg-neutral-800" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Focus Areas */}
        <div className="bg-black/30 p-4 sm:p-6 rounded-lg border border-theater-gold">
          <h3 className="text-lg sm:text-xl font-semibold text-theater-gold mb-3">Recommended App Features</h3>
          <ul className="space-y-2">
            {results.recommendedFocus.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 mt-2 mr-2 rounded-full bg-theater-gold"></div>
                <span className="text-white">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={onNext}
            className="w-full sm:w-auto bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-6 sm:px-8 py-3"
          >
            Set Your Goals
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
