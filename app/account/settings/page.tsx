import SettingsForm from "./form"

export function generateMetadata() {
  return {
    title: "Settings",
  }
}

export default function Settings() {
  return (
    <div className="flex flex-col gap-4 mx-auto max-w-2xl grow py-12">

      <h1 className="scroll-m-20 text-left text-4xl font-extrabold tracking-tight text-balance">
        Account Settings
      </h1>

      <SettingsForm />
    </div>
  )
}