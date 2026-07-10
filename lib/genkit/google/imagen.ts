import { googleAI } from "@genkit-ai/google-genai"
import { genkit } from "genkit"

const DEFAULT_IMAGEN_MODEL = "imagen-4.0-generate-001"

const defaultImagenConfig = {
  plugins: [googleAI()],
  model: googleAI.model(DEFAULT_IMAGEN_MODEL)
}

const googleImagen = genkit(defaultImagenConfig)

export default googleImagen