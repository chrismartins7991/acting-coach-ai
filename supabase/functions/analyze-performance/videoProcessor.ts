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
  
  // Create a command to extract frames directly to base64
  const ffmpegCmd = new Deno.Command("ffmpeg", {
    args: [
      "-i", "pipe:0",  // Read from stdin
      "-vf", "select='eq(n,0)+eq(n,floor(n_frames/2))+eq(n,floor(n_frames-1))'",
      "-vsync", "0",
      "-f", "image2pipe",  // Output to pipe
      "-vcodec", "mjpeg",  // Use JPEG format
      "pipe:1"  // Write to stdout
    ],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped"
  });
  
  // Start the process
  const process = ffmpegCmd.spawn();
  
  // Write video data to stdin
  const writer = process.stdin.getWriter();
  await writer.write(videoData);
  await writer.close();
  
  // Get the output
  const { success, stdout, stderr } = await process.output();
  
  if (!success) {
    const errorOutput = new TextDecoder().decode(stderr);
    console.error("FFmpeg error:", errorOutput);
    throw new Error("Failed to extract frames from video");
  }
  
  // Split the output into individual frame data
  const frames: string[] = [];
  let currentFrame = new Uint8Array();
  let jpegStart = new Uint8Array([0xFF, 0xD8]); // JPEG start marker
  let jpegEnd = new Uint8Array([0xFF, 0xD9]);   // JPEG end marker
  
  let buffer = stdout;
  let position = 0;
  
  while (position < buffer.length) {
    // Find JPEG start marker
    let startPos = position;
    while (startPos < buffer.length - 1) {
      if (buffer[startPos] === jpegStart[0] && buffer[startPos + 1] === jpegStart[1]) {
        break;
      }
      startPos++;
    }
    
    // Find JPEG end marker
    let endPos = startPos;
    while (endPos < buffer.length - 1) {
      if (buffer[endPos] === jpegEnd[0] && buffer[endPos + 1] === jpegEnd[1]) {
        endPos += 2;
        break;
      }
      endPos++;
    }
    
    if (endPos > startPos) {
      const frameData = buffer.slice(startPos, endPos);
      const base64Frame = btoa(String.fromCharCode(...frameData));
      frames.push(`data:image/jpeg;base64,${base64Frame}`);
      position = endPos;
    } else {
      break;
    }
  }
  
  console.log(`Successfully extracted ${frames.length} frames`);
  return frames;
}