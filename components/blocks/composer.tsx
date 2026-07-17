"use client"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useState } from "react"
import MarkdownText from "../ui/markdown-text"

type ComposerProps = {
  text?: string
} & React.ComponentProps<"div">

export default function Composer({ text, className, ...props }: ComposerProps) {
  const [markdown, setMarkdown] = useState(text || "")
  return (
    <div className={cn("grid grid-cols-2 gap-4 w-full", className)} {...props}>
      <InputGroup>
        <InputGroupTextarea
          placeholder="Write your text here. (Markdown supported)"
          className="min-h-[200px] h-full"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      </InputGroup>
      <MarkdownText text={markdown} />
    </div>
  )
}