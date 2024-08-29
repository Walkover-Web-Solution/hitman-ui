import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
    server: {
        port: 3000,
      },
    plugins: [react(), svgr({
        svgrOptions: { exportType: 'named', ref: true, svgo: false, titleProp: true },
        include: '**/*.svg',
    }), commonjs()]
})