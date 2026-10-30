import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import {
  Shield,
  Clock,
  User,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Key,
  FileText,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Keep {
  id: string;
  title: string;
  description?: string;
  recipient: string;
  fallback?: string;
  creator?: string;
  unlockTime: Date;
  createdAt: Date;
  status: "active" | "unlocked" | "claimed" | "cancelled" | "error";
  ipfsHash: string;
  keepType: "secret" | "document" | "key" | "inheritance";
  ipfsError?: boolean;
  errorMessage?: string;
  blockchainId?: number;
}

interface KeepCardProps {
  keep: Keep;
  onView?: (keep: Keep) => void;
  onEdit?: (keep: Keep) => void;
  onCancel?: (keep: Keep) => void;
  onClaim?: (keep: Keep) => void;
  onReveal?: (keep: Keep) => void;
  onRetry?: (keepId: string) => void;
  showActions?: boolean;
  compact?: boolean;
  currentUserAddress?: string;
}

export function KeepCard({
  keep,
  onView,
  onEdit,
  onCancel,
  onClaim,
  onReveal,
  onRetry,
  showActions = true,
  compact = false,
  currentUserAddress,
}: KeepCardProps) {
  const getStatusConfig = (status: Keep["status"]) => {
    switch (status) {
      case "active":
        return {
          color: "bg-emerald-touch/10 text-emerald-touch border-emerald-touch/20",
          label: "Active",
        };
      case "unlocked":
        return {
          color: "bg-warning/10 text-warning border-warning/20",
          label: "Ready",
        };
      case "claimed":
        return {
          color: "bg-secondary text-forest-deep border-border",
          label: "Claimed",
        };
      case "cancelled":
        return {
          color: "bg-muted text-muted-foreground border-border",
          label: "Cancelled",
        };
      case "error":
        return {
          color: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Error",
        };
      default:
        return {
          color: "bg-muted text-muted-foreground border-border",
          label: "Unknown",
        };
    }
  };

  const getKeepTypeConfig = (type: Keep["keepType"]) => {
    switch (type) {
      case "secret":
        return {
          icon: Shield,
          color: "bg-secondary text-forest-deep",
          label: "Secret",
        };
      case "document":
        return {
          icon: FileText,
          color: "bg-secondary text-pine-fade",
          label: "Document",
        };
      case "key":
        return {
          icon: Key,
          color: "bg-secondary text-emerald-touch",
          label: "Key",
        };
      case "inheritance":
        return {
          icon: Heart,
          color: "bg-secondary text-forest-deep",
          label: "Inheritance",
        };
      default:
        return {
          icon: Shield,
          color: "bg-muted text-muted-foreground",
          label: "Keep",
        };
    }
  };

  const unlockTime =
    keep.unlockTime instanceof Date && !isNaN(keep.unlockTime.getTime())
      ? keep.unlockTime
      : new Date(keep.unlockTime);

  const isValidUnlockTime =
    unlockTime instanceof Date && !isNaN(unlockTime.getTime());
  const isExpired = isValidUnlockTime ? unlockTime < new Date() : false;
  const canClaim =
    keep.status === "unlocked" || (isExpired && keep.status === "active");
  const isCreator = currentUserAddress && keep.creator === currentUserAddress;
  const statusConfig = getStatusConfig(keep.status);
  const typeConfig = getKeepTypeConfig(keep.keepType);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      className={`card-native group ${compact ? "p-4" : "p-4 sm:p-5"} cursor-pointer focus-within:ring-2 focus-within:ring-ring/40`}
      onClick={() => onView?.(keep)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView?.(keep);
        }
      }}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.color}`}
          >
            <TypeIcon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-semibold text-forest-deep text-base truncate">
                {keep.title}
              </h3>
              <Badge
                className={`${statusConfig.color} text-[10px] px-2 py-0 font-medium border`}
              >
                {statusConfig.label}
              </Badge>
            </div>

            {!compact && keep.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {keep.description}
              </p>
            )}

            {keep.ipfsError && (
              <div className="mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium mb-1">
                      Content unavailable
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {keep.errorMessage ||
                        "Failed to retrieve content from IPFS"}
                    </p>
                    {onRetry && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetry(keep.id);
                        }}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-destructive/30 text-destructive hover:bg-destructive/5"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className={`text-[10px] px-2 py-0 ${typeConfig.color} border-none`}
              >
                {typeConfig.label}
              </Badge>

              {isExpired && keep.status === "active" && (
                <Badge className="text-[10px] px-2 py-0 bg-warning/15 text-warning border-transparent">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isCreator && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onReveal?.(keep);
              }}
              size="sm"
              variant="outline"
              className="text-xs h-8 px-2.5 rounded-lg border-border"
            >
              Reveal
            </Button>
          )}

          {canClaim && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClaim?.(keep);
              }}
              size="sm"
              className="btn-keepr text-xs h-8 px-2.5 py-0"
            >
              Claim
            </Button>
          )}

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="touch-target w-8 h-8 p-0 hover:bg-secondary rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Keep actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border border-border shadow-soft rounded-xl"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(keep);
                  }}
                  className="rounded-lg"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View details
                </DropdownMenuItem>

                {keep.status === "active" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(keep);
                    }}
                    className="rounded-lg"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit keep
                  </DropdownMenuItem>
                )}

                {canClaim && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim?.(keep);
                    }}
                    className="text-emerald-touch focus:text-emerald-touch rounded-lg"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Claim keep
                  </DropdownMenuItem>
                )}

                {keep.status === "active" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel?.(keep);
                    }}
                    className="text-destructive focus:text-destructive rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Cancel keep
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-forest-deep transition-colors hidden sm:block" />
        </div>
      </div>

      <div className="space-y-2.5 pt-1 border-t border-border/60">
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0 pt-2.5">
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium shrink-0">Recipient</span>
          <code className="bg-secondary px-2 py-0.5 rounded-md text-xs font-mono truncate text-foreground">
            {keep.recipient.slice(0, 6)}...{keep.recipient.slice(-4)}
          </code>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              {isExpired ? "Unlocked" : "Unlocks"}
            </span>
          </div>

          <div className="text-right">
            <p
              className={`font-semibold text-sm ${
                isExpired ? "text-warning" : "text-forest-deep"
              }`}
            >
              {isValidUnlockTime
                ? formatDistance(unlockTime, new Date(), {
                    addSuffix: true,
                  })
                : "Invalid date"}
            </p>

            {isExpired && keep.status === "active" && (
              <div className="flex items-center justify-end gap-1 text-warning text-xs mt-0.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Available to claim</span>
              </div>
            )}
          </div>
        </div>

        {canClaim && !compact && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClaim?.(keep);
            }}
            className="w-full btn-keepr mt-2"
            size="sm"
          >
            <Shield className="w-4 h-4" />
            Claim this keep
          </Button>
        )}
      </div>
    </div>
  );
}
