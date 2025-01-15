import { useVideoUpload } from "@/utils/videoAnalysis/useVideoUpload";
import { UploadButton } from "./video/UploadButton";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

interface VideoUploadProps {
  onAnalysisComplete: (analysis: any) => void;
  isAnalyzing: boolean;
}

export const VideoUpload = ({ onAnalysisComplete, isAnalyzing }: VideoUploadProps) => {
  const { toast } = useToast();
  const { handleFileUpload, isUploading, retryCount } = useVideoUpload("demo-user", onAnalysisComplete);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [userUsage, setUserUsage] = useState<{ performance_count: number, is_subscribed: boolean } | null>(null);
  const navigate = useNavigate();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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