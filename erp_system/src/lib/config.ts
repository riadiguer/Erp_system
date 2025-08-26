import { z } from 'zod';


const EnvSchema = z.object({
NEXT_PUBLIC_API_URL: z.string().url(),
});


export const env = EnvSchema.parse({
NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});