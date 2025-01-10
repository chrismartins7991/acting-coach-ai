export async function downloadVideo(url: string): Promise<Uint8Array> {
  console.log("Downloading video from URL:", url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

export async function extractFrames(videoData: Uint8Array): Promise<string[]> {
  console.log("Extracting frames from video...");
  
  // Create a temporary file for the video
  const videoPath = await Deno.makeTempFile({ suffix: '.mp4' });
  await Deno.writeFile(videoPath, videoData);
  
  // Create a directory for the frames
  const framesDir = await Deno.makeTempDir();
  
  try {
    // Use FFmpeg to extract frames (at 0%, 50%, and 100% of the video duration)
    const ffmpegCmd = new Deno.Command("ffmpeg", {
      args: [
        "-i", videoPath,
        "-vf", "select='eq(n,0)+eq(n,floor(n_frames/2))+eq(n,floor(n_frames-1))'",
        "-vsync", "0",
        "-frame_pts", "1",
        "-y",
        `${framesDir}/frame_%d.jpg`
      ]
    });
    
    const { success } = await ffmpegCmd.output();
    if (!success) {
      throw new Error("Failed to extract frames from video");
    }
    
    // Read the extracted frames
    const frames: string[] = [];
    for await (const entry of Deno.readDir(framesDir)) {
      if (entry.isFile && entry.name.endsWith('.jpg')) {
        const frameData = await Deno.readFile(`${framesDir}/${entry.name}`);
        const base64Frame = btoa(String.fromCharCode(...frameData));
        frames.push(`data:image/jpeg;base64,${base64Frame}`);
      }
    }
    
    console.log(`Successfully extracted ${frames.length} frames`);
    return frames;
    
  } finally {
    // Clean up temporary files
    try {
      await Deno.remove(videoPath);
      await Deno.remove(framesDir, { recursive: true });
    } catch (error) {
      console.error("Error cleaning up temporary files:", error);
    }
  }
}