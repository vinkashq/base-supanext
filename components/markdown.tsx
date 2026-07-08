import markdownit from "markdown-it"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

const md = markdownit()

type MarkdownProps = {
  text: string
  className?: string
} & ComponentProps<"div">

export default function Markdown({ text, className, ...props }: MarkdownProps) {
  const html = md.render(text)
  return <div dangerouslySetInnerHTML={{ __html: html }} className={cn("markdown", className)} {...props} />
}