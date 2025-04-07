import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

createRoot(document.getElementById("root")!).render(<App />);
