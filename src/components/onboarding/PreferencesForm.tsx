
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "framer-motion";

interface PreferencesProps {
  preferences: {
    emotionInVoice: boolean;
    voiceExpressiveness: boolean;
    physicalPresence: boolean;
    faceExpressions: boolean;
    clearnessOfDiction: boolean;
  };
  onTogglePreference: (preference: keyof PreferencesProps['preferences']) => void;
  onSave: () => void;
}

export const PreferencesForm = ({ 
  preferences, 
  onTogglePreference, 
  onSave 
}: PreferencesProps) => {
  const [primaryFocus, setPrimaryFocus] = useState("self_tape");
  const [aiVoice, setAiVoice] = useState("female_neutral");

  const preferenceOptions = [
    { id: 'emotionInVoice', label: 'Emotion in Voice', description: 'How well you convey emotion vocally' },
    { id: 'voiceExpressiveness', label: 'Voice Expressiveness', description: 'Range and flexibility in your vocal delivery' },
    { id: 'physicalPresence', label: 'Physical Presence', description: 'How you use your body and space' },
    { id: 'faceExpressions', label: 'Facial Expressions', description: 'How effectively you use facial expressions' },
    { id: 'clearnessOfDiction', label: 'Clearness of Diction', description: 'Clarity and precision of speech' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <div className="bg-black/20 p-4 rounded-xl border border-theater-gold/20">
          <h3 className="text-xl font-semibold text-white mb-4">Analysis Focus Areas</h3>
          <div className="grid gap-3">
            {preferenceOptions.map((option, index) => (
              <motion.div 
                key={option.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`px-4 py-3 rounded-lg border transition-all flex items-center justify-between 
                  ${preferences[option.id as keyof typeof preferences] 
                    ? "border-theater-gold bg-theater-gold/10" 
                    : "border-white/10 bg-black/30 hover:bg-black/40"}`}
                onClick={() => onTogglePreference(option.id as keyof PreferencesProps['preferences'])}
              >
                <div>
                  <p className="font-medium text-white">{option.label}</p>
                  <p className="text-sm text-gray-400">{option.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                  ${preferences[option.id as keyof typeof preferences] 
                    ? "border-theater-gold bg-theater-gold" 
                    : "border-white/30"}`}>
                  {preferences[option.id as keyof typeof preferences] && (
                    <span className="text-black text-xs">✓</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="focus" className="text-white font-medium">Primary Focus</Label>
          <RadioGroup 
            defaultValue={primaryFocus}
            onValueChange={setPrimaryFocus}
            className="bg-black/20 p-3 rounded-lg border border-white/10"
          >
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem value="self_tape" id="self_tape" />
              <Label htmlFor="self_tape" className="text-gray-200">Self-Tape Auditions</Label>
            </div>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem value="rehearsal" id="rehearsal" />
              <Label htmlFor="rehearsal" className="text-gray-200">Scene Rehearsal</Label>
            </div>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="text-gray-200">Both Equally</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label htmlFor="voice" className="text-white font-medium">AI Reader Voice</Label>
          <RadioGroup 
            defaultValue={aiVoice}
            onValueChange={setAiVoice}
            className="bg-black/20 p-3 rounded-lg border border-white/10"
          >
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem value="female_neutral" id="female_neutral" />
              <Label htmlFor="female_neutral" className="text-gray-200">Female (Neutral)</Label>
            </div>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem value="male_neutral" id="male_neutral" />
              <Label htmlFor="male_neutral" className="text-gray-200">Male (Neutral)</Label>
            </div>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem value="female_dramatic" id="female_dramatic" />
              <Label htmlFor="female_dramatic" className="text-gray-200">Female (Dramatic)</Label>
            </div>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem value="male_dramatic" id="male_dramatic" />
              <Label htmlFor="male_dramatic" className="text-gray-200">Male (Dramatic)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button
        onClick={onSave}
        className="w-full bg-theater-gold hover:bg-theater-gold/90 text-black font-bold py-3 mt-4"
      >
        Save & Continue
      </Button>
    </motion.div>
  );
};
