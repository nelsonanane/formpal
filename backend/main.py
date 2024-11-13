# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from pathlib import Path
import tempfile
import base64
import mimetypes
from datauri import DataURI  # Add this import
import ffmpeg
import dotenv
from openai import OpenAI 

from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import threading
import queue
import time

app = Flask(__name__)
CORS(app)

# Initialize SocketIO after your Flask app initialization
socketio = SocketIO(app, cors_allowed_origins="*")

# Load OpenAI API key
dotenv.load_dotenv()
if os.environ.get("OPENAI_API_KEY") is None:
    raise ValueError("OPENAI_API_KEY not found in .env file")

client = OpenAI()

# Configuration
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'webm', 'quicktime'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Add this function after your configurations and before your routes
def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS 

def create_data_uri(file_path: str) -> str:
    """Create a data URI from a file."""
    mime_type = mimetypes.guess_type(file_path)[0]
    with open(file_path, 'rb') as file:
        data = file.read()
        base64_data = base64.b64encode(data).decode('utf-8')
        return f"data:{mime_type};base64,{base64_data}"

def split_video(video_path: str, fps: int = 2) -> tuple[str, list[str]]:
    """Split a video file into audio and image frames."""
    with tempfile.TemporaryDirectory() as outdir:
        outdir_path = Path(outdir)
        audio_path = outdir_path / "audio.mp3"
        
        # Extract audio
        (
            ffmpeg.input(video_path)
            .output(str(audio_path), acodec='libmp3lame', ab='64k', ac=1)
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )

        # Extract frames
        frames_pattern = str(outdir_path / "frame-%04d.jpg")
        (
            ffmpeg.input(video_path)
            .output(
                frames_pattern,
                vf=f"fps={fps},scale='if(gt(iw,ih),512,-1)':'if(gt(ih,iw),512,-1)'",
                qscale=20
            )
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )

        # Get all images and sort them
        images = sorted(outdir_path.glob("frame-*.jpg"))
        
        # Convert to data URIs
        audio_uri = create_data_uri(str(audio_path))
        image_uris = [create_data_uri(str(image)) for image in images]
        
        return audio_uri, image_uris

class ProgressTracker:
    def __init__(self):
        self.message = ""
        self.value = 0.0

    def set(self, message="", value=0.0):
        self.message = message
        self.value = value
        print(f"Progress: {message} ({value*100}%)")

def process_video_with_ai(video_path: str, progress: ProgressTracker) -> dict:
    try:
        # Split video into audio and images
        progress.set("Splitting video into audio and images...", 0.1)
        audio_uri, image_uris = split_video(video_path, fps=2)
        print(f"Extracted {len(image_uris)} frames from video")

        # Parse the audio data URI
        audio_data_uri = DataURI(audio_uri)
        
        # Create temporary audio file for transcription
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_audio:
            temp_audio.write(audio_data_uri.data)
            temp_audio.flush()
            
            progress.set("Transcribing audio...", 0.3)
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=Path(temp_audio.name)
            )
            
            # Clean up temp audio file
            os.unlink(temp_audio.name)

        user_prompt = transcription.text
        progress.set("Analyzing video...", 0.5)

        # Create message with frames and transcription
        messages = [{
            "role": "user",
            "content": [
                {"type": "text", "text": f"Analyze this exercise video. Audio transcript: {user_prompt}"},
                *[{
                    "type": "image_url",
                    "image_url": {"url": image_uri, "detail": "high"},
                } for image_uri in image_uris[:5]]  # Limit to 5 frames
            ],
        }]

        # Get AI analysis
        response = client.chat.completions.create(
            model="gpt-4o",  # Updated model name
            max_tokens=1000,
            messages=[
                {"role": "system", "content": Path("system_prompt.txt").read_text()},
                *messages
            ],
        )
        
        response_text = response.choices[0].message.content
        progress.set("Generating audio response...", 0.8)

        # Convert response to speech
        audio_response = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=response_text,
            response_format="mp3",
        )

        # Create data URI for response audio
        response_audio_base64 = base64.b64encode(audio_response.read()).decode('utf-8')
        response_audio_uri = f"data:audio/mpeg;base64,{response_audio_base64}"

        return {
            'text': response_text,
            'audio_uri': response_audio_uri,
            'messages': messages + [{"role": "assistant", "content": response_text}],
            'progress': {
                'message': 'Analysis complete',
                'value': 1.0
            }
        }

    except Exception as e:
        print(f"Error in AI processing: {str(e)}")
        raise

@app.route('/api/process-video', methods=['POST', 'OPTIONS'])
def process_video():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        print("Received video upload request")
        
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': f'File type not allowed. Allowed types: {ALLOWED_EXTENSIONS}'}), 400

        # Save and process video
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            file.save(tmp.name)
            print(f"Saved file to: {tmp.name}")
            
            try:
                progress = ProgressTracker()
                result = process_video_with_ai(tmp.name, progress)
                return jsonify(result)
            finally:
                os.unlink(tmp.name)
                print("Temporary file cleaned up")
                
    except Exception as e:
        print("Error processing request:", str(e))
        return jsonify({'error': str(e)}), 500

# Add these new classes and functions while keeping your existing code
class RealTimeProcessor:
    def __init__(self, openai_client):
        self.client = openai_client
        self.last_analysis_time = time.time()
        self.frame_buffer = queue.Queue(maxsize=5)  # Store last 5 frames
        self.analysis_interval = 2  # Analyze every 2 seconds

    async def process_frames(self):
        """Process accumulated frames with OpenAI Vision."""
        try:
            # Get frames from buffer
            frames = []
            while not self.frame_buffer.empty() and len(frames) < 3:
                frames.append(self.frame_buffer.get())

            if not frames:
                return None

            # Convert frames to data URIs
            image_uris = []
            for frame in frames:
                success, buffer = cv2.imencode('.jpg', frame)
                if success:
                    image_uri = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
                    image_uris.append(image_uri)

            # Create messages for OpenAI
            messages = [{
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this exercise form and provide immediate feedback."},
                    *[{
                        "type": "image_url",
                        "image_url": {"url": uri, "detail": "high"},
                    } for uri in image_uris]
                ],
            }]

            # Get AI analysis
            response = await self.client.chat.completions.create(
                model="gpt-4-vision-0125",
                max_tokens=150,  # Shorter for real-time feedback
                messages=[
                    {"role": "system", "content": "You are a real-time exercise form analyzer. Provide brief, immediate feedback about form corrections or praise good form. Keep responses under 15 words."},
                    *messages
                ],
            )

            feedback_text = response.choices[0].message.content

            # Generate audio feedback
            audio_response = await self.client.audio.speech.create(
                model="tts-1",
                voice="nova",
                input=feedback_text,
                response_format="mp3",
            )

            # Create audio URI
            audio_base64 = base64.b64encode(audio_response.read()).decode('utf-8')
            audio_uri = f"data:audio/mpeg;base64,{audio_base64}"

            return {
                'text': feedback_text,
                'audio_uri': audio_uri,
                'timestamp': time.time()
            }

        except Exception as e:
            print(f"Error in real-time analysis: {str(e)}")
            return None

# Add these socket endpoints after your existing routes
@socketio.on('connect')
def handle_connect():
    print('Client connected to real-time analysis')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected from real-time analysis')

@socketio.on('start_exercise')
def handle_start_exercise(data):
    exercise_type = data.get('type', 'unknown')
    print(f'Starting real-time analysis for {exercise_type}')

@socketio.on('video_frame')
async def handle_frame(data):
    """Handle incoming video frames for real-time analysis."""
    try:
        # Decode frame
        frame_data = base64.b64decode(data['frame'])
        frame = cv2.imdecode(np.frombuffer(frame_data, np.uint8), cv2.IMREAD_COLOR)
        
        # Get processor instance
        processor = RealTimeProcessor(client)
        
        # Add to frame buffer
        if not processor.frame_buffer.full():
            processor.frame_buffer.put(frame)
        
        # Check if it's time for analysis
        current_time = time.time()
        if current_time - processor.last_analysis_time >= processor.analysis_interval:
            feedback = await processor.process_frames()
            
            if feedback:
                emit('exercise_feedback', feedback)
            
            processor.last_analysis_time = current_time

    except Exception as e:
        print(f"Error processing frame: {str(e)}")

if __name__ == '__main__':
    print(f"\nServer running at: http://192.168.1.15:5001")
    print("Test the connection by visiting: http://192.168.1.15:5001/test")
    print(f"Allowed file types: {ALLOWED_EXTENSIONS}\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)