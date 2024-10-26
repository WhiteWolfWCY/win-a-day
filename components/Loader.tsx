import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center gap-2 p-24">
      <Loader2 className="h-6 w-6 animate-spin" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );
}
