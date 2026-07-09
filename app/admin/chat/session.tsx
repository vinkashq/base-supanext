"use client"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, GlobeIcon, ImageIcon, MessageCircleDashedIcon, PaperclipIcon, PlusIcon, RotateCcwIcon, TelescopeIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useChat } from '@ai-sdk/react'
import { GenkitChatTransport, messagesFromSnapshot } from '@genkit-ai/vercel-ai/client'
import Markdown from "@/components/markdown"
import { getSessionMessages } from "./actions"
import { useEffect } from "react"
import MessageBubble from "./message-bubble"

type SessionProps = {
  sessionId: string
}

export default function Session({ sessionId }: SessionProps) {
  const transport = useMemo(
    () => new GenkitChatTransport({ url: `/api/admin/ai/chat` }),
    []
  )

  const { messages, sendMessage, status, setMessages } = useChat({
    id: sessionId,
    transport,
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const isBusy = ["submitted", "streaming"].includes(status)

  useEffect(() => {
    setLoading(true)
    getSessionMessages(sessionId)
      .then((genkitMessages) => {
        const uiMessages = messagesFromSnapshot(genkitMessages)
        setMessages(uiMessages)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load session messages:", err)
        setLoading(false)
      })
  }, [sessionId, setMessages])

  return (
    <MessageScrollerProvider autoScroll>
      <Card className="mx-auto gap-0 rounded-t-none w-full flex-1 max-h-svh">
        <CardHeader className="gap-1 border-b">
          <CardTitle>New Chat</CardTitle>
          <CardDescription>How can I help you today?</CardDescription>
          <CardAction>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Reset conversation"><RotateCcwIcon /></Button>} />
              <TooltipContent>
                Reset conversation
              </TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon />
                </EmptyMedia>
                <EmptyTitle>Good day!</EmptyTitle>
                <EmptyDescription>
                  What can I help you with today?
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScroller>
              <MessageScrollerViewport>
                <MessageScrollerContent aria-busy={isBusy} className="message-bubbles">
                  {
                    messages.map((message, index) => (
                      <MessageBubble message={message} key={index} index={index} />
                    ))
                  }
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )
          }
        </CardContent >
        <CardFooter className="flex-col gap-2 p-0 dark:bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!message || isBusy) {
                return
              }
              sendMessage({ text: message })
              setMessage("")
            }}
            className="w-full"
          >
            <InputGroup className="border-0 bg-transparent dark:bg-transparent">
              <Textarea
                id="prompt"
                autoFocus
                placeholder="Type your message here..."
                className="[field-sizing:content] min-h-10 w-full px-3 py-2.5 bg-transparent dark:bg-transparent resize-none border-0 focus-visible:ring-0"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <InputGroupAddon align="block-end" className="pt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<InputGroupButton aria-label="Add files" type="button" size="icon-sm" variant="outline"><PlusIcon /></InputGroupButton>} />
                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-44"
                  >
                    <DropdownMenuItem>
                      <PaperclipIcon />
                      Add Photos & Files
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ImageIcon />
                      Create Image
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <TelescopeIcon />
                      Deep Research
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <GlobeIcon />
                      Web Search
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  className="ml-auto"
                  disabled={isBusy}
                >
                  <ArrowUpIcon />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardFooter>
      </Card >
    </MessageScrollerProvider >
  )
}