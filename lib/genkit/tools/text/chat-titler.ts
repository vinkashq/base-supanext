import { z } from "genkit"
import googleText from "../../google/text"

const chatSchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.array(
      z.object({
        text: z.string().optional(),
        image: z.string().optional(),
      })
    )
  })
)

export const chatTitlerOutputSchema = z.string()

const chatTitler = googleText.defineTool(
  {
    name: "chatTitler",
    description: "Generate a title for the AI chat",
    inputSchema: chatSchema,
    outputSchema: chatTitlerOutputSchema
  },
  async (messages) => {
    const result = await googleText.generate({
      system: "Generate human friendly short title for the AI chat sessions in plain text",
      prompt: `${messages.map(m => `${m.role}: ${m.content.map(c => c.text).join('\n')}`).join('\n')}`,
    })

    if (!result) {
      throw new Error('Title generation is failed')
    }

    return result.text
  }
)

export default chatTitler