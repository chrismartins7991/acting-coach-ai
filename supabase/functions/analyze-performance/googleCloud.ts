const GOOGLE_API_URL = "https://videointelligence.googleapis.com/v1/videos:annotate";

export async function analyzeVideoWithGoogleCloud(videoUrl: string, credentials: any): Promise<any> {
  console.log("Starting Google Cloud video analysis for URL:", videoUrl);
  
  const requestBody = {
    inputUri: videoUrl,
    features: [
      "FACE_DETECTION",
      "PERSON_DETECTION",
      "SPEECH_TRANSCRIPTION",
      "LABEL_DETECTION",
      "SHOT_CHANGE_DETECTION"
    ],
    videoContext: {
      speechTranscriptionConfig: {
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
      },
    },
  };

  try {
    const response = await fetch(`${GOOGLE_API_URL}?key=${credentials.api_key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Cloud API error:", errorText);
      throw new Error(`Google Cloud API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log("Google Cloud analysis completed successfully");
    
    // Start a polling loop to check the operation status
    const operationId = data.name;
    let result = await pollOperationStatus(operationId, credentials.api_key);
    
    return result;
  } catch (error) {
    console.error("Error in Google Cloud analysis:", error);
    throw error;
  }
}

async function pollOperationStatus(operationId: string, apiKey: string): Promise<any> {
  const maxAttempts = 30; // 5 minutes maximum waiting time
  const delayMs = 10000; // 10 seconds between checks
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`Checking operation status (attempt ${attempt + 1}/${maxAttempts})`);
    
    const response = await fetch(
      `https://videointelligence.googleapis.com/v1/${operationId}?key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check operation status: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.done) {
      console.log("Video analysis operation completed");
      return data.response;
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error("Operation timed out");
}