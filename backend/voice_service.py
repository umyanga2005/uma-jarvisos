# backend/voice_service.py
import os
import json
import asyncio
import threading
from typing import Optional

# Option 1: Vosk (Offline)
try:
    import vosk
    import pyaudio
    VOSK_AVAILABLE = True
except ImportError:
    print("Vosk or PyAudio not installed. Install with: pip install vosk pyaudio")
    VOSK_AVAILABLE = False

# Option 2: Google Speech Recognition (Online)
try:
    import speech_recognition as sr
    GOOGLE_SR_AVAILABLE = True
except ImportError:
    print("SpeechRecognition not installed. Install with: pip install SpeechRecognition")
    GOOGLE_SR_AVAILABLE = False

# Text-to-Speech
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    print("pyttsx3 not installed. Install with: pip install pyttsx3")
    TTS_AVAILABLE = False

# Configuration
MODEL_PATH = "model/vosk-model-en-us-0.22-lgraph"
USE_GOOGLE_ONLINE = True  # Set to True to use Google's online API

# Global variables
vosk_model = None
vosk_recognizer = None
pyaudio_instance = None
audio_stream = None
tts_engine = None
google_recognizer = None
google_microphone = None

def initialize_voice_service():
    """Initialize the voice recognition and TTS services"""
    global vosk_model, vosk_recognizer, pyaudio_instance, audio_stream
    global tts_engine, google_recognizer, google_microphone
    
    print("Initializing voice service...")
    
    # Initialize TTS
    if TTS_AVAILABLE:
        try:
            tts_engine = pyttsx3.init()
            tts_engine.setProperty('rate', 180)
            voices = tts_engine.getProperty('voices')
            if voices and len(voices) > 1:
                tts_engine.setProperty('voice', voices[1].id)
            print("✓ TTS engine initialized")
        except Exception as e:
            print(f"✗ Error initializing TTS: {e}")
            tts_engine = None
    
    if USE_GOOGLE_ONLINE and GOOGLE_SR_AVAILABLE:
        try:
            google_recognizer = sr.Recognizer()
            google_microphone = sr.Microphone()
            
            with google_microphone as source:
                print("Adjusting for ambient noise... Please wait.")
                google_recognizer.adjust_for_ambient_noise(source, duration=1)
            
            print("✓ Google Speech Recognition initialized (Online)")
            return True
        except Exception as e:
            print(f"✗ Error initializing Google Speech Recognition: {e}")
            return False
    
    elif VOSK_AVAILABLE:
        if not os.path.exists(MODEL_PATH):
            print(f"✗ Vosk model not found at {MODEL_PATH}")
            print("Please ensure your model is in the correct directory:")
            print(f"  Expected: {MODEL_PATH}/")
            return False
        
        try:
            vosk_model = vosk.Model(MODEL_PATH)
            vosk_recognizer = vosk.KaldiRecognizer(vosk_model, 16000)
            pyaudio_instance = pyaudio.PyAudio()
            
            print("✓ Vosk speech recognition initialized (Offline)")
            return True
        except Exception as e:
            print(f"✗ Error initializing Vosk: {e}")
            return False
    else:
        print("✗ No speech recognition service available")
        return False

async def recognize_speech_from_mic() -> Optional[str]:
    """Recognize speech from microphone using either Google (online) or Vosk (offline)"""
    if USE_GOOGLE_ONLINE and google_recognizer and google_microphone:
        return await _recognize_with_google()
    elif vosk_recognizer and pyaudio_instance:
        return await _recognize_with_vosk()
    else:
        print("No speech recognition service initialized")
        return None

async def _recognize_with_google() -> Optional[str]:
    """Recognize speech using Google's online API"""
    try:
        print("Listening with Google Speech Recognition...")
        
        loop = asyncio.get_event_loop()
        
        def listen_and_recognize():
            try:
                with google_microphone as source:
                    audio = google_recognizer.listen(source, timeout=5, phrase_time_limit=10)
                
                text = google_recognizer.recognize_google(audio)
                return text
            except sr.WaitTimeoutError:
                return "TIMEOUT"
            except sr.UnknownValueError:
                return "UNKNOWN"
            except sr.RequestError as e:
                print(f"Google Speech Recognition error: {e}")
                return "ERROR"
        
        result = await loop.run_in_executor(None, listen_and_recognize)
        
        if result == "TIMEOUT":
            print("Listening timeout")
            return None
        elif result == "UNKNOWN":
            print("Could not understand audio")
            return None
        elif result == "ERROR":
            return None
        else:
            print(f"Google recognized: {result}")
            return result
            
    except Exception as e:
        print(f"Error in Google speech recognition: {e}")
        return None

async def _recognize_with_vosk() -> Optional[str]:
    """Recognize speech using Vosk offline model"""
    try:
        print("Listening with Vosk...")
        
        stream = pyaudio_instance.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=16000,
            input=True,
            frames_per_buffer=8000
        )
        
        stream.start_stream()
        
        silence_count = 0
        max_silence = 50
        
        while True:
            data = stream.read(4000, exception_on_overflow=False)
            
            if len(data) == 0:
                break
                
            if vosk_recognizer.AcceptWaveform(data):
                result = json.loads(vosk_recognizer.Result())
                text = result.get('text', '').strip()
                
                if text:
                    stream.stop_stream()
                    stream.close()
                    print(f"Vosk recognized: {text}")
                    return text
            else:
                partial = json.loads(vosk_recognizer.PartialResult())
                if not partial.get('partial', '').strip():
                    silence_count += 1
                else:
                    silence_count = 0
                
                if silence_count > max_silence:
                    break
            
            await asyncio.sleep(0.01)
        
        stream.stop_stream()
        stream.close()
        return None
        
    except Exception as e:
        print(f"Error in Vosk speech recognition: {e}")
        if 'stream' in locals():
            try:
                stream.stop_stream()
                stream.close()
            except:
                pass
        return None

async def speak_text(text: str):
    """Convert text to speech and play it"""
    if not tts_engine:
        print("TTS engine not available")
        return
    
    try:
        print(f"Speaking: {text}")
        
        loop = asyncio.get_event_loop()
        
        def speak():
            tts_engine.say(text)
            tts_engine.runAndWait()
        
        await loop.run_in_executor(None, speak)
        print("Finished speaking")
        
    except Exception as e:
        print(f"Error during text-to-speech: {e}")

def cleanup_voice_service():
    """Clean up voice service resources"""
    global audio_stream, pyaudio_instance, tts_engine
    
    try:
        if audio_stream:
            audio_stream.stop_stream()
            audio_stream.close()
        
        if pyaudio_instance:
            pyaudio_instance.terminate()
        
        if tts_engine:
            tts_engine.stop()
            
        print("Voice service cleaned up")
    except Exception as e:
        print(f"Error during cleanup: {e}")

# Test function
async def test_voice_service():
    """Test the voice service"""
    if not initialize_voice_service():
        print("Failed to initialize voice service")
        return
    
    print("\n=== Voice Service Test ===")
    
    await speak_text("Voice service test initiated. Please say something.")
    
    print("Say something (you have 10 seconds)...")
    text = await recognize_speech_from_mic()
    
    if text:
        print(f"You said: {text}")
        await speak_text(f"You said: {text}")
    else:
        print("No speech detected or recognized")
        await speak_text("No speech was detected")
    
    