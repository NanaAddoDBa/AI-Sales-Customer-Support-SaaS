import { createRoot } from "react-dom/client";
import { AccountWorkspace } from "./features/identity/index.js";
import "./style.css";
const root = document.getElementById("root");
if (!root) throw new Error("Missing application root");
createRoot(root).render(<AccountWorkspace />);
