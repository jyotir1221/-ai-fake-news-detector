import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState("");
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    const response = await fetch(
      "http://127.0.0.1:8000/history"
    );

    const data = await response.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "http://127.0.0.1:8000/predict",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    setResult(data.result);
    setConfidence(data.confidence);

    fetchHistory();
  };

  const deletePrediction = async (id) => {
    await fetch(
      `http://127.0.0.1:8000/prediction/${id}`,
      {
        method: "DELETE",
      }
    );

    fetchHistory();
  };

  const exportCSV = () => {
    const headers =
      "Filename,Result,Confidence,Date\n";

    const rows = history
      .map(
        (item) =>
          `${item.filename},${item.result},${item.confidence},${item.created_at}`
      )
      .join("\n");

    const csvContent = headers + rows;

    const blob = new Blob(
      [csvContent],
      { type: "text/csv" }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "prediction_history.csv";

    link.click();
  };

  const fakeCount = history.filter(
    (item) => item.result === "Fake News Detected"
  ).length;

  const realCount = history.length - fakeCount;

  const chartData = [
    {
      name: "Fake News",
      value: fakeCount,
    },
    {
      name: "Real News",
      value: realCount,
    },
  ];

  const filteredHistory = history.filter((item) =>
    item.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      {/* Stats Cards */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            flex: 1,
            borderRadius: "10px",
          }}
        >
          <h3>Total Predictions</h3>
          <h1>{history.length}</h1>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            flex: 1,
            borderRadius: "10px",
          }}
        >
          <h3>Fake News</h3>
          <h1>{fakeCount}</h1>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            flex: 1,
            borderRadius: "10px",
          }}
        >
          <h3>Real News</h3>
          <h1>{realCount}</h1>
        </div>
      </div>

      {/* Upload Section */}

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "15px",
          marginBottom: "30px",
        }}
      >
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setPreview(
              URL.createObjectURL(e.target.files[0])
            );
          }}
        />

        {preview && (
          <img
            src={preview}
            alt="preview"
            width="100%"
            style={{
              marginTop: "20px",
              borderRadius: "10px",
            }}
          />
        )}

        <button
          onClick={handleUpload}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Detect Fake News
        </button>

        {result && (
          <div
            style={{
              marginTop: "20px",
              background: "#f3f4f6",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            <h2>{result}</h2>
            <h3>Confidence: {confidence}</h3>
          </div>
        )}
      </div>

      {/* Analytics */}

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "15px",
          marginBottom: "30px",
        }}
      >
        <h2>Prediction Analytics</h2>

        <PieChart width={500} height={300}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
          >
            <Cell fill="#ef4444" />
            <Cell fill="#22c55e" />
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* History */}

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "15px",
        }}
      >
        <h2>Prediction History</h2>

        <button
          onClick={exportCSV}
          style={{
            marginBottom: "20px",
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>

        <input
          type="text"
          placeholder="Search by filename..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />

        {filteredHistory.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginTop: "10px",
              borderRadius: "10px",
              background: "#f9fafb",
            }}
          >
            <h4>{item.filename}</h4>

            <p>
              <strong>Result:</strong> {item.result}
            </p>

            <p>
              <strong>Confidence:</strong> {item.confidence}
            </p>

            <p>
              <strong>Date:</strong> {item.created_at}
            </p>

            <button
              onClick={() =>
                deletePrediction(item.id)
              }
              style={{
                marginTop: "10px",
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageUpload;