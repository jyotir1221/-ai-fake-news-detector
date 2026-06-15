import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

fake = pd.read_csv("../datasets/Fake.csv")
true = pd.read_csv("../datasets/True.csv")

fake["label"] = 0
true["label"] = 1

data = pd.concat([fake, true])

data = data[["text", "label"]]

X = data["text"]
y = data["label"]

vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)

X_vectorized = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_vectorized,
    y,
    test_size=0.2,
    random_state=42
)

model = LogisticRegression()

model.fit(X_train, y_train)

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print(f"Accuracy: {accuracy * 100:.2f}%")

joblib.dump(model, "fake_news_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model saved successfully")