import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { geminiChatApiPlugin } from './vite.api-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), geminiChatApiPlugin()],
  server: {
    watch: {
      // Editors and agents on Windows write through temporary directories that
      // the file watcher cannot lock; keep them out of the watch tree.
      ignored: ['**/*.tmpdir/**', '**/.taste-skill/**', '**/assets/**', '**/dist/**'],
    },
  },
})
