from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
import joblib




app = FastAPI(
    title="EV Battery Failure Prediction API",
    
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your exact frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("" \
"battery_failure_model.pkl")




class BatteryData(BaseModel):

    battery_capacity_kwh: float = Field(..., example=60.5)
    odometer_km: float = Field(..., example=45000)
    vehicle_age_years: float = Field(..., example=4)
    cycle_count: int = Field(..., example=800)

    battery_health_percent: float = Field(..., example=92.5)
    state_of_charge: float = Field(..., example=75.0)
    depth_of_discharge: float = Field(..., example=65.0)
    state_of_health: float = Field(..., example=90.0)

    cell_voltage_std: float = Field(..., example=0.025)
    cell_temperature_max: float = Field(..., example=42.5)
    internal_resistance: float = Field(..., example=0.015)

    capacity_loss_percent: float = Field(..., example=8.5)
    charging_interruptions: int = Field(..., example=3)
    overcharge_events: int = Field(..., example=1)

@app.get("/")
def home():
    return {
        "message": "EV Battery Failure Prediction API is running"
    }


@app.post("/predict")
def predict(data: BatteryData):

    try:
       
        input_data = data.model_dump()

    
        input_df = pd.DataFrame([input_data])

      
        prediction = model.predict(input_df)[0]

        response = {
            "prediction": str(prediction)
        }

      
        if hasattr(model, "predict_proba"):
            probability = model.predict_proba(input_df)[0]
            response["probability"] = float(max(probability))

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



   
   
