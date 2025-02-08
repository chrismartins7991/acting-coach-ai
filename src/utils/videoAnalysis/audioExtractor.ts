
export const extractAudioFromVideo = async (file: File): Promise<string> => {
  console.log("Starting enhanced audio extraction...");
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioDestination = audioContext.createMediaStreamDestination();
    const chunks: BlobPart[] = [];
    let mediaRecorder: MediaRecorder | null = null;
    
    // Error handling for video
    video.onerror = (error) => {
      console.error("Video error during audio extraction:", error);
      reject(new Error("Failed to load video for audio extraction"));
    };

    // Set up video events
    video.onloadedmetadata = () => {
      console.log("Video metadata loaded for audio extraction:", {
        duration: video.duration,
        // Check for audio tracks in a cross-browser compatible way
        hasAudio: Boolean((video as any).webkitAudioDecodedByteCount) || 
                 Boolean(video.audioTracks?.length) ||
                 true // Assume there's audio if we can't detect it
      });
      
      try {
        const source = audioContext.createMediaElementSource(video);
        source.connect(audioDestination);
        source.connect(audioContext.destination);

        mediaRecorder = new MediaRecorder(audioDestination.stream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
            console.log("Audio chunk collected, size:", e.data.size);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
            console.log("Audio extraction complete, total size:", audioBlob.size);
            
            if (audioBlob.size < 1000) {
              reject(new Error("Extracted audio is too small, possibly no audio in video"));
              return;
            }

            const base64Audio = await blobToBase64(audioBlob);
            resolve(base64Audio);
          } catch (error) {
            console.error("Error in audio processing:", error);
            reject(error);
          }
        };

        // Start recording
        mediaRecorder.start();
        video.currentTime = 0;
        video.play().catch(reject);

        // Stop recording when video ends
        video.onended = () => {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            video.pause();
          }
        };

        // Ensure we stop recording even if video hasn't ended
        setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            video.pause();
          }
        }, (video.duration * 1000) + 500); // Add 500ms buffer

      } catch (error) {
        console.error("Error setting up audio extraction:", error);
        reject(error);
      }
    };

    // Load the video
    video.src = URL.createObjectURL(file);
    video.load();
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
