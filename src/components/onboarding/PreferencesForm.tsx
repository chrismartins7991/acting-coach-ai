
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
      className="max-w-2xl mx-auto bg-black/30 p-4 sm:p-8 rounded-lg border border-theater-gold"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Analysis Preferences</h2>
      <div className="space-y-4">
        {[
          { key: 'emotionInVoice', label: 'Emotion in Voice', color: 'purple' },
          { key: 'voiceExpressiveness', label: 'Voice Expressiveness', color: 'blue' },
          { key: 'physicalPresence', label: 'Physical Presence', color: 'red' },
          { key: 'faceExpressions', label: 'Face Expressions', color: 'green' },
          { key: 'clearnessOfDiction', label: 'Clearness of Diction', color: 'yellow' }
        ].map(({ key, label, color }) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 p-3 rounded-lg hover:bg-white/5">
            <span className="text-white text-base sm:text-lg">{label}</span>
            <Toggle 
              pressed={preferences[key as keyof Preferences]}
              onPressedChange={() => onTogglePreference(key as keyof Preferences)}
              className={`bg-${color}-700 data-[state=on]:bg-theater-gold h-8 w-14`}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 sm:mt-8 flex justify-center">
        <Button
          onClick={onSave}
          className="w-full sm:w-auto bg-theater-gold hover:bg-theater-gold/80 text-black font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-full transform transition-all duration-300 hover:scale-105"
        >
          Save Preferences & Continue
        </Button>
      </div>
    </motion.div>
  );
};
