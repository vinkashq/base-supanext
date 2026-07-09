import Session from "../session"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  return (
    <Session sessionId={sessionId} />
  )
}