import { useVideoUpload } from "@/utils/videoAnalysis/useVideoUpload";
import { UploadButton } from "./video/UploadButton";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface VideoUploadProps {
  userId: string;
  onAnalysisComplete: (analysis: any) => void;
  isAnalyzing: boolean;
}

export const VideoUpload = ({ userId, onAnalysisComplete, isAnalyzing }: VideoUploadProps) => {
  const { handleFileUpload, isUploading, retryCount } = useVideoUpload(userId, onAnalysisComplete);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [userUsage, setUserUsage] = useState<{ performance_count: number, is_subscribed: boolean } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserUsage = async () => {
      const { data, error } = await supabase
        .from('user_usage')
        .select('performance_count, is_subscribed')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user usage:', error);
        return;
      }

      setUserUsage(data);
    };

    fetchUserUsage();
  }, [userId]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (userUsage && !userUsage.is_subscribed && userUsage.performance_count >= 1) {
      setShowUpgradeDialog(true);
      return;
    }

    handleFileUpload(file);
  };

  return (
    <>
      <UploadButton
        isDisabled={isUploading || isAnalyzing}
        isProcessing={isUploading || isAnalyzing}
        retryCount={retryCount}
        onFileSelect={handleFileSelect}
      />

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              You've used your free trial performance analysis. Upgrade now to continue using our AI coaching services!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => navigate('/dashboard/subscription')}>
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};