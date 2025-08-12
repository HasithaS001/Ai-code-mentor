// ElevenLabs API configuration
import { ELEVENLABS_API_KEY } from "../config/api";
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// ElevenLabs model configuration
const ELEVENLABS_MODEL = "eleven_turbo_v2_5"; // Using Turbo v2.5 for optimal quality/speed balance

// Audio cache configuration
const AUDIO_CACHE_PREFIX = "elevenlabs_audio_cache_";
const AUDIO_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// ElevenLabs voice options with descriptive names
export const ELEVENLABS_VOICE_OPTIONS: Record<string, string> = {
  "21m00Tcm4TlvDq8ikWAM": "Rachel (English Female)",
  "AZnzlk1XvdvUeBnXmlld": "Domi (English Female)",
  "EXAVITQu4vr4xnSDxMaL": "Bella (English Female)",
  "ErXwobaYiN019PkySvjV": "Antoni (English Male)",
  "MF3mGyEYCl7XYWbV9V6O": "Elli (English Female)",
  "TxGEqnHWrfWFTfGW9XjX": "Josh (English Male)",
  "VR6AewLTigWG4xSOukaG": "Arnold (English Male)",
  "pNInz6obpgDQGcFmaJgB": "Adam (Indian Male)",
  "yoZ06aMxZJJ28mfd3POQ": "Sam (English Male)"
};

// Default voice ID - will be overridden by settings
let selectedVoiceId = "pNInz6obpgDQGcFmaJgB"; // Default to Adam (Indian male voice)

// Function to set the selected voice ID
export function setSelectedVoice(voiceId: string): void {
  if (ELEVENLABS_VOICE_OPTIONS[voiceId]) {
    selectedVoiceId = voiceId;
    console.log(`Voice set to: ${ELEVENLABS_VOICE_OPTIONS[voiceId]} (${voiceId})`);
  } else {
    console.error(`Invalid voice ID: ${voiceId}`);
  }
}

// Audio element for playing the generated speech
let audioElement: HTMLAudioElement | null = null;
let isPlaying = false;
let isGenerating = false;
let progressInterval: NodeJS.Timeout | null = null;

// Export functions to get current audio state
export const getCurrentAudioElement = () => audioElement;
export const isGeneratingAudio = () => isGenerating;

/**
 * Generate a cache key for audio content
 * @param text The text to generate a key for
 * @param language The language of the text
 * @returns A unique cache key
 */
function generateAudioCacheKey(text: string, language: string): string {
  // Simple hash function for the text content
  let hash = 0;
  const combinedText = `${text}_${language}_${selectedVoiceId}`;
  
  for (let i = 0; i < combinedText.length; i++) {
    const char = combinedText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `${AUDIO_CACHE_PREFIX}${hash}`;
}

/**
 * Save audio data to cache
 * @param text The text that was converted to speech
 * @param language The language of the text
 * @param audioBlob The audio blob to cache
 */
async function saveAudioToCache(text: string, language: string, audioBlob: Blob): Promise<void> {
  try {
    const cacheKey = generateAudioCacheKey(text, language);
    
    // Convert blob to base64 string for storage
    const reader = new FileReader();
    
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
        const base64 = base64data.split(',')[1];
        resolve(base64);
      };
    });
    
    reader.readAsDataURL(audioBlob);
    const base64 = await base64Promise;
    
    // Store in localStorage with metadata
    const cacheData = {
      text,
      language,
      voiceId: selectedVoiceId,
      audioBase64: base64,
      timestamp: Date.now(),
      mimeType: audioBlob.type
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Audio cached successfully: ${cacheKey}`);
  } catch (error) {
    console.error('Error saving audio to cache:', error);
  }
}

/**
 * Get cached audio data
 * @param text The text to get audio for
 * @param language The language of the text
 * @returns Audio blob if cached, null otherwise
 */
export function getAudioFromCache(text: string, language: string): { blob: Blob, url: string } | null {
  try {
    const cacheKey = generateAudioCacheKey(text, language);
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    const parsedData = JSON.parse(cachedData);
    
    // Check if cache is expired
    if (Date.now() - parsedData.timestamp > AUDIO_CACHE_EXPIRY) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    // Check if voice ID matches current selection
    if (parsedData.voiceId !== selectedVoiceId) {
      return null;
    }
    
    // Convert base64 back to blob
    const binaryString = atob(parsedData.audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: parsedData.mimeType || 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    
    console.log(`Using cached audio: ${cacheKey}`);
    return { blob, url };
  } catch (error) {
    console.error('Error retrieving audio from cache:', error);
    return null;
  }
}

// Initialize audio element if we're in a browser environment
if (typeof window !== 'undefined') {
  audioElement = new Audio();
}

/**
 * Interface for speech progress tracking
 */
export interface SpeechProgressCallback {
  onProgress: (progress: number) => void;
  onComplete: () => void;
  playbackSpeed?: number;
}

// Import the translation utility
import { translateText } from './translation';

/**
 * Convert text to speech using ElevenLabs API with language support
 * @param text The text to convert to speech
 * @param language The language code for translation (e.g., 'hi' for Hindi)
 * @param progressCallback Optional callback for progress updates
 */
export async function textToSpeech(text: string, language: string = 'en', progressCallback?: SpeechProgressCallback): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      // Stop any currently playing audio
      stopAudio();
      
      // Set generating flag
      isGenerating = true;

      if (progressCallback) {
        progressCallback.onProgress(0);
      }
      
      // Translate text if language is not English
      let processedText = text.trim();
      if (language !== 'en') {
        try {
          console.log(`Translating text to ${language}...`);
          processedText = await translateText(processedText, language);
          console.log('Translation complete');
        } catch (error) {
          console.error('Translation error:', error);
          // Continue with original text if translation fails
        }
      }
      
      // Check if we have cached audio for this text
      const cachedAudio = getAudioFromCache(processedText, language);
      
      let audioBlob: Blob;
      let audioUrl: string;
      
      if (cachedAudio) {
        // Use cached audio
        console.log('Using cached audio');
        audioBlob = cachedAudio.blob;
        audioUrl = cachedAudio.url;
      } else {
        // No cached audio, make API request
        console.log(`Using ElevenLabs Turbo v2.5 model (${ELEVENLABS_MODEL}) with voice ID: ${selectedVoiceId}`);
        
        // Make request to ElevenLabs API
        const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${selectedVoiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: processedText,
            model_id: ELEVENLABS_MODEL,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,  // Added style parameter for Turbo v2.5
              speaker_boost: true  // Enhanced clarity for Turbo v2.5
            },
            output_format: 'mp3_44100_128' // High quality audio format
          })
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details');
          console.error('ElevenLabs API error details:', errorText);
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
        }
        
        console.log('ElevenLabs API request successful');

        // Get audio data as blob
        audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        
        // Save audio to cache for future use
        saveAudioToCache(processedText, language, audioBlob);
      }

      // Set up the audio element
      if (!audioElement) {
        audioElement = new Audio();
      }

      audioElement.src = audioUrl;
      isPlaying = true;
      isGenerating = false; // Audio is ready for playback

      // Set up event handlers
      audioElement.onloadedmetadata = () => {
        const audioDuration = audioElement?.duration || 0;
        
        if (progressCallback) {
          if (progressInterval) {
            clearInterval(progressInterval);
          }
          
          progressInterval = setInterval(() => {
            if (!isPlaying || !audioElement) {
              clearInterval(progressInterval!);
              return;
            }
            
            const elapsed = audioElement.currentTime;
            const progress = Math.min(100, Math.round((elapsed / audioDuration) * 100));
            
            progressCallback.onProgress(progress);
            
            if (progress >= 100 || !isPlaying) {
              clearInterval(progressInterval!);
              progressCallback.onProgress(100);
              progressCallback.onComplete();
            }
          }, 100);
        }
      };

      audioElement.onended = () => {
        isPlaying = false;
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        if (progressCallback) {
          progressCallback.onProgress(100);
          progressCallback.onComplete();
        }
        resolve();
        URL.revokeObjectURL(audioUrl);
      };

      audioElement.onerror = (event) => {
        isPlaying = false;
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        
        let errorMessage = 'Audio playback failed';
        if (audioElement?.error) {
          switch (audioElement.error.code) {
            case 1: errorMessage = 'Audio loading was aborted'; break;
            case 2: errorMessage = 'Audio network error'; break;
            case 3: errorMessage = 'Audio decoding error - unsupported format'; break;
            case 4: errorMessage = 'Audio source not supported'; break;
            default: errorMessage = `Audio error (code: ${audioElement.error.code})`;
          }
        }
        
        reject(new Error(errorMessage));
        URL.revokeObjectURL(audioUrl);
      };

      // Start playing
      await audioElement.play();
    } catch (error: unknown) {
      console.error('Error converting text to speech:', error);
      isGenerating = false; // Reset flag on error
      reject(error instanceof Error ? error : new Error('Unknown TTS error'));
    }
  });
}

/**
 * Helper function to convert base64 to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}

/**
 * Helper function to stop any currently playing audio
 */
export function stopAudio(): void {
  // Stop any playing audio
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
  
  // Reset playing state
  isPlaying = false;
  
  // Clear progress tracking interval
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}
