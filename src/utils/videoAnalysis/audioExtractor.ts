export interface TimestampedAudio {
  audioData: string;
  startTime: number;
  endTime: number;
}

export const extractAudioFromVideo = async (
  videoFile: File, 
  frameTimestamps: number[]
): Promise<TimestampedAudio[]> => {
  try {
    console.log("Starting synchronized audio extraction...");
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });
    
    const destination = audioContext.createMediaStreamDestination();
    const source = audioContext.createMediaElementSource(video);
    source.connect(destination);
    
    const audioSegments: TimestampedAudio[] = [];
    
    // Create a MediaRecorder for each segment between frame timestamps
    const processSegment = async (startTime: number, endTime: number) => {
      return new Promise<TimestampedAudio>((resolve, reject) => {
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
            resolve({
              audioData: base64Audio,
              startTime,
              endTime
            });
          } catch (error) {
            reject(error);
          }
        };
        
        video.currentTime = startTime;
        mediaRecorder.start();
        
        setTimeout(() => {
          mediaRecorder.stop();
        }, (endTime - startTime) * 1000);
        
        video.play();
      });
    };
    
    // Process audio segments between frame timestamps
    const audioPromises = [];
    for (let i = 0; i < frameTimestamps.length - 1; i++) {
      audioPromises.push(
        processSegment(frameTimestamps[i], frameTimestamps[i + 1])
      );
    }
    
    const segments = await Promise.all(audioPromises);
    
    video.remove();
    await audioContext.close();
    
    console.log(`Extracted ${segments.length} synchronized audio segments`);
    return segments;
    
  } catch (error) {
    console.error("Error in audio extraction:", error);
    throw new Error(`Failed to extract audio: ${error.message}`);
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