export const extractAudioFromVideo = async (videoFile: File): Promise<string> => {
  try {
    console.log("Starting audio extraction from video...");
    
    // Create an audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create video element
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    // Wait for metadata to load
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });
    
    // Create media stream destination
    const destination = audioContext.createMediaStreamDestination();
    
    // Create media element source
    const source = audioContext.createMediaElementSource(video);
    source.connect(destination);
    
    // Create media recorder with the destination stream
    const mediaRecorder = new MediaRecorder(destination.stream);
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    // Create promise to handle recording completion
    const recordingPromise = new Promise<string>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            resolve(base64Audio);
          };
          
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error("Error processing audio blob:", error);
          reject(error);
        }
      };
    });
    
    // Start recording and playing
    mediaRecorder.start();
    video.play();
    
    // Stop recording when video ends
    video.onended = () => {
      mediaRecorder.stop();
      video.remove();
      audioContext.close();
    };
    
    // Set video duration if it's too long
    const MAX_DURATION = 300; // 5 minutes
    setTimeout(() => {
      if (!mediaRecorder.state.includes('inactive')) {
        mediaRecorder.stop();
        video.remove();
        audioContext.close();
      }
    }, MAX_DURATION * 1000);
    
    console.log("Audio extraction setup complete, waiting for recording...");
    return await recordingPromise;
    
  } catch (error) {
    console.error("Error in audio extraction:", error);
    throw new Error(`Failed to extract audio: ${error.message}`);
  }
};