import markdownit from "markdown-it"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

const md = markdownit()

type MarkdownTextProps = {
  text: string,
  className?: string,
} & ComponentProps<"div">

export default function MarkdownText({
  text,
  className,
  ...props
}: MarkdownTextProps) {
  const html = md.render(text)
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} className={cn("typeset", className)} {...props} />
  )
}