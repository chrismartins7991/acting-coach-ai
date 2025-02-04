
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

interface Preferences {
  emotionInVoice: boolean;
  voiceExpressiveness: boolean;
  physicalPresence: boolean;
  faceExpressions: boolean;
  clearnessOfDiction: boolean;
}

interface PreferencesFormProps {
  preferences: Preferences;
  onTogglePreference: (preference: keyof Preferences) => void;
  onSave: () => void;
}

export const PreferencesForm = ({ preferences, onTogglePreference, onSave }: PreferencesFormProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-black/30 p-8 rounded-lg border border-theater-gold"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Analysis Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white">Emotion in Voice</span>
          <Toggle 
            pressed={preferences.emotionInVoice}
            onPressedChange={() => onTogglePreference('emotionInVoice')}
            className="bg-purple-700 data-[state=on]:bg-theater-gold"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white">Voice Expressiveness</span>
          <Toggle 
            pressed={preferences.voiceExpressiveness}
            onPressedChange={() => onTogglePreference('voiceExpressiveness')}
            className="bg-blue-700 data-[state=on]:bg-theater-gold"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white">Physical Presence</span>
          <Toggle 
            pressed={preferences.physicalPresence}
            onPressedChange={() => onTogglePreference('physicalPresence')}
            className="bg-red-700 data-[state=on]:bg-theater-gold"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white">Face Expressions</span>
          <Toggle 
            pressed={preferences.faceExpressions}
            onPressedChange={() => onTogglePreference('faceExpressions')}
            className="bg-green-700 data-[state=on]:bg-theater-gold"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white">Clearness of Diction</span>
          <Toggle 
            pressed={preferences.clearnessOfDiction}
            onPressedChange={() => onTogglePreference('clearnessOfDiction')}
            className="bg-yellow-700 data-[state=on]:bg-theater-gold"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <Button
          onClick={onSave}
          className="bg-theater-gold hover:bg-theater-gold/80 text-black font-semibold px-8 py-2 rounded-full transform transition-all duration-300 hover:scale-105"
        >
          Save Preferences & Continue
        </Button>
      </div>
    </motion.div>
  );
};
