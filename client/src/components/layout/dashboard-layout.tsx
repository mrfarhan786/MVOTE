import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Monitor,
  Shield,
  CalendarCog,
  ChevronDown,
  Vote,
  LogIn,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SettingsSection = "general" | "security" | "session_rules" | "session" | null;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logoutMutation, isDemoMode } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(!isMobile);
  const [openSection, setOpenSection] = useState<SettingsSection>("general");

  useEffect(() => {
    setExpanded(!isMobile);
  }, [isMobile]);

  const isActivePath = (path: string) => location === path;

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.profileCompleted
        ? "Complete Profile"
        : "Guest User";

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : "GU";

  const username = user?.username || "guestuser";

  const NavLink = ({
    href,
    icon: Icon,
    children,
  }: {
    href: string;
    icon: React.ComponentType<any>;
    children?: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      className={cn(
        "w-full flex items-center gap-3 transition-colors duration-200",
        expanded ? "justify-start" : "justify-center",
        "p-2",
        isActivePath(href) && "bg-primary/10 text-primary",
        !isActivePath(href) && "hover:bg-border hover:text-accent-foreground",
      )}
      asChild
    >
      <Link href={href}>
        <Icon className="h-5 w-5" />
        {expanded && <span>{children}</span>}
      </Link>
    </Button>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-muted border-r border-border flex flex-col h-screen sticky top-0",
          expanded ? "w-80" : "w-20",
        )}
      >
        <div className="flex-none border-b border-border">
          <div className="p-2 flex items-center">
            {expanded && (
              <h1 className="text-xl font-bold flex-1 text-center flex items-center justify-center gap-2">
                <Vote className="h-5 w-5" />
                MVOTE
              </h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-none border-b border-border">
            <NavLink href="/" icon={Calendar}>
              Agenda
            </NavLink>
            <NavLink href="/participants" icon={Users}>
              Participants
            </NavLink>
            <NavLink href="/reports" icon={FileText}>
              Reports
            </NavLink>
        </div>

        {/* Main Navigation */}
        <ScrollArea className="h-[calc(100vh-180px)] w-full">
          <nav className="flex-1 px-2 space-y-2 overflow-y-auto">          
            <div className="flex-1">
              <div className="bg-border my-2" />

              {expanded && (
                <div className="mt-2">
                  <Collapsible
                    open={openSection === "general"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "general" : null)
                    }
                    className="space-y-2"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>General Settings</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openSection === "general" && "transform rotate-180",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Projector View</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Web Projector</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Auto Preview</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Stay on Top (Voting Grid)</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Stay on Top (Operator Panel)</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Move Polled Items to Bottom</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Confirm Clearing Data</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Show Tips</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Topic List Actions</span>
                        <Button variant="default" size="sm" className="w-20 text-[12px] h-6 min-w-0 whitespace-nowrap transition-all duration-200" asChild>
                          <Link href="#">Edit</Link>
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSection === "security"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "security" : null)
                    }
                    className="space-y-2 mt-2"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Security Settings</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openSection === "security" && "transform rotate-180",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Confirm Vote</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Monitor Interference</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Monitor Conflicting Votes</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Show Threshold Warnings</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Allow Vote Change</span>
                        <Switch />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSection === "session_rules"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "session_rules" : null)
                    }
                    className="space-y-2 mt-2"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarCog className="h-4 w-4" />
                        <span>Session Rules</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openSection === "session_rules" && "transform rotate-180",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Ignore Non-Voters</span>
                        <Switch defaultChecked />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible
                    open={openSection === "session"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "session" : null)
                    }
                    className="space-y-2 mt-2"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarCog className="h-4 w-4" />
                        <span>Session Settings</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openSection === "session" && "transform rotate-180",
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Hybrid Mode</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Offline Support</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Moderator Support</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-xs">Anonymous Mode</span>
                        <Switch />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </div>
          </nav>
        </ScrollArea>

        {/* User Profile Section */}
        <div className="flex-none border-t border-border p-4">
          {isDemoMode ? (
            <Card className={cn(
              "bg-muted/50 shadow-sm hover:shadow transition-all duration-200",
              expanded ? "p-4" : "p-2"
            )} style={{ padding: expanded ? "1rem" : "0.35rem" }}>
              {expanded ? (
                <>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Vote className="h-4 w-4 text-primary" />
                      <Badge variant="secondary" className="text-xs font-medium">Demo Mode</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Experience MVOTE's basic features. Sign in to unlock full voting capabilities.
                    </p>
                    <Button variant="default" size="sm" className="w-full" asChild>
                      <Link href="/auth">
                        Login for Full Access
                      </Link>
                    </Button>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Badge variant="secondary" className="text-[8px] px-1 py-0.5 min-w-0 whitespace-nowrap">Demo</Badge>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full text-[9px] h-5 px-1 min-w-0 whitespace-nowrap transition-all duration-200" 
                    asChild
                  >
                    <Link href="/auth">Login</Link>
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center gap-3",
                    !expanded && "justify-center",
                  )}
                >
                  <Avatar className="h-8 w-8">
                    {user?.profileImage ? (
                      <AvatarImage src={user.profileImage} alt={fullName} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  {expanded && (
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium truncate">{fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {username}
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Switch to Demo Mode</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="h-12 border-b border-border bg-background px-4 flex items-center justify-between sticky top-0 z-10">
          <div className="w-[68px]">{/* Fixed width div for spacing */}</div>

          <div className="flex-1 flex justify-center">
            <h2 className="text-lg font-semibold truncate">Agenda List</h2>
          </div>

          <div className="w-[68px] flex justify-end">
            <NotificationDropdown />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 mx-2 bg-background overflow-y-auto">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
