import { createRoot } from "react-dom/client";
const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(
  <main>
    <h1>Customer support</h1>
    <p>
      Chat is not connected yet. Please use the store’s existing contact
      details.
    </p>
  </main>,
);
