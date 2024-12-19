const GOOGLE_API_URL = "https://videointelligence.googleapis.com/v1/videos:annotate";

export async function analyzeVideoWithGoogleCloud(videoUrl: string, credentials: any): Promise<any> {
  console.log("Starting Google Cloud video analysis for URL:", videoUrl);
  
  try {
    // Parse credentials if they're a string
    const parsedCredentials = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
    console.log("Credentials parsed successfully");

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

    console.log("Making request to Google Cloud Video Intelligence API");
    const response = await fetch(`${GOOGLE_API_URL}?key=${parsedCredentials.api_key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${parsedCredentials.access_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Cloud API error response:", errorText);
      throw new Error(`Google Cloud API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Google Cloud analysis completed successfully");
    
    // Start a polling loop to check the operation status
    const operationId = data.name;
    let result = await pollOperationStatus(operationId, parsedCredentials);
    
    return result;
  } catch (error) {
    console.error("Error in Google Cloud analysis:", error);
    throw new Error(`Google Cloud Analysis failed: ${error.message}`);
  }
}

async function pollOperationStatus(operationId: string, credentials: any): Promise<any> {
  const maxAttempts = 30; // 5 minutes maximum waiting time
  const delayMs = 10000; // 10 seconds between checks
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`Checking operation status (attempt ${attempt + 1}/${maxAttempts})`);
    
    try {
      const response = await fetch(
        `https://videointelligence.googleapis.com/v1/${operationId}?key=${credentials.api_key}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${credentials.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to check operation status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.done) {
        console.log("Video analysis operation completed");
        return data.response;
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error("Error polling operation status:", error);
      throw error;
    }
  }

  throw new Error("Operation timed out");
}