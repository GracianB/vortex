import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontró el nodo raíz de Vórtice.");
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
