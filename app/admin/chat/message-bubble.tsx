import Markdown from "@/components/markdown"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"
import { MessageScrollerItem } from "@/components/ui/message-scroller"
import { cn } from "@/lib/utils"
import { UIMessage } from "ai"

type MessageProps = {
  message: UIMessage,
  index: number
}

export default function MessageBubble({ message, index }: MessageProps) {
  const text = message.parts
    .filter((part) => part.type === "text")
    .map(part => part.text)
    .join("") as string

  return (
    <MessageScrollerItem
      messageId={message.id}
      scrollAnchor={message.role === "user"}
      className={cn("", index === 0 && "mt-4")}
    >
      <Message>
        <MessageContent>
          <Bubble
            align={message.role === "user" ? "end" : "start"}
            variant={message.role === "user" ? "muted" : "ghost"}
          >
            <BubbleContent>
              <Markdown text={text} />
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}