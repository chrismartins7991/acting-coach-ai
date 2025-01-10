import { SpeechClient } from "https://googleapis.deno.dev/v1/speech:v1";

export async function analyzeAudioWithGoogleCloud(audioData: Uint8Array) {
  console.log("Starting Google Cloud Speech-to-Text analysis");

  try {
    const client = new SpeechClient({
      credentials: {
        type: Deno.env.get('GOOGLE_CLOUD_CREDENTIALS_TYPE'),
        project_id: Deno.env.get('GOOGLE_CLOUD_PROJECT_ID'),
        client_email: Deno.env.get('GOOGLE_CLOUD_CLIENT_EMAIL'),
        client_id: Deno.env.get('GOOGLE_CLOUD_CLIENT_ID'),
        private_key: Deno.env.get('GOOGLE_CLOUD_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      },
    });

    const request = {
      audio: {
        content: btoa(String.fromCharCode(...audioData)),
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
        enableWordConfidence: true,
        enableSpokenEmotions: true,
        enableSpokenPunctuation: true,
        useEnhanced: true,
      },
    };

    console.log("Sending request to Google Cloud Speech-to-Text");
    const [response] = await client.recognize(request);
    console.log("Received response from Google Cloud Speech-to-Text");

    // Process and extract relevant information
    const results = response.results?.[0];
    if (!results) {
      throw new Error('No results from Google Cloud Speech-to-Text');
    }

    // Calculate average confidence
    const words = results.alternatives?.[0]?.words || [];
    const confidenceSum = words.reduce((sum, word) => sum + (word.confidence || 0), 0);
    const averageConfidence = words.length > 0 ? confidenceSum / words.length : 0;

    // Extract emotion data
    const emotions = results.speechEmotions?.[0] || {};
    
    // Calculate speaking rate (words per minute)
    const duration = words.length > 0 
      ? (Number(words[words.length - 1].endTime?.seconds || 0) - Number(words[0].startTime?.seconds || 0))
      : 0;
    const speakingRate = duration > 0 ? (words.length / duration) * 60 : 0;

    // Analyze pitch variations
    const pitchVariations = results.pitchAnalysis?.map(pitch => ({
      time: pitch.timeOffset?.seconds,
      value: pitch.pitch
    })) || [];

    return {
      confidence: averageConfidence,
      emotion: emotions.emotion || 'neutral',
      emotionConfidence: emotions.confidence || 0,
      speakingRate,
      pitch: {
        variations: pitchVariations,
        average: pitchVariations.reduce((sum, p) => sum + (p.value || 0), 0) / pitchVariations.length
      },
      volumeVariation: results.volumeAnalysis?.map(v => ({
        time: v.timeOffset?.seconds,
        value: v.volume
      })) || []
    };

  } catch (error) {
    console.error("Error in Google Cloud Speech-to-Text analysis:", error);
    throw new Error(`Google Cloud Speech-to-Text analysis failed: ${error.message}`);
  }
}