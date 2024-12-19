import { createJWT } from "https://deno.land/x/djwt@v2.8/mod.ts";

const GOOGLE_API_URL = "https://videointelligence.googleapis.com/v1/videos:annotate";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

async function getAccessToken(credentials: any): Promise<string> {
  console.log("Getting access token from Google Cloud...");
  
  const now = Math.floor(Date.now() / 1000);
  const saEmail = credentials.client_email;
  const saPrivateKey = credentials.private_key;

  // Create JWT claim
  const jwtClaim = {
    iss: saEmail,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Sign JWT with private key
  const jwt = await createJWT(
    { alg: "RS256", typ: "JWT" },
    jwtClaim,
    saPrivateKey
  );

  // Exchange JWT for access token
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to get access token:", error);
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  console.log("Successfully obtained access token");
  return data.access_token;
}

export async function analyzeVideoWithGoogleCloud(videoUrl: string, credentials: any): Promise<any> {
  console.log("Starting Google Cloud video analysis for URL:", videoUrl);
  
  try {
    // Parse credentials if they're a string
    const parsedCredentials = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
    console.log("Credentials parsed successfully");

    // Get access token
    const accessToken = await getAccessToken(parsedCredentials);
    console.log("Access token obtained successfully");

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
    const response = await fetch(GOOGLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Cloud API error response:", errorText);
      throw new Error(`Google Cloud API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Google Cloud analysis operation started successfully");
    
    // Start a polling loop to check the operation status
    const operationId = data.name;
    let result = await pollOperationStatus(operationId, accessToken);
    
    return result;
  } catch (error) {
    console.error("Error in Google Cloud analysis:", error);
    throw new Error(`Google Cloud Analysis failed: ${error.message}`);
  }
}

async function pollOperationStatus(operationId: string, accessToken: string): Promise<any> {
  const maxAttempts = 30; // 5 minutes maximum waiting time
  const delayMs = 10000; // 10 seconds between checks
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`Checking operation status (attempt ${attempt + 1}/${maxAttempts})`);
    
    try {
      const response = await fetch(
        `https://videointelligence.googleapis.com/v1/${operationId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
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