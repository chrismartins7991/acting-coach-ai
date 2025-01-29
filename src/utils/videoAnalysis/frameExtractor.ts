export interface TimestampedFrame {
  frameData: string;
  timestamp: number;
}

export const extractFramesFromVideo = async (videoFile: File): Promise<TimestampedFrame[]> => {
  console.log("Starting frame extraction with timestamps...");
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: TimestampedFrame[] = [];
    
    video.autoplay = false;
    video.muted = true;
    
    video.onloadedmetadata = () => {
      console.log("Video metadata loaded:", { 
        duration: video.duration, 
        width: video.videoWidth, 
        height: video.videoHeight 
      });
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Calculate timestamps for frames
      const maxFrames = 300; // New maximum frame limit
      const totalFramesNeeded = Math.min(Math.floor(video.duration * 2), maxFrames); // 2 fps, capped at maxFrames
      const timeInterval = video.duration / totalFramesNeeded;
      const timePoints = Array.from(
        { length: totalFramesNeeded },
        (_, i) => i * timeInterval
      );
      
      console.log(`Will extract ${timePoints.length} frames at interval ${timeInterval.toFixed(2)}s`);
      let framesProcessed = 0;
      
      const extractFrame = (time: number) => {
        video.currentTime = time;
      };
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const frameData = canvas.toDataURL('image/jpeg', 0.7);
          frames.push({
            frameData,
            timestamp: video.currentTime
          });
          console.log(`Frame ${framesProcessed + 1}/${timePoints.length} extracted at ${video.currentTime.toFixed(2)}s`);
          
          framesProcessed++;
          if (framesProcessed < timePoints.length) {
            extractFrame(timePoints[framesProcessed]);
          } else {
            console.log("Frame extraction complete:", frames.length, "frames");
            URL.revokeObjectURL(video.src);
            resolve(frames);
          }
        }
      };
      
      video.onerror = (error) => {
        console.error("Error loading video:", error);
        URL.revokeObjectURL(video.src);
        reject(new Error("Error loading video for frame extraction"));
      };
      
      // Start extracting frames
      extractFrame(timePoints[0]);
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
};