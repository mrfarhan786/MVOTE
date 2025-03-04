import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { NotificationDialog } from "./notification-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function NotificationDropdown() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/notifications"] });
      
      // Get current notifications
      const previousNotifications = queryClient.getQueryData<Notification[]>(["/api/notifications"]);
      
      // Optimistically remove the notification
      queryClient.setQueryData<Notification[]>(["/api/notifications"], (old) => 
        old?.filter(notification => notification.id !== id) ?? []
      );
      
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(["/api/notifications"], context.previousNotifications);
      }
      toast({
        description: "Failed to delete notification",
        style: { backgroundColor: "#ff4444", color: "white" },
      });
    },
    onSettled: () => {
      // Sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-accent transition-colors"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-[#00BFA5] rounded-full animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[280px] p-0">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <h4 className="font-semibold text-sm">Notifications</h4>
            <span className="text-xs text-muted-foreground">
              {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
            </span>
          </div>
          <ScrollArea className="h-[190px]">
            <div className="px-2 py-1">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="group relative flex items-start gap-4 rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedNotification(notification);
                      setDialogOpen(true);
                    }}
                  >
                    <div className="flex-1 space-y-1 pr-8">
                      <h5 className="text-sm font-medium leading-none">
                        {notification.title}
                      </h5>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(notification.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          {notifications.length > 0 && (
            <div className="p-2 border-t flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs bg-transparent hover:bg-accent transition-colors duration-200 text-muted-foreground hover:text-accent-foreground flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  apiRequest("DELETE", "/api/notifications")
                    .then(() => {
                      queryClient.setQueryData(["/api/notifications"], []);
                      toast({
                        description: "All notifications cleared",
                      });
                    })
                    .catch(() => {
                      toast({
                        variant: "destructive",
                        description: "Failed to clear notifications",
                      });
                    });
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDialog
        notification={selectedNotification}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}