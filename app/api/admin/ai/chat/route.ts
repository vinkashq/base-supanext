import { appRoute } from '@genkit-ai/next'
import { genkit } from 'genkit/beta'
import { googleAI } from '@genkit-ai/google-genai'
import SupabaseSessionStore from '@/lib/genkit/supabase-session-store'

const ai = genkit({ plugins: [googleAI()] })
const store = new SupabaseSessionStore("genkit")

const chatbot = ai.defineAgent({
    name: 'chatbot',
    model: 'googleai/gemini-flash-latest',
    tools: [],
    store,
})

export const POST = appRoute(chatbot)
