import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from face_emotion import EmotionAnalyzer
from hand_gesture import GestureRecognizer

app = FastAPI(title="H.O.L.M.E.V Vision & Emotion Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

emotion_analyzer = EmotionAnalyzer()
gesture_recognizer = GestureRecognizer()

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float = 0.0

class ProcessFrameRequest(BaseModel):
    width: Optional[int] = 640
    height: Optional[int] = 480
    faceLandmarks: Optional[List[LandmarkPoint]] = None
    handLandmarks: Optional[List[LandmarkPoint]] = None

@app.get("/health")
def health_check():
    return {
        "service": "python-vision-emotion",
        "status": "healthy",
        "gpu": False,
        "model_loaded": True,
        "timestamp": int(time.time() * 1000)
    }

@app.post("/process_frame")
def process_frame(req: ProcessFrameRequest):
    try:
        likely_mood = "Neutral"
        confidence = 0.85
        smoothed_scores = {
            "Happy": 0.1,
            "Sad": 0.1,
            "Angry": 0.1,
            "Neutral": 0.5,
            "Tired": 0.1,
            "Surprised": 0.1
        }
        gesture_data = {"gesture": "NONE", "confidence": 0.0, "x": 0.5, "y": 0.5}

        # Process face landmarks if provided
        if req.faceLandmarks and len(req.faceLandmarks) > 0:
            likely_mood, confidence, smoothed_scores = emotion_analyzer.analyze_landmarks(
                req.faceLandmarks, req.width or 640, req.height or 480
            )

        # Process hand landmarks if provided
        if req.handLandmarks and len(req.handLandmarks) > 0:
            gesture_data = gesture_recognizer.analyze_hand_landmarks(
                req.handLandmarks, req.width or 640, req.height or 480
            )

        return {
            "success": True,
            "detected": req.faceLandmarks is not None and len(req.faceLandmarks) > 0,
            "likelyMood": likely_mood,
            "confidence": confidence,
            "smoothedScores": smoothed_scores,
            "gesture": gesture_data,
            "timestamp": int(time.time() * 1000)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
