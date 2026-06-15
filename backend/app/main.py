from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil

from app.database import SessionLocal, Prediction
from app.ocr import extract_text
from bert_predict import predict_news

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "AI Fake News Detector Running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    upload_path = f"app/uploads/{file.filename}"

    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text(upload_path)

    print("\n====================")
    print("OCR TEXT:")
    print(extracted_text)
    print("====================\n")

    if not extracted_text.strip():
        extracted_text = "No text detected"

    # BERT Prediction
    result, confidence = predict_news(extracted_text)

    print("RESULT:", result)
    print("CONFIDENCE:", confidence)

    db = SessionLocal()

    prediction_record = Prediction(
        filename=file.filename,
        result=result,
        confidence=confidence
    )

    db.add(prediction_record)
    db.commit()

    return {
        "result": result,
        "confidence": confidence,
        "extracted_text": extracted_text
    }


@app.get("/history")
def history():

    db = SessionLocal()

    data = db.query(Prediction).all()

    results = []

    for item in data:
        results.append({
            "id": item.id,
            "filename": item.filename,
            "result": item.result,
            "confidence": item.confidence,
            "created_at": str(item.created_at)
        })

    return results


@app.delete("/prediction/{prediction_id}")
def delete_prediction(prediction_id: int):

    db = SessionLocal()

    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id
    ).first()

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found"
        )

    db.delete(prediction)
    db.commit()

    return {
        "message": "Prediction deleted successfully"
    }