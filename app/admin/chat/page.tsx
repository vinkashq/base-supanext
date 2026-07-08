"use client"

import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, GlobeIcon, ImageIcon, MessageCircleDashedIcon, PaperclipIcon, PlusIcon, RotateCcwIcon, TelescopeIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useChat } from '@ai-sdk/react'
import { GenkitChatTransport } from '@genkit-ai/vercel-ai/client'
import Markdown from "@/components/markdown"

export default function Page() {
  const transport = useMemo(
    () => new GenkitChatTransport({ url: '/api/admin/ai/chat' }),
    []
  )
  const chatId = useMemo(() => crypto.randomUUID(), [])

  const { messages, sendMessage, status } = useChat({
    id: chatId,
    transport,
  })

  const [message, setMessage] = useState('')
  const isBusy = ["submitted", "streaming"].includes(status)

  return (
    <MessageScrollerProvider autoScroll>
      <div className="relative flex flex-col gap-4 flex-1">
        <Card className="mx-auto h-140 w-full gap-0 rounded-t-none flex-1">
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
            {messages.length === 0 ? (
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
                  <MessageScrollerContent>
                    {messages.map((message, index) => (
                      <MessageScrollerItem
                        key={message.id}
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
                              {message.parts.map((part, index) => (
                                <BubbleContent key={index}>
                                  {part.type === "text" && (<Markdown className="flex flex-col gap-4" text={part.text} />)}
                                </BubbleContent>
                              ))}
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            )}
          </CardContent>
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
                  className="h-24 w-full px-3 py-2.5 bg-transparent dark:bg-transparent resize-none border-0 focus-visible:ring-0"
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
        </Card>
      </div>
    </MessageScrollerProvider >
  )
}