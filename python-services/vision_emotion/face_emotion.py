import math
import numpy as np
from typing import Dict, Tuple

class EmotionAnalyzer:
    def __init__(self):
        self.emotions = ["Happy", "Sad", "Angry", "Neutral", "Tired", "Surprised"]
        # Exponential moving average score memory for temporal smoothing
        self.smoothed_scores = {e: 0.166 for e in self.emotions}
        self.smoothed_scores["Neutral"] = 0.5
        self.alpha = 0.25  # Smoothing coefficient

    def calculate_distance(self, p1, p2) -> float:
        return math.hypot(p2[0] - p1[0], p2[1] - p1[1])

    def analyze_landmarks(self, landmarks, frame_width: int, frame_height: int) -> Tuple[str, float, Dict[str, float]]:
        """
        Calculates facial feature metrics from MediaPipe 468 Face Mesh landmarks.
        Key landmarks:
          - Lips: Upper lip (13), Lower lip (14), Left corner (61), Right corner (291)
          - Eyes: Left eye top (159), bottom (145), Right eye top (386), bottom (374)
          - Eyebrows: Left eyebrow (70), Right eyebrow (300)
          - Nose tip: (1)
        """
        if not landmarks or len(landmarks) < 300:
            return "Neutral", 0.5, self.smoothed_scores

        def get_coords(idx):
            lm = landmarks[idx]
            return (lm.x * frame_width, lm.y * frame_height)

        # Mouth width & height
        left_corner = get_coords(61)
        right_corner = get_coords(291)
        top_lip = get_coords(13)
        bottom_lip = get_coords(14)
        mouth_width = self.calculate_distance(left_corner, right_corner)
        mouth_height = self.calculate_distance(top_lip, bottom_lip)
        mouth_ratio = mouth_height / max(mouth_width, 1.0)

        # Mouth corner vertical offset relative to lip center (Smile vs Frown)
        lip_center_y = (top_lip[1] + bottom_lip[1]) / 2.0
        corner_avg_y = (left_corner[1] + right_corner[1]) / 2.0
        smile_metric = lip_center_y - corner_avg_y  # Positive when corners curve upward

        # Eye Aspect Ratio (EAR)
        left_eye_top = get_coords(159)
        left_eye_bottom = get_coords(145)
        right_eye_top = get_coords(386)
        right_eye_bottom = get_coords(374)
        left_ear = self.calculate_distance(left_eye_top, left_eye_bottom)
        right_ear = self.calculate_distance(right_eye_top, right_eye_bottom)
        avg_ear = (left_ear + right_ear) / 2.0

        # Eyebrow distance to eyes (Surprise vs Anger)
        left_eyebrow = get_coords(70)
        right_eyebrow = get_coords(300)
        brow_eye_dist = (self.calculate_distance(left_eyebrow, left_eye_top) + 
                         self.calculate_distance(right_eyebrow, right_eye_top)) / 2.0

        # Heuristic Emotion Raw Scoring
        scores = {
            "Happy": 0.1,
            "Sad": 0.1,
            "Angry": 0.1,
            "Neutral": 0.3,
            "Tired": 0.1,
            "Surprised": 0.1
        }

        # Happy: smile metric positive & open/curved mouth
        if smile_metric > 2.0:
            scores["Happy"] += min(0.8, smile_metric * 0.1 + 0.3)
        
        # Sad: corners down (negative smile metric)
        elif smile_metric < -1.5:
            scores["Sad"] += min(0.7, abs(smile_metric) * 0.1 + 0.2)

        # Surprised: wide mouth ratio & raised eyebrows
        if mouth_ratio > 0.45 and avg_ear > 12.0:
            scores["Surprised"] += 0.7

        # Tired: very low EAR (drooping eyes) & narrow mouth
        if avg_ear < 6.0:
            scores["Tired"] += 0.7

        # Angry: lowered eyebrows & narrow lips
        if brow_eye_dist < 10.0 and mouth_ratio < 0.15:
            scores["Angry"] += 0.6

        # Normalize raw scores
        total = sum(scores.values())
        raw_norm = {k: v / total for k, v in scores.items()}

        # Apply Temporal Exponential Moving Average Smoothing
        for mood in self.emotions:
            self.smoothed_scores[mood] = (
                self.alpha * raw_norm[mood] + (1 - self.alpha) * self.smoothed_scores[mood]
            )

        # Select highest likely mood
        likely_mood = max(self.smoothed_scores, key=self.smoothed_scores.get)
        confidence = round(self.smoothed_scores[likely_mood], 2)

        return likely_mood, confidence, {k: round(v, 2) for k, v in self.smoothed_scores.items()}
