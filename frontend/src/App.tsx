import { useEffect, useState } from "react";
import { api } from "./lib/api";

function App() {
  const [health, setHealth] = useState<string>("checking…");

  useEffect(() => {
    api
      .get("/health")
      .then((r) => setHealth(`${r.data.app} — ${r.data.status}`))
      .catch(() => setHealth("backend unreachable"));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b bg-white px-8 py-5">
        <h1 className="text-2xl font-semibold tracking-tight">vastra.ai</h1>
        <p className="text-sm text-neutral-500">Fabric seller panel</p>
      </header>
      <main className="mx-auto max-w-2xl px-8 py-12">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-medium">Backend status</h2>
          <p className="text-sm text-neutral-600">{health}</p>
        </div>
        <p className="mt-8 text-sm text-neutral-500">
          Seller upload flow (M1) comes next.
        </p>
      </main>
    </div>
  );
}

export default App;
