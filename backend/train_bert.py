import pandas as pd
from datasets import Dataset
from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments
)

# Load datasets
fake = pd.read_csv("../datasets/Fake.csv")
true = pd.read_csv("../datasets/True.csv")

fake["label"] = 0
true["label"] = 1

data = pd.concat([fake, true])

data = data[["text", "label"]]

# Smaller subset for testing
data = data.sample(5000, random_state=42)

dataset = Dataset.from_pandas(data)

tokenizer = DistilBertTokenizer.from_pretrained(
    "distilbert-base-uncased"
)

def tokenize(batch):
    return tokenizer(
        batch["text"],
        padding="max_length",
        truncation=True,
        max_length=256
    )

dataset = dataset.map(tokenize, batched=True)

dataset = dataset.train_test_split(test_size=0.2)

model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=2
)

training_args = TrainingArguments(
    output_dir="./bert_model",
    num_train_epochs=2,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    logging_steps=50
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"]
)

trainer.train()

model.save_pretrained("./bert_model")
tokenizer.save_pretrained("./bert_model")

print("BERT Model Saved Successfully")