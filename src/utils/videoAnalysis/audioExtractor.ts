export const extractAudioFromVideo = async (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const mediaSource = audioContext.createMediaElementSource(video);
    const mediaRecorder = new MediaRecorder(mediaSource.mediaStream);
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64Audio = (reader.result as string).split(',')[1];
        resolve(base64Audio);
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    };

    video.onloadedmetadata = () => {
      mediaRecorder.start();
      video.play();
    };

    video.onended = () => {
      mediaRecorder.stop();
      audioContext.close();
    };

    video.src = URL.createObjectURL(videoFile);
  });
};