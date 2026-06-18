import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		host: '0.0.0.0',
		hmr: {
			host: 'localhost',
			clientPort: 13000
		},
		watch: {
			ignored: ['**/coverage']
		},
		proxy: {
			'/api': {
				target: 'http://bookclub-backend:3003',
				changeOrigin: true
			}
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './testSetup.ts',
		exclude: ['**/node_modules/**', '**/dist/**', './temp/**', './src/components/ui/**'],
		testTimeout: 6000,
		coverage: {
			include: ['./src/**'],
			exclude: ['./src/main.tsx', './src/components/ui/**', '**.css', './src/assets/**']
		}
	}
})
