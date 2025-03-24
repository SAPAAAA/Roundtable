import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {resolve} from 'path'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@shared': resolve(__dirname, 'src/shared'),
            '@layout': resolve(__dirname, 'src/layout'),
            '@pages': resolve(__dirname, 'src/pages'),
        },
    },
    build: {
        outDir: '../dist'
    },
    server: {
        port: 3000,
    },
})