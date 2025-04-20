import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const PreferencesForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    experience_level: "",
    acting_type: "",
    coach_preference: "",
    primary_focus: "",
    equipment: "",
    ai_reader_voice: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    toast({
      title: "Preferences Saved",
      description: "Your preferences have been saved successfully.",
    });

    setTimeout(() => {
      navigate("/upload");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Acting Background</h3>

        <div className="space-y-2">
          <Label htmlFor="experience_level" className="text-sm text-gray-300">Experience Level</Label>
          <select
            id="experience_level"
            className="w-full p-2 rounded-md bg-black/50 text-white border border-white/20"
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="acting_type" className="text-sm text-gray-300">Preferred Acting Type</Label>
          <select
            id="acting_type"
            className="w-full p-2 rounded-md bg-black/50 text-white border border-white/20"
            name="acting_type"
            value={formData.acting_type}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            <option value="film">Film</option>
            <option value="theater">Theater</option>
            <option value="commercial">Commercial</option>
            <option value="voiceover">Voiceover</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coach_preference" className="text-sm text-gray-300">Preferred AI Coach</Label>
          <select
            id="coach_preference"
            className="w-full p-2 rounded-md bg-black/50 text-white border border-white/20"
            name="coach_preference"
            value={formData.coach_preference}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            <option value="stanislavski">Stanislavski</option>
            <option value="brecht">Brecht</option>
            <option value="lee_strasberg">Lee Strasberg</option>
            <option value="chekhov">Chekhov</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Studio Preferences</h3>
        
        <div className="space-y-2">
          <Label htmlFor="primary_focus" className="text-sm text-gray-300">What's your primary focus?</Label>
          <select 
            id="primary_focus"
            className="w-full p-2 rounded-md bg-black/50 text-white border border-white/20"
            name="primary_focus"
            value={formData.primary_focus}
            onChange={handleChange}
          >
            <option value="self_tape">Self-Tape Auditions</option>
            <option value="rehearsal">Scene Rehearsal</option>
            <option value="both">Both Equally</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="equipment" className="text-sm text-gray-300">Self-Tape Equipment</Label>
          <select 
            id="equipment"
            className="w-full p-2 rounded-md bg-black/50 text-white border border-white/20"
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
          >
            <option value="phone">Smartphone</option>
            <option value="dslr">DSLR/Mirrorless Camera</option>
            <option value="webcam">Webcam</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai_reader_voice" className="text-sm text-gray-300">Preferred AI Reader Voice</Label>
          <select 
            id="ai_reader_voice"
            className="w-full p-2 rounded-md bg-black/50 text-white border border-white/20"
            name="ai_reader_voice"
            value={formData.ai_reader_voice}
            onChange={handleChange}
          >
            <option value="female_neutral">Female (Neutral)</option>
            <option value="male_neutral">Male (Neutral)</option>
            <option value="female_dramatic">Female (Dramatic)</option>
            <option value="male_dramatic">Male (Dramatic)</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full bg-theater-gold hover:bg-theater-gold/90 text-black">
        Save Preferences
      </Button>
    </form>
  );
};
