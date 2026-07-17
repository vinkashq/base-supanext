import { googleAI } from '@genkit-ai/google-genai'
import { genkit } from 'genkit/beta'

const DEFAULT_TEXT_MODEL = 'gemini-flash-lite-latest'

const defaultTextConfig = {
  plugins: [googleAI()],
  model: googleAI.model(DEFAULT_TEXT_MODEL)
}

const googleText = genkit(defaultTextConfig)

export default googleText