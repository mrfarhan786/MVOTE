import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompleteProfile, completeProfileSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function ProfileCompletionDialog() {
  const { user, completeProfileMutation } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(true);

  const form = useForm<CompleteProfile>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = (data: CompleteProfile) => {
    completeProfileMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  // Don't show if user is not logged in or has completed profile
  if (!user || user.profileCompleted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Fill in your profile details to enhance your experience. You can skip this step and complete it later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={completeProfileMutation.isPending}
              >
                {completeProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Skip for Now
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}