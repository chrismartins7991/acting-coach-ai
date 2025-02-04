```typescript
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useVideoUpload = () => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadVideoToStorage = async (file: File) => {
    try {
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

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

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath, {
          download: false,
        });

      return { publicUrl, filePath };
    } catch (error) {
      console.error("Error in uploadVideoToStorage:", error);
      throw error;
    }
  };

  return {
    uploadVideoToStorage,
    uploadProgress,
    setUploadProgress,
  };
};
```
