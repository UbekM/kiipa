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
  Archive,
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
  unlockTime: Date;
  createdAt: Date;
  status: "active" | "unlocked" | "claimed" | "cancelled";
  ipfsHash: string;
  keepType: "secret" | "document" | "key" | "inheritance";
}

interface KeepCardProps {
  keep: Keep;
  onView?: (keep: Keep) => void;
  onEdit?: (keep: Keep) => void;
  onCancel?: (keep: Keep) => void;
  onClaim?: (keep: Keep) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function KeepCard({
  keep,
  onView,
  onEdit,
  onCancel,
  onClaim,
  showActions = true,
  compact = false,
}: KeepCardProps) {
  const getStatusConfig = (status: Keep["status"]) => {
    switch (status) {
      case "active":
        return {
          color:
            "bg-emerald-touch/10 text-emerald-touch border-emerald-touch/20",
          label: "Active",
        };
      case "unlocked":
        return {
          color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
          label: "Ready",
        };
      case "claimed":
        return {
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          label: "Claimed",
        };
      case "cancelled":
        return {
          color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
          label: "Cancelled",
        };
      default:
        return {
          color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
          label: "Unknown",
        };
    }
  };

  const getKeepTypeConfig = (type: Keep["keepType"]) => {
    switch (type) {
      case "secret":
        return {
          icon: Shield,
          color: "bg-purple-500/10 text-purple-600",
          label: "Secret",
        };
      case "document":
        return {
          icon: FileText,
          color: "bg-blue-500/10 text-blue-600",
          label: "Document",
        };
      case "key":
        return {
          icon: Key,
          color: "bg-orange-500/10 text-orange-600",
          label: "Key",
        };
      case "inheritance":
        return {
          icon: Heart,
          color: "bg-red-500/10 text-red-600",
          label: "Inheritance",
        };
      default:
        return {
          icon: Shield,
          color: "bg-gray-500/10 text-gray-600",
          label: "Keep",
        };
    }
  };

  const isExpired = keep.unlockTime < new Date();
  const canClaim =
    keep.status === "unlocked" || (isExpired && keep.status === "active");
  const statusConfig = getStatusConfig(keep.status);
  const typeConfig = getKeepTypeConfig(keep.keepType);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      className={`card-native group transition-all duration-200 active:scale-[0.98] ${
        compact ? "p-4" : "p-5"
      } cursor-pointer`}
      onClick={() => onView?.(keep)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${typeConfig.color}`}
          >
            <TypeIcon className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-forest-deep text-base truncate">
                {keep.title}
              </h3>
              <Badge
                className={`${statusConfig.color} text-xs px-2 py-0.5 font-medium`}
              >
                {statusConfig.label}
              </Badge>
            </div>

            {!compact && keep.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {keep.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-0.5 ${typeConfig.color} border-none`}
              >
                {typeConfig.label}
              </Badge>

              {isExpired && keep.status === "active" && (
                <Badge
                  variant="destructive"
                  className="text-xs px-2 py-0.5 animate-pulse"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canClaim && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClaim?.(keep);
              }}
              size="sm"
              className="btn-native text-xs px-3 py-2 h-8"
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
                  className="touch-target w-8 h-8 p-0 hover:bg-forest-deep/5 rounded-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="card-native border-none shadow-2xl"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onView?.(keep);
                  }}
                  className="rounded-xl"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </DropdownMenuItem>

                {keep.status === "active" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(keep);
                    }}
                    className="rounded-xl"
                  >
                    <Edit className="w-4 h-4 mr-3" />
                    Edit Keep
                  </DropdownMenuItem>
                )}

                {canClaim && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim?.(keep);
                    }}
                    className="text-emerald-touch focus:text-emerald-touch rounded-xl"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Claim Keep
                  </DropdownMenuItem>
                )}

                {keep.status === "active" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel?.(keep);
                    }}
                    className="text-destructive focus:text-destructive rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Cancel Keep
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-forest-deep transition-colors" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Recipient Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0 flex-1">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Recipient:</span>
            <code className="bg-mist-green px-2 py-1 rounded-lg text-xs font-mono truncate">
              {keep.recipient.slice(0, 6)}...{keep.recipient.slice(-4)}
            </code>
          </div>
        </div>

        {/* Timing Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              {isExpired ? "Unlocked" : "Unlocks"}:
            </span>
          </div>

          <div className="text-right">
            <p
              className={`font-semibold text-sm ${
                isExpired ? "text-yellow-600" : "text-forest-deep"
              }`}
            >
              {formatDistance(keep.unlockTime, new Date(), {
                addSuffix: true,
              })}
            </p>

            {isExpired && keep.status === "active" && (
              <div className="flex items-center gap-1 text-yellow-600 text-xs mt-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Available to claim</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action for Claimable Keeps */}
        {canClaim && !compact && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClaim?.(keep);
            }}
            className="w-full btn-native mt-4 flex items-center justify-center gap-2"
            size="sm"
          >
            <Shield className="w-4 h-4" />
            Claim This Keep
          </Button>
        )}
      </div>
    </div>
  );
}
