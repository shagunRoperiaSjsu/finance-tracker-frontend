import { defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     "/api": "https://xmyjrw3dcw.us-west-2.awsapprunner.com",
  //   },
  // }
});
