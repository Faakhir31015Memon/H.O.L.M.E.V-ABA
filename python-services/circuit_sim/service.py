import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from simulator import CircuitSimulator

app = FastAPI(title="H.O.L.M.E.V Circuit Simulator Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulator = CircuitSimulator()

class SimulateCircuitRequest(BaseModel):
    components: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]

@app.get("/health")
def health_check():
    return {
        "service": "python-circuit-sim",
        "status": "healthy",
        "timestamp": int(time.time() * 1000)
    }

@app.post("/simulate")
def simulate_circuit(req: SimulateCircuitRequest):
    try:
        res = simulator.simulate(req.components, req.connections)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
