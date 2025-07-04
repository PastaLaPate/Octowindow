import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import path from "path";

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      tailwindcss(),
      i18nextLoader({ paths: ["./src/assets/langs"] }),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || "000.000.000"),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": "http://localhost:3001", // Redirect API calls to the backend server in development
      },
      port: 3000,
    },
  };
});
