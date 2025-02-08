
export const extractAudioFromVideo = async (file: File): Promise<string> => {
  try {
    console.log("Starting audio extraction...");
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        console.log("Video metadata loaded, duration:", video.duration);
        resolve(null);
      };
    });
    
    const destination = audioContext.createMediaStreamDestination();
    const source = audioContext.createMediaElementSource(video);
    source.connect(destination);
    source.connect(audioContext.destination); // This ensures we can hear the audio while recording
    
    return new Promise((resolve, reject) => {
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          console.log("Received audio chunk, size:", e.data.size);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
          console.log("Audio blob created, size:", audioBlob.size);
          const base64Audio = await blobToBase64(audioBlob);
          console.log("Audio extraction completed, base64 length:", base64Audio.length);
          resolve(base64Audio);
        } catch (error) {
          console.error("Error in audio extraction final stage:", error);
          reject(error);
        }
      };
      
      video.currentTime = 0;
      
      // Wait for canplay event before starting playback
      video.oncanplay = () => {
        console.log("Video can play, starting recording...");
        mediaRecorder.start();
        video.play().catch(error => {
          console.error("Error playing video:", error);
          reject(error);
        });
      };
      
      // Record for the duration of the video
      setTimeout(() => {
        console.log("Recording complete, stopping media recorder...");
        mediaRecorder.stop();
        video.pause();
        URL.revokeObjectURL(video.src); // Clean up the object URL
      }, (video.duration * 1000) + 100); // Add 100ms buffer
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
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
