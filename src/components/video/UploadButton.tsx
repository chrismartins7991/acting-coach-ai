import { Upload } from "lucide-react";
import { motion } from "framer-motion";

interface UploadButtonProps {
  isDisabled: boolean;
  isProcessing: boolean;
  retryCount: number;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadButton = ({ isDisabled, isProcessing, retryCount, onFileSelect }: UploadButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
    >
      <label className={`block p-6 rounded-lg bg-gradient-to-br from-theater-purple to-theater-gold transform transition-all duration-300 group-hover:scale-105 shadow-xl ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="file"
          accept="video/*"
          onChange={onFileSelect}
          className="hidden"
          disabled={isDisabled}
        />
        <div className="text-center">
          <Upload className="w-12 h-12 text-white mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
          <p className="text-white/80">Upload a video file (max 50MB) for analysis</p>
          {isProcessing && (
            <p className="text-white/80 mt-2">
              Processing video...
              {retryCount > 0 && ` (Retry ${retryCount}/3)`}
            </p>
          )}
        </div>
      </label>
    </motion.div>
  );
};