import { createRoot } from "react-dom/client";
const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(
  <main>
    <h1>Merchant workspace</h1>
    <p>Account setup and the staff inbox are not available yet.</p>
  </main>,
);
