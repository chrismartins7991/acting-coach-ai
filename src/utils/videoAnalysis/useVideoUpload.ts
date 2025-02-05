
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractFramesFromVideo } from "./frameExtractor";
import { useToast } from "@/components/ui/use-toast";

export const useVideoUpload = (userId: string, onAnalysisComplete: (analysis: any) => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log("Starting video upload process for user:", userId);

      // First, fetch user's coach preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_coach_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) {
        console.error("Error fetching preferences:", preferencesError);
        if (preferencesError.code === 'PGRST116') {
          throw new Error('Please complete the coach selection process first.');
        }
        throw new Error('Failed to fetch user preferences. Please try again.');
      }

      if (!preferences) {
        throw new Error('Please complete the coach selection process first.');
      }

      console.log("Retrieved coach preferences:", preferences);

      // Extract frames first
      const frames = await extractFramesFromVideo(file);
      
      if (frames.length < 3) {
        throw new Error("Failed to extract enough frames from video");
      }

      console.log(`Successfully extracted ${frames.length} frames from video`);

      // Upload video to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Error uploading video: ' + uploadError.message);
      }

      console.log("Video uploaded successfully, getting public URL...");

      // Get the public URL of the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Starting AI analysis with preferences...");

      // Call the analyze-performance edge function with frames and preferences
      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-performance', {
          body: { 
            videoUrl: publicUrl,
            frames,
            coachPreferences: {
              selectedCoach: preferences.selected_coach,
              focusAreas: {
                emotionInVoice: preferences.emotion_in_voice,
                voiceExpressiveness: preferences.voice_expressiveness,
                physicalPresence: preferences.physical_presence,
                faceExpressions: preferences.face_expressions,
                clearnessOfDiction: preferences.clearness_of_diction,
              }
            }
          }
        });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        throw new Error('Analysis failed: ' + (analysisError.message || 'Please try again.'));
      }

      if (!analysis) {
        throw new Error('No analysis results received. Please try again.');
      }

      console.log("Analysis completed successfully:", analysis);

      // Store results in performance_results
      const { error: resultsError } = await supabase
        .from('performance_results')
        .insert({
          user_id: userId,
          analysis: analysis as unknown as Json,
          voice_analysis: null // We'll handle voice analysis separately
        });

      if (resultsError) {
        console.error("Error storing results:", resultsError);
        toast({
          title: "Warning",
          description: "Your analysis is ready but couldn't be saved for later viewing.",
          variant: "destructive",
        });
      }

      onAnalysisComplete(analysis);

    } catch (error: any) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video. Please try again.",
        variant: "destructive",
      });
      
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        await handleFileUpload(file);
      } else {
        throw error;
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading,
    retryCount
  };
};
