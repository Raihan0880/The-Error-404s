from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import io

app = FastAPI()

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).resize((224, 224))  # adjust as needed
        arr = np.array(image) / 255.0
        arr = arr.reshape((1, 224, 224, 3))  # adjust as needed
        # Dummy prediction for demo:
        prediction = {
            "plant": "Demo Plant",
            "confidence": 0.99,
            "diagnosis": "Healthy"
        }
        return JSONResponse(content=prediction)
    except Exception as e:
        print(f"[ERROR] Image analysis failed: {e}")
        return JSONResponse(content={"error": "Image analysis failed. Please upload a valid image."}, status_code=400) 