interface TTSOptions {
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  playbackSpeed?: number;
}

let currentAudio: HTMLAudioElement | null = null;
let isGenerating = false;

// Cache for audio files
const audioCache = new Map<string, string>();

export function textToSpeech(
  text: string,
  language: string = 'en',
  options: TTSOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Stop any currently playing audio
      stopAudio();

      // Check cache first
      const cacheKey = `${text}_${language}`;
      const cachedAudioUrl = audioCache.get(cacheKey);

      if (cachedAudioUrl) {
        playAudioFromUrl(cachedAudioUrl, options, resolve, reject);
        return;
      }

      // Generate new audio using Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'en' ? 'en-US' : language;
        utterance.rate = options.playbackSpeed || 1.0;

        let progress = 0;
        const totalLength = text.length;
        const progressInterval = setInterval(() => {
          if (progress < 100) {
            progress += 2;
            options.onProgress?.(progress);
          }
        }, 100);

        utterance.onend = () => {
          clearInterval(progressInterval);
          options.onProgress?.(100);
          options.onComplete?.();
          resolve();
        };

        utterance.onerror = (event) => {
          clearInterval(progressInterval);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        window.speechSynthesis.speak(utterance);
      } else {
        reject(new Error('Speech synthesis not supported'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

function playAudioFromUrl(
  url: string,
  options: TTSOptions,
  resolve: () => void,
  reject: (error: Error) => void
) {
  const audio = new Audio(url);
  currentAudio = audio;

  audio.playbackRate = options.playbackSpeed || 1.0;

  const updateProgress = () => {
    if (audio.duration) {
      const progress = (audio.currentTime / audio.duration) * 100;
      options.onProgress?.(progress);
    }
  };

  const progressInterval = setInterval(updateProgress, 100);

  audio.onended = () => {
    clearInterval(progressInterval);
    options.onComplete?.();
    currentAudio = null;
    resolve();
  };

  audio.onerror = () => {
    clearInterval(progressInterval);
    currentAudio = null;
    reject(new Error('Audio playback error'));
  };

  audio.play().catch(reject);
}

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function getCurrentAudioElement(): HTMLAudioElement | null {
  return currentAudio;
}

export function isGeneratingAudio(): boolean {
  return isGenerating;
}

export function getAudioFromCache(text: string, language: string): string | null {
  const cacheKey = `${text}_${language}`;
  return audioCache.get(cacheKey) || null;
}