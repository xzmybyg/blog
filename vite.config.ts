import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
declare const __dirname: string;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    //自动引入配置
    AutoImport({
      imports: [
        "react",
        "react-router",
        "react-router-dom",
        {
          //配置第三方库的自动引入
          antd: [
            "Button",
            "Input",
            "Flex",
            "Space",
            "Card",
            "Tag",
            "Skeleton",
            "Pagination",
          ],
          //import {default as axios} from 'axios'
          //import axios from 'axios'
          axios: [["default", "axios"]],
        },
      ],
      //配置本地目录支持自动引入
      dirs: [
        "./src/pages/**",
        "./src/components/**",
        "./src/utils/**",
        "./src/@types/**",
        "./src/store/**",
      ],
      dts: "src/auto-imports.d.ts",
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        //引入scss全局变量
        additionalData: `@import "./src/style/scssConfig.scss";`,
      },
    },
  },
  resolve: {
    //路径映射
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    //设置正向代理跨域
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ""),
      },
    },
  },
});
