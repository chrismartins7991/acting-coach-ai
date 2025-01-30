export const extractAudioFromVideo = async (file: File): Promise<string> => {
  try {
    console.log("Starting audio extraction...");
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });
    
    const destination = audioContext.createMediaStreamDestination();
    const source = audioContext.createMediaElementSource(video);
    source.connect(destination);
    
    return new Promise((resolve, reject) => {
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const base64Audio = await blobToBase64(audioBlob);
          console.log("Audio extraction completed successfully");
          resolve(base64Audio);
        } catch (error) {
          console.error("Error in audio extraction:", error);
          reject(error);
        }
      };
      
      video.currentTime = 0;
      mediaRecorder.start();
      
      video.play().catch(reject);
      
      // Record for the duration of the video
      setTimeout(() => {
        mediaRecorder.stop();
        video.pause();
      }, video.duration * 1000);
    });
    
  } catch (error) {
    console.error("Error in audio extraction:", error);
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};