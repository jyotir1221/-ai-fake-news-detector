import ImageUpload from "./components/ImageUpload";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fc",
        padding: "30px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "42px",
          fontWeight: "bold",
          color: "#2563eb",
          marginBottom: "30px",
        }}
      >
        AI Fake News Detection Dashboard
      </h1>

      <ImageUpload />
    </div>
  );
}

export default App;