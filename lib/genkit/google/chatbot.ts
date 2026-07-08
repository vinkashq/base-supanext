import { googleAI } from '@genkit-ai/google-genai'
import { genkit } from 'genkit/beta'

const DEFAULT_CHATBOT_MODEL = 'gemini-2.5-flash-lite'

const defaultChatbotConfig = {
  plugins: [googleAI()],
  model: googleAI.model(DEFAULT_CHATBOT_MODEL)
}

const googleChatbot = genkit(defaultChatbotConfig)

export default googleChatbot