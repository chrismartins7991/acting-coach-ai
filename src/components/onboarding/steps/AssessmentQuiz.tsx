
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
}

const assessmentQuestions: Question[] = [
  {
    id: "technique",
    text: "How comfortable are you with different acting techniques?",
    options: [
      { id: "beginner", text: "I know very little about acting techniques" },
      { id: "familiar", text: "I'm familiar with some basic techniques" },
      { id: "comfortable", text: "I'm comfortable with several techniques" },
      { id: "expert", text: "I have mastered multiple techniques" }
    ]
  },
  {
    id: "improvisation",
    text: "How would you rate your improvisation skills?",
    options: [
      { id: "nervous", text: "I get nervous when improvising" },
      { id: "basic", text: "I can handle basic improvisation" },
      { id: "good_improv", text: "I'm quite good at thinking on my feet" },
      { id: "excellent_improv", text: "Improvisation is one of my strengths" }
    ]
  },
  {
    id: "emotion",
    text: "How easily can you access and express emotions?",
    options: [
      { id: "difficult", text: "I find it difficult to express emotions" },
      { id: "somewhat_emotion", text: "I can express some emotions convincingly" },
      { id: "most", text: "I can express most emotions effectively" },
      { id: "all", text: "I can access and express all emotions authentically" }
    ]
  },
  {
    id: "voice",
    text: "How would you rate your vocal control and projection?",
    options: [
      { id: "limited", text: "My vocal control is limited" },
      { id: "developing", text: "I'm working on improving my vocal skills" },
      { id: "good_voice", text: "I have good vocal control in most situations" },
      { id: "excellent_voice", text: "My vocal control and projection are excellent" }
    ]
  },
  {
    id: "physical",
    text: "How comfortable are you with physical aspects of acting?",
    options: [
      { id: "uncomfortable", text: "I'm uncomfortable with physical expression" },
      { id: "somewhat_physical", text: "I'm somewhat comfortable with basic movement" },
      { id: "comfortable_physical", text: "I'm comfortable with most physical requirements" },
      { id: "very", text: "Physical expression is one of my strengths" }
    ]
  },
  // New question about acting methods
  {
    id: "methods",
    text: "How familiar are you with different acting methods (Stanislavski, Meisner, Strasberg, etc.)?",
    options: [
      { id: "unfamiliar", text: "I'm not familiar with specific acting methods" },
      { id: "basic_knowledge", text: "I know about them but haven't studied in depth" },
      { id: "some_training", text: "I've studied one or two methods formally" },
      { id: "method_expert", text: "I'm well-versed in multiple acting methods" }
    ]
  },
  // New question about private coaching
  {
    id: "coaching",
    text: "Have you worked with a dedicated private acting coach before?",
    options: [
      { id: "never", text: "Never had private coaching" },
      { id: "briefly", text: "Had a few sessions but not regularly" },
      { id: "periodically", text: "Work with a coach periodically" },
      { id: "regularly", text: "Work with a coach regularly" }
    ]
  },
  // Self-tape question
  {
    id: "selftape",
    text: "How experienced are you with creating self-tape auditions?",
    options: [
      { id: "novice", text: "I've never created a self-tape before" },
      { id: "basic_selftape", text: "I've created a few self-tapes but struggle with technical aspects" },
      { id: "intermediate", text: "I can create good quality self-tapes with proper setup" },
      { id: "advanced", text: "I consistently create professional-quality self-tapes" }
    ]
  },
  // Auditioning question
  {
    id: "audition",
    text: "How confident are you in your auditioning skills?",
    options: [
      { id: "nervous_audition", text: "I get very nervous and it affects my performance" },
      { id: "learning", text: "I'm learning to manage my nerves during auditions" },
      { id: "confident", text: "I'm confident in most audition situations" },
      { id: "very_confident", text: "I excel in auditions and consistently perform well" }
    ]
  },
  // Practice methods question
  {
    id: "practice",
    text: "Which acting practice methods do you use regularly?",
    options: [
      { id: "minimal", text: "I rarely use specific practice methods" },
      { id: "some_methods", text: "I occasionally use memorization or cold reading practice" },
      { id: "regular", text: "I regularly practice using various methods" },
      { id: "comprehensive", text: "I have a comprehensive practice routine incorporating multiple methods" }
    ]
  }
];

interface AssessmentQuizProps {
  onNext: (answers: Record<string, string>) => void;
}

export const AssessmentQuiz = ({ onNext }: AssessmentQuizProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const totalQuestions = assessmentQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    // Auto-advance after selection
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };
  
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canContinue = answers[currentQuestion.id] !== undefined;
  
  const handleComplete = () => {
    onNext(answers);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-6 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Acting Assessment</h2>
            <span className="text-gray-400 text-sm">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
          
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-theater-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <h3 className="text-xl text-white font-semibold">
            {currentQuestion.text}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all
                    ${answers[currentQuestion.id] === option.id
                      ? "border-theater-gold bg-neutral-800"
                      : "border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
                    }`}
                >
                  <span className="text-white">{option.text}</span>
                </button>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between mt-8">
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            {isLastQuestion && (
              <Button
                onClick={handleComplete}
                disabled={!canContinue}
                className="bg-theater-gold hover:bg-theater-gold/90 text-black font-bold"
              >
                Complete Assessment
              </Button>
            )}
            
            {!isLastQuestion && (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                disabled={!canContinue}
                className="bg-theater-gold hover:bg-theater-gold/90 text-black font-bold"
              >
                Next
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
