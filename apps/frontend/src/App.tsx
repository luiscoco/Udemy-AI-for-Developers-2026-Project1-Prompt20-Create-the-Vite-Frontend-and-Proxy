import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then(() => setStatus("connected"))
      .catch(() => setStatus("unable to reach API"));
  }, []);

  return (
    <div>
      <h1>Equipment Maintenance Hub</h1>
      <p>API status: {status}</p>
    </div>
  );
}

export default App;
