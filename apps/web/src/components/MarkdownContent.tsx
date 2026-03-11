import { createMemo } from "solid-js"
import { marked } from "marked"

marked.use({
    async: false,
    breaks: true,
    gfm: true,
})

const escapeHtml = (value: string) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")

const renderMarkdown = (value: string) => {
    const rendered = marked.parse(escapeHtml(value))
    return typeof rendered === "string" ? rendered : ""
}

interface MarkdownContentProps {
    content: string
    class?: string
}

function MarkdownContent(props: MarkdownContentProps) {
    const html = createMemo(() => renderMarkdown(props.content))

    return (
        <div
            class={`markdown-content text-foreground ${props.class ?? ""}`.trim()}
            innerHTML={html()}
        />
    )
}

export default MarkdownContent
