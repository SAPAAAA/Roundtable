import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@shared': resolve(__dirname, 'src/shared'),
            '@features': resolve(__dirname, 'src/features'),
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