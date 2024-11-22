import { defineConfig } from 'vite'
import * as path from "path"

// https://vitejs.dev/config/
export default {
  root: path.resolve(__dirname, 'src'),
  server: {
    port: 8080,
    hot: true
  }
}
