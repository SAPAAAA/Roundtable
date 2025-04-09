import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';

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
            '@layouts': resolve(__dirname, 'src/layouts'),
            '@pages': resolve(__dirname, 'src/pages'),
            '@contexts': resolve(__dirname, 'src/contexts'),
            '@hooks': resolve(__dirname, 'src/hooks'),
        },
    },
    build: {
        outDir: '../dist'
    },
    server: {
        port: 3000,
    },
})