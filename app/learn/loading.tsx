export default function Loading() {
  return <main aria-busy="true" style={{ minHeight: "100vh", padding: 24, background: "#F4EFFC" }}>
    <p role="status">학습 공간을 여는 중이에요...</p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr 2fr", gap: 16, height: "70vh" }}>
      {[0, 1, 2].map((id) => <div key={id} style={{ background: "#fff", borderRadius: 20 }} />)}
    </div>
  </main>;
}
