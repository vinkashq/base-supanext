import Composer from "@/components/blocks/composer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function Form() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="md:col-span-1 lg:col-span-2">
        <Input placeholder="Title" />
      </div>
      <div className="md:col-span-1 lg:col-span-1">
        <Input placeholder="Category" />
      </div>
      <div className="md:col-span-1 lg:col-span-1">
        <Input placeholder="Tags" />
      </div>
      <div className="md:col-span-1 lg:col-span-1">
        <Composer />
      </div>
    </div>
  )
}