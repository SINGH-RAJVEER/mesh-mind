import OpenAI from "openai"

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "")

const resolveLlmBaseUrl = () => {
    const configuredValue = process.env["LLM_BASE_URL"]?.trim()

    if (configuredValue) {
        return stripTrailingSlash(configuredValue)
    }

    return "http://localhost:4000/v1"
}

const toErrorMessage = (err: unknown, baseURL: string) => {
    if (err && typeof err === "object" && "status" in err && err.status === 404) {
        return `LLM endpoint returned 404. Check LLM_BASE_URL (current: ${baseURL}) and confirm an OpenAI-compatible server is running there.`
    }

    if (err instanceof Error) {
        return err.message
    }

    return "Unknown LLM error"
}

class LiteLLMManager {
    private client: OpenAI
    private baseURL: string

    constructor() {
        const apiKey = process.env["GROQ_API_KEY"] || "not-needed"
        const baseURL = resolveLlmBaseUrl()
        const defaultModel = process.env["LLM_MODEL"] || "gpt-3.5-turbo"

        this.baseURL = baseURL

        this.client = new OpenAI({
            apiKey,
            baseURL,
            defaultHeaders: {
                "User-Agent": "meshmind-api/1.0",
            },
        })

        console.log(`LiteLLM Manager initialized`)
        console.log(`Base URL: ${baseURL}`)
        console.log(`Default Model: ${defaultModel}`)
    }

    /**
     * Send a message and get a streaming response
     * Yields chunks of text as they arrive from the model
     */
    async *streamChatResponse(
        userMessage: string,
        systemPrompt: string
    ): AsyncGenerator<string, void, unknown> {
        const model = process.env["LLM_MODEL"] || "gpt-3.5-turbo"

        try {
            const stream = await this.client.chat.completions.create({
                model,
                max_tokens: 1024,
                temperature: 0.7,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: userMessage,
                    },
                ],
                stream: true,
            })

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content
                if (content) {
                    yield content
                }
            }
        } catch (err: unknown) {
            const message = toErrorMessage(err, this.baseURL)
            console.error("Error in streamChatResponse:", err)
            throw new Error(message)
        }
    }

    /**
     * Get complete chat response (non-streaming)
     * Useful for fallback or when streaming is not needed
     */
    async getChatResponse(userMessage: string, systemPrompt: string): Promise<string> {
        const model = process.env["LLM_MODEL"] || "gpt-3.5-turbo"

        try {
            const response = await this.client.chat.completions.create({
                model,
                max_tokens: 1024,
                temperature: 0.7,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: userMessage,
                    },
                ],
            })

            if (response.choices[0]?.message?.content) {
                return response.choices[0].message.content
            }

            return ""
        } catch (err: unknown) {
            const message = toErrorMessage(err, this.baseURL)
            console.error("Error in getChatResponse:", err)
            throw new Error(message)
        }
    }

    getClient(): OpenAI {
        return this.client
    }
}

export default new LiteLLMManager()
