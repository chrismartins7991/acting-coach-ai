import React, { useState } from 'react';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Gamepad, Play, Users, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface VideoUploaderProps {
  onVideoUploaded: (url: string) => void;
  isDisabled?: boolean;
}

export const VideoUploader = ({ onVideoUploaded, isDisabled = false }: VideoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: "Please select a video file under 50MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log("Starting video upload...");
      const filePath = `${Date.now()}_${file.name}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          contentType: file.type
        });

      // Track upload progress using a custom progress handler
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      if (uploadError) {
        clearInterval(progressInterval);
        console.error("Upload error:", uploadError);
        throw new Error('Error uploading video: ' + uploadError.message);
      }

      if (!uploadData) {
        clearInterval(progressInterval);
        throw new Error('No upload data received');
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Video uploaded successfully, getting public URL...");
      
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath, {
          download: true,
        });

      console.log("Public URL generated:", publicUrl);
      onVideoUploaded(publicUrl);
      
      toast({
        title: "Upload successful",
        description: "Your video has been uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16162a] text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500 overflow-hidden">
            <img src="/placeholder.svg" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            <span className="bg-yellow-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">9</span>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-1 rounded-full">
          <span className="text-sm">A65 G12 N0.3</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Gamepad className="w-6 h-6" />
            <span className="bg-yellow-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">9</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24 px-4">
        <motion.div 
          className="relative w-full aspect-square rounded-full mx-auto"
          style={{ maxWidth: '300px' }}
        >
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div 
              className="w-full h-full bg-gradient-to-br from-purple-600 via-red-500 to-blue-500"
              style={{
                transform: 'scale(0.98)',
                opacity: isUploading ? 0.5 : 1,
              }}
            />
          </div>
          {isUploading && (
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                className="text-white"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="48%"
                cx="50%"
                cy="50%"
                style={{
                  strokeDasharray: '300',
                  strokeDashoffset: 300 - (uploadProgress / 100) * 300,
                  transition: 'stroke-dashoffset 0.3s ease',
                }}
              />
            </svg>
          )}
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-2">6 days left until a new Sona is issued</p>
          <p className="text-yellow-500 font-semibold flex items-center justify-center gap-2">
            24 days streak <span className="text-lg">⚡</span>
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center p-4 bg-black/20 backdrop-blur-lg">
        <button className="p-4 rounded-2xl hover:bg-white/5 transition-colors">
          <Gamepad className="w-6 h-6" />
        </button>
        <label className={`p-4 rounded-2xl bg-yellow-500 cursor-pointer transition-all transform hover:scale-105 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={isDisabled || isUploading}
            className="hidden"
          />
          <Play className="w-6 h-6 text-white" />
        </label>
        <button className="p-4 rounded-2xl hover:bg-white/5 transition-colors">
          <Users className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};