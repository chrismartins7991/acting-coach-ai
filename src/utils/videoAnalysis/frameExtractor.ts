export const extractFramesFromVideo = async (videoFile: File): Promise<string[]> => {
  console.log("Extracting frames from video on client side...");
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    
    video.autoplay = false;
    video.muted = true;
    
    // Set up video metadata loading
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Extract frames at beginning, middle, and end
      const timePoints = [0, video.duration / 2, video.duration * 0.99];
      let framesProcessed = 0;
      
      const extractFrame = (time: number) => {
        video.currentTime = time;
      };
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          frames.push(canvas.toDataURL('image/jpeg', 0.8));
          framesProcessed++;
          
          if (framesProcessed < timePoints.length) {
            extractFrame(timePoints[framesProcessed]);
          } else {
            console.log(`Successfully extracted ${frames.length} frames`);
            URL.revokeObjectURL(video.src);
            resolve(frames);
          }
        }
      };
      
      // Start extracting frames
      extractFrame(timePoints[0]);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Error loading video"));
    };
    
    // Load the video file
    video.src = URL.createObjectURL(videoFile);
  });
};