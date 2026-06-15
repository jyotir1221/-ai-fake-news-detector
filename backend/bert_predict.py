from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification
)
import torch

tokenizer = DistilBertTokenizer.from_pretrained(
    "./bert_model"
)

model = DistilBertForSequenceClassification.from_pretrained(
    "./bert_model"
)

def predict_news(text):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = torch.softmax(
        outputs.logits,
        dim=1
    )

    prediction = torch.argmax(
        probabilities,
        dim=1
    ).item()

    print("RAW PREDICTION =", prediction)
    print("PROBABILITIES =", probabilities)

    confidence = (
        probabilities[0][prediction].item()
        * 100
    )

    # Correct label mapping
    if prediction == 1:
        result = "Real News"
    else:
        result = "Fake News Detected"

    return result, f"{confidence:.2f}%"