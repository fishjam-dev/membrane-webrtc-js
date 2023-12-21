import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    target: "es2018",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "membrane-webrtc-js",
      fileName: "membrane-webrtc-js",
    },
    rollupOptions: {
      external: Object.keys(pkg.dependencies || {}),
      output: {
        globals: {
          events: "EventEmitter",
          uuid: "uuid",
        },
      },
    },
  },
  plugins: [dts({ include: "./src/*", rollupTypes: true })],
});
