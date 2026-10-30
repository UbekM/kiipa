import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = "Loading",
  description = "Please wait while we fetch your data",
}: LoadingStateProps) {
  return (
    <div className="empty-state min-h-screen page-shell" role="status" aria-live="polite">
      <div className="empty-state-icon">
        <Loader2 className="w-7 h-7 text-forest-deep animate-spin" aria-hidden />
      </div>
      <h2 className="font-display text-xl text-forest-deep mb-1">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-xs">{description}</p>
    </div>
  );
}
