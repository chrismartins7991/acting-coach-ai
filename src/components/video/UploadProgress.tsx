
import { Loader2 } from "lucide-react";
import { Progress } from "../ui/progress";
import { motion } from "framer-motion";

interface UploadProgressProps {
  processingStep: string;
  uploadProgress: number;
}

export const UploadProgress = ({ processingStep, uploadProgress }: UploadProgressProps) => {
  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
      <h3 className="text-xl font-semibold text-white">{processingStep}</h3>
      {uploadProgress > 0 && (
        <div className="w-full max-w-xs mx-auto space-y-2">
          <Progress value={uploadProgress} className="h-2 bg-white/20" />
          <p className="text-sm text-white/60 text-center">
            {uploadProgress === 100 ? 'Processing...' : `${uploadProgress}% uploaded`}
          </p>
        </div>
      )}
    </motion.div>
  );
};
