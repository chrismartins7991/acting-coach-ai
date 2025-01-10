export const extractFramesFromVideo = async (videoFile: File): Promise<{ frames: string[], audioBlob?: Blob }> => {
  console.log("Extracting frames and audio from video on client side...");
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];
    
    // Set up audio context and nodes
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(destination.stream);
    const audioChunks: BlobPart[] = [];
    
    video.autoplay = false;
    video.muted = false;
    
    // Set up audio recording
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      resolve({ frames, audioBlob });
    };
    
    // Set up video metadata loading
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Connect video audio to recorder
      const source = audioContext.createMediaElementSource(video);
      source.connect(destination);
      source.connect(audioContext.destination);
      
      // Start recording audio
      mediaRecorder.start();
      
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
            mediaRecorder.stop();
            video.pause();
          }
        }
      };
      
      // Start playing to capture audio and extract frames
      video.play();
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