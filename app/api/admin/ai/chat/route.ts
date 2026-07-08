import { appRoute } from '@genkit-ai/next'
import { genkit, InMemorySessionStore } from 'genkit/beta'
import { googleAI } from '@genkit-ai/google-genai'

const ai = genkit({ plugins: [googleAI()] })

const chatbot = ai.defineAgent({
    name: 'chatbot',
    model: 'googleai/gemini-flash-latest',
    tools: [],
    store: new InMemorySessionStore(),
})

export const POST = appRoute(chatbot)
