import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [vue(), basicSsl()],
  base: './',
  css: {
    postcss: {
      plugins: [
        autoprefixer({}), // add options if needed
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: /^~(.*)$/,
        replacement: '$1',
      },
      {
        find: '@/',
        replacement: `${path.resolve(__dirname, 'src')}/`,
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, '/src'),
      },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.scss'],
  },
  server: {
    host: true,             // acepta conexiones externas
    port: 5173,             // puerto
    cors: true,             // habilita CORS
    strictPort: true,       // evita que cambie el puerto solo
    allowedHosts: [
      'localhost',
      '127.0.0.1',   // comodín, así no tienes que editar cada vez
    ]
  }
})
