export const extractFramesFromVideo = async (videoFile: File): Promise<string[]> => {
  console.log("Starting frame extraction...");
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    
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
      
      // Calculate timestamps for 2 frames per second
      const framesPerSecond = 2;
      const totalFrames = Math.floor(video.duration * framesPerSecond);
      const timeInterval = 1 / framesPerSecond;
      const timePoints = Array.from({ length: totalFrames }, (_, i) => i * timeInterval);
      
      // Add the last frame at 99% of duration if not already included
      const lastTimePoint = video.duration * 0.99;
      if (timePoints[timePoints.length - 1] < lastTimePoint) {
        timePoints.push(lastTimePoint);
      }
      
      console.log(`Will extract ${timePoints.length} frames at ${framesPerSecond} fps`);
      let framesProcessed = 0;
      
      const extractFrame = (time: number) => {
        console.log(`Extracting frame at time: ${time.toFixed(2)}s`);
        video.currentTime = time;
      };
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const frameData = canvas.toDataURL('image/jpeg', 0.8);
          console.log(`Frame ${framesProcessed + 1}/${timePoints.length} extracted`);
          frames.push(frameData);
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
    
    video.onerror = (error) => {
      console.error("Error loading video:", error);
      URL.revokeObjectURL(video.src);
      reject(new Error("Error loading video for frame extraction"));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
};