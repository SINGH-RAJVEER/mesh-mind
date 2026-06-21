import OpenAI from "openai"

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "")

const resolveLlmBaseUrl = () => {
    const configuredValue = process.env.LLM_BASE_URL?.trim()

    if (configuredValue) {
        return stripTrailingSlash(configuredValue)
    }

    return "http://localhost:4000/v1"
}

const toErrorMessage = (err: unknown, baseURL: string) => {
    if (err && typeof err === "object" && "status" in err && err.status === 404) {
        return `Embedding endpoint returned 404. Check LLM_BASE_URL (current: ${baseURL}) and confirm an OpenAI-compatible server with embeddings is running there.`
    }

    if (err instanceof Error) {
        return err.message
    }

    return "Unknown embeddings error"
}

class EmbeddingsManager {
    private client: OpenAI
    private embeddingModel: string
    private baseURL: string

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || "not-needed"
        const baseURL = resolveLlmBaseUrl()

        this.embeddingModel = process.env.LLM_EMBEDDING_MODEL || "text-embedding-004"

        this.baseURL = baseURL

        this.client = new OpenAI({
            apiKey,
            baseURL,
            defaultHeaders: {
                "User-Agent": "meshmind-embeddings/1.0",
            },
        })

        console.log(`Embeddings Manager initialized`)
        console.log(`Base URL: ${baseURL}`)
        console.log(`Embedding Model: ${this.embeddingModel}`)
    }

    /**
     * Generate embeddings for a single text
     * Returns a vector array representing the semantic meaning of the text
     */
    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.client.embeddings.create({
                model: this.embeddingModel,
                input: text,
            })

            if (response.data && response.data.length > 0) {
                return response.data[0].embedding
            }

            throw new Error("No embedding data received")
        } catch (err: unknown) {
            const message = toErrorMessage(err, this.baseURL)
            console.error("Error generating embedding:", err)
            throw new Error(message)
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     * More efficient than calling generateEmbedding multiple times
     */
    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        try {
            const response = await this.client.embeddings.create({
                model: this.embeddingModel,
                input: texts,
            })

            if (response.data && response.data.length > 0) {
                // Sort by index to ensure correct order
                return response.data.sort((a, b) => a.index - b.index).map((item) => item.embedding)
            }

            throw new Error("No embedding data received")
        } catch (err: unknown) {
            const message = toErrorMessage(err, this.baseURL)
            console.error("Error generating embeddings:", err)
            throw new Error(message)
        }
    }

    /**
     * Prepare text for embedding by cleaning and truncating if necessary
     * Gemini text-embedding-004 supports up to ~20,000 tokens
     */
    prepareTextForEmbedding(text: string, maxLength: number = 8000): string {
        // Remove excessive whitespace and newlines
        let cleaned = text.replace(/\s+/g, " ").trim()

        // Truncate if too long (approximate character limit)
        if (cleaned.length > maxLength) {
            cleaned = cleaned.substring(0, maxLength)
        }

        return cleaned
    }

    /**
     * Get the embedding model being used
     */
    getEmbeddingModel(): string {
        return this.embeddingModel
    }
}

// Export singleton instance
const embeddingsManager = new EmbeddingsManager()
export default embeddingsManager
