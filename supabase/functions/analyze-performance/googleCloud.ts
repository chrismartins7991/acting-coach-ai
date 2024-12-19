const GOOGLE_API_URL = "https://videointelligence.googleapis.com/v1/videos:annotate";

export async function analyzeVideoWithGoogleCloud(videoUrl: string, credentials: any): Promise<any> {
  console.log("Starting Google Cloud video analysis for URL:", videoUrl);
  
  const requestBody = {
    inputUri: videoUrl,
    features: [
      "FACE_DETECTION",
      "PERSON_DETECTION",
      "SPEECH_TRANSCRIPTION"
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
    return data;
  } catch (error) {
    console.error("Error in Google Cloud analysis:", error);
    throw error;
  }
}