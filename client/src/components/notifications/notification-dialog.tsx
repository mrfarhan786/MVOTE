import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@shared/schema";

type NotificationDialogProps = {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NotificationDialog({ notification, open, onOpenChange }: NotificationDialogProps) {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{notification.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">
            {notification.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}