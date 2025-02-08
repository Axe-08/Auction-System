// server/src/config/cors.ts
import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        console.log('Request origin:', origin);
        const allowedOrigins = [
            'https://axe-08.github.io',
            'http://localhost:8080',
            'http://localhost:8081',
            'http://192.168.56.1:8080',
            'http://192.168.56.1:8081',
            undefined
        ];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};