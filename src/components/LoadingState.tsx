import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="w-12 h-12 text-forest-deep animate-spin mb-4" />
      <h2 className="text-xl font-bold text-forest-deep mb-2">Loading...</h2>
      <p className="text-muted-foreground">
        Please wait while we fetch your data
      </p>
    </div>
  );
}
