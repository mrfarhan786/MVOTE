import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Edit, Play, Copy, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AgendaItem {
  id: number;
  text: string;
  isEditing?: boolean;
}

export default function AgendaList() {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [newItem, setNewItem] = useState("");
  const [sessionName, setSessionName] = useState("New Voting Session");
  const [isEditingName, setIsEditingName] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), text: newItem.trim() }]);
      setNewItem("");
      toast({
        description: "Poll agenda item added successfully",
        style: { backgroundColor: "#00C853", color: "white" },
        duration: 2000,
      });
    }
  };

  const handleSessionNameEdit = () => {
    if (isEditingName) {
      toast({
        description: "Session name updated successfully",
        style: { backgroundColor: "#00C853", color: "white" },
        duration: 2000,
      });
    }
    setIsEditingName(!isEditingName);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const deleteSelectedItems = () => {
    setItems(items.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    toast({
      description: "Selected items deleted",
      style: { backgroundColor: "#FFD600", color: "black" },
      duration: 2000,
    });
  };

  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    toast({
      description: "Poll agenda item deleted",
      style: { backgroundColor: "#FFD600", color: "black" },
      duration: 2000,
    });
  };

  const duplicateItem = (item: AgendaItem) => {
    const newItem = { ...item, id: Date.now() };
    setItems([...items, newItem]);
    toast({
      description: "Poll agenda item duplicated",
      style: { backgroundColor: "#00BFA5", color: "white" },
      duration: 2000,
    });
  };

  const toggleEdit = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isEditing: !item.isEditing } : item,
      ),
    );
  };

  const updateItem = (id: number, newText: string) => {
    if (newText.trim()) {
      setItems(
        items.map((item) =>
          item.id === id
            ? { ...item, text: newText.trim(), isEditing: false }
            : item,
        ),
      );
      toast({
        description: "Poll agenda item updated",
        style: { backgroundColor: "#00C853", color: "white" },
        duration: 2000,
      });
    }
  };

  const clearItems = () => {
    setItems([]);
    setSelectedItems([]);
    toast({
      description: "Poll agenda cleared",
      style: { backgroundColor: "#FFD600", color: "black" },
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] w-full mx-auto px-3 overflow-hidden">
      {/* Header with Create Session and Create Agenda */}
      <div className="flex justify-between items-center mt-2 mb-2">
        <h2 className="text-lg font-bold">Create Agenda</h2>
        <h2 className="text-lg font-bold">Session Name</h2>
      </div>

      {/* Session Name and Agenda Input Row */}
      <div className="flex gap-4 mb-4">

        {/* Agenda Input Section */}
        <div className="flex-1 flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter your agenda here..."
            onKeyPress={(e) => e.key === "Enter" && addItem()}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={addItem}
            className="bg-[#00C853]/10 hover:bg-[#00C853]/20 text-[#00C853] h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Session Name Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="flex-1"
                autoFocus
              />
            ) : (
              <Input value={sessionName} className="flex-1" readOnly />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSessionNameEdit}
              className={cn(
                "h-10 w-10",
                isEditingName
                  ? "bg-[#00C853]/10 hover:bg-[#00C853]/20 text-[#00C853]"
                  : "bg-[#4fb7dd]/10 hover:bg-[#4fb7dd]/20 text-[#4fb7dd]",
              )}
            >
              {isEditingName ? (
                <Save className="h-4 w-4" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden">
        {/* Header Row */}
        <div className="p-3 border-b flex items-center gap-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                items.length > 0 && selectedItems.length === items.length
              }
              onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
              className="ml-3"
            />
            <Button
              variant="secondary"
              size="icon"
              disabled={selectedItems.length === 0}
              className="bg-[#4fb7dd]/10 hover:bg-[#4fb7dd]/20 text-[#4fb7dd] h-7 w-7"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  disabled={selectedItems.length === 0}
                  className="bg-[#fe6f6e]/10 hover:bg-[#fe6f6e]/20 text-[#fe6f6e] h-7 w-7"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the selected items? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteSelectedItems}
                    className="bg-[#fe6f6e] text-black hover:bg-[#fe6f6e]/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex-1 font-medium">Agenda Title</div>
          <div className="flex items-center gap-2 flex-shrink-0 w-[152px]">
            <span className="text-sm text-muted-foreground">Actions</span>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)] w-full">
          <div className="p-3 space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="relative flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors overflow-hidden"
              >
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => toggleSelectItem(item.id)}
                />
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                  <span className="font-medium w-6 text-center text-muted-foreground flex-shrink-0">
                    {index + 1}
                  </span>
                  {item.isEditing ? (
                    <Input
                      defaultValue={item.text}
                      onBlur={(e) => updateItem(item.id, e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        updateItem(
                          item.id,
                          (e.target as HTMLInputElement).value,
                        )
                      }
                      autoFocus
                      className="flex-1 min-w-[50px]"
                    />
                  ) : (
                    <div className="flex-1 min-w-[50px] max-w-full">
                      <p className="text-sm sm:text-base truncate">
                        {item.text}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-[152px]">
                  <TooltipProvider>
                    <div className="inline-flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="bg-[#2bbc9c]/10 hover:bg-[#2bbc9c]/20 text-[#2bbc9c] h-8 w-8"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Start Poll</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => toggleEdit(item.id)}
                            className="bg-[#4fb7dd]/10 hover:bg-[#4fb7dd]/20 text-[#4fb7dd] h-8 w-8"
                          >
                            {item.isEditing ? (
                              <Save className="h-4 w-4" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {item.isEditing ? "Save" : "Edit"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => duplicateItem(item)}
                            className="bg-[#4fb7dd]/10 hover:bg-[#4fb7dd]/20 text-[#4fb7dd] h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate</TooltipContent>
                      </Tooltip>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="bg-[#fe6f6e]/10 hover:bg-[#fe6f6e]/20 text-[#fe6f6e] h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Agenda Item
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this agenda item?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteItem(item.id)}
                              className="bg-[#fe6f6e] text-black hover:bg-[#fe6f6e]/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
          {items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                No agenda items available. Start by adding one!
              </p>
            </div>
          )}
        </ScrollArea>
      </Card>

      <div className="flex flex-wrap gap-3 justify-center py-4">
        <Button
          variant="outline"
          className="px-6 bg-[#0EA0AB]/10 hover:bg-[#0EA0AB]/20 text-[#0EA0AB]"
        >
          Operator Panel
        </Button>
        <Button
          variant="outline"
          className="px-6 bg-[#2BBC9C]/10 hover:bg-[#2BBC9C]/20 text-[#2BBC9C]"
        >
          Start Online Session
        </Button>
        <Button
          variant="outline"
          className="px-6 bg-[#28C2FF]/10 hover:bg-[#28C2FF]/20 text-[#28C2FF]"
          disabled={items.length === 0}
        >
          Export
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="px-6 bg-[#ED4E58]/10 hover:bg-[#ED4E58]/20 text-[#ED4E58]"
              disabled={items.length === 0}
            >
              Clear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Agenda Items</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear all agenda items? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={clearItems}
                className="bg-[#FFD600] text-black hover:bg-[#FFD600]/90"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
