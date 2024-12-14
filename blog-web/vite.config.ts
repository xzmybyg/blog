import { defineConfig, ConfigEnv, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin'
declare const __dirname: string

// https://vitejs.dev/config/
export default defineConfig((mode: ConfigEnv) => {
  const env = loadEnv(mode.mode, process.cwd())
  return {
    base: env.VITE_BASE_URL,
    plugins: [
      react(),
      //自动引入配置
      AutoImport({
        imports: [
          'react',
          // "react-router",
          'react-router-dom',
          {
            //配置第三方库的自动引入
            antd: [
              'Space',
              'Pagination',
              'Button',
              'Table',
              'Form',
              'Input',
              'Modal',
              'Flex',
              'Card',
              'Avatar',
              'Tag',
              'Divider',
              'message',
              'Switch',
            ],
            //import {default as axios} from 'axios'
            //import axios from 'axios'
            axios: [['default', 'axios']],
          },
        ],
        //配置本地目录支持自动引入
        dirs: [
          './src/pages/**',
          './src/components/**',
          './src/utils/**',
          './src/types/**',
          './src/store/**',
          './src/apis/**',
          './src/Layout/**',
        ],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: false, // Default `false`
          filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
      }),
      codeInspectorPlugin({
        bundler: 'vite',
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          //引入scss全局变量
          additionalData: `@import "@/styleConfig/scssConfig.scss";`,
        },
      },
    },
    resolve: {
      //路径映射
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: env.VITE_PORT as unknown as number,
      //设置正向代理跨域
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    build: {
      outDir: 'blog',
      minify: 'terser', // 启用后 terserOptions 配置才有效
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境时移除console
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks: {
            // 将 React 相关库分离到一个单独的 chunk
            react: ['react', 'react-dom', 'react-router-dom'],
            // 将 Ant Design 相关库分离到一个单独的 chunk
            antd: ['antd', '@ant-design/icons'],
            // 将其他第三方库分离到一个单独的 chunk
            vendor: ['axios', 'classnames', 'dayjs', 'for-editor', 'framer-motion', 'markdown-navbar', 'react-markdown', 'zustand'],
          },
        },
      },
    },
  }
})
