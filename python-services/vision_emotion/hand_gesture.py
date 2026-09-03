import math
from typing import Dict, Any

class GestureRecognizer:
    def __init__(self):
        pass

    def calculate_distance(self, p1, p2) -> float:
        return math.hypot(p2['x'] - p1['x'], p2['y'] - p1['y'])

    def analyze_hand_landmarks(self, landmarks, frame_width: int, frame_height: int) -> Dict[str, Any]:
        """
        Processes 21 MediaPipe hand landmarks:
          0: Wrist
          4: Thumb tip
          8: Index tip
          12: Middle tip
          16: Ring tip
          20: Pinky tip
        """
        if not landmarks or len(landmarks) < 21:
            return {"gesture": "NONE", "confidence": 0.0, "x": 0.5, "y": 0.5}

        # Convert to dictionary format
        pts = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in landmarks]
        
        # Center of hand (index MCP + wrist)
        hand_center_x = (pts[0]['x'] + pts[9]['x']) / 2.0
        hand_center_y = (pts[0]['y'] + pts[9]['y']) / 2.0

        thumb_tip = pts[4]
        index_tip = pts[8]
        middle_tip = pts[12]
        ring_tip = pts[16]
        pinky_tip = pts[20]
        wrist = pts[0]

        # Pinch distance (Thumb tip to Index tip)
        pinch_dist = self.calculate_distance(thumb_tip, index_tip)

        # Distance from wrist to tips
        d_index = self.calculate_distance(wrist, index_tip)
        d_middle = self.calculate_distance(wrist, middle_tip)
        d_ring = self.calculate_distance(wrist, ring_tip)
        d_pinky = self.calculate_distance(wrist, pinky_tip)

        gesture = "NONE"
        confidence = 0.85

        # Pinch gesture
        if pinch_dist < 0.06:
            gesture = "PINCH"
            confidence = 0.95
        
        # Point gesture (Index extended, others folded)
        elif d_index > 0.25 and d_middle < 0.20 and d_ring < 0.20 and d_pinky < 0.20:
            gesture = "POINT"
            confidence = 0.90

        # Grab / Fist (All tips close to wrist)
        elif d_index < 0.18 and d_middle < 0.18 and d_ring < 0.18 and d_pinky < 0.18:
            gesture = "GRAB"
            confidence = 0.90

        # Open Palm (All tips extended away from wrist)
        elif d_index > 0.25 and d_middle > 0.25 and d_ring > 0.25 and d_pinky > 0.25:
            gesture = "OPEN_PALM"
            confidence = 0.92

        return {
            "gesture": gesture,
            "confidence": confidence,
            "x": round(hand_center_x, 3),
            "y": round(hand_center_y, 3)
        }
