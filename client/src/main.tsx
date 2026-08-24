import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for offline support + push notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // SW registration failed silently — app still works without it
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
