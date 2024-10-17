import { Star } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-12">
      <h1 className="text-7xl font-bold flex flex-row items-center justify-center gap-2">
        <Star className="text-yellow-500 fill-current size-16" /> Win-a-day{" "}
        <Star className="text-yellow-500 fill-current size-16" />
      </h1>
      <p className="text-2xl text-muted-foreground">Work in progress...</p>
    </div>
  );
}
