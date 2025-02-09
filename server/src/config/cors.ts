// server/src/config/cors.ts
import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        console.log('Request origin:', origin);
        const allowedOrigins = [
            'https://axe-08.github.io',  // ✅ Add your GitHub Pages URL
            'https://movie-auction-admin.github.io', // ✅ Add if different
            'https://movie-auction-house.github.io', // ✅ Add if different
            'http://localhost:3000',  // ✅ Allow local testing
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