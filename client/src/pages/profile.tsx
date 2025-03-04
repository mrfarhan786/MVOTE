import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";

const updateProfileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      "Password must be at least 8 characters",
    )
    .refine(
      (val) => !val || /[A-Z]/.test(val),
      "Password must contain at least one uppercase letter",
    )
    .refine(
      (val) => !val || /[a-z]/.test(val),
      "Password must contain at least one lowercase letter",
    )
    .refine(
      (val) => !val || /[0-9]/.test(val),
      "Password must contain at least one number",
    ),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      password: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      try {
        const res = await apiRequest("PATCH", "/api/user", data, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }
        const updatedUser = await res.json();
        clearTimeout(timeoutId);
        return updatedUser;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["/api/user"] });
      const previousUser = queryClient.getQueryData<User>(["/api/user"]);

      // Optimistically update only the fields that are being changed
      const optimisticUser = {
        ...previousUser,
        ...(newData.username && { username: newData.username }),
        ...(newData.firstName && { firstName: newData.firstName }),
        ...(newData.lastName && { lastName: newData.lastName }),
      };

      queryClient.setQueryData(["/api/user"], optimisticUser);
      return { previousUser };
    },
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      setIsEditing(false);
      form.reset();
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    },
    onError: (error: Error, _, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["/api/user"], context.previousUser);
      }

      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.name === "AbortError"
            ? "Request timed out. Please try again."
            : error.message || "Failed to update profile. Please try again.",
      });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const { imageUrl } = await res.json();

      const updateRes = await apiRequest("PATCH", "/api/user", {
        profileImage: imageUrl,
      });
      const updatedUser = await updateRes.json();
      queryClient.setQueryData(["/api/user"], updatedUser);

      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = (data: UpdateProfileData) => {
    const updateData = {
      ...data,
      password: data.password || undefined,
    };
    updateProfileMutation.mutate(updateData);
  };

  const handleEdit = () => {
    setIsEditing(true);
    form.reset({
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      password: "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset({
      username: user?.username || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      password: "",
    });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] p-5">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline" className="gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  type="submit"
                  form="profile-form"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <Card className="border shadow-sm">
            <CardHeader className="pb-1 space-y-1"></CardHeader>

            <CardContent className="grid gap-6">
              <div className="flex justify-center">
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg transition-all duration-200 group-hover:ring-primary/20">
                    {user?.profileImage ? (
                      <AvatarImage
                        src={user.profileImage}
                        alt={user.username}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-xl">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label
                    htmlFor="profile-image"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex flex-col items-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                        <line x1="16" x2="22" y1="5" y2="5" />
                        <line x1="19" x2="19" y1="2" y2="8" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      <span className="text-sm mt-1">Change</span>
                    </div>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-2" />

              <form
                id="profile-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      disabled={!isEditing || updateProfileMutation.isPending}
                      className={`${form.formState.errors.firstName ? "border-destructive" : ""} ${!isEditing ? "bg-muted" : ""}`}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      disabled={!isEditing || updateProfileMutation.isPending}
                      className={`${form.formState.errors.lastName ? "border-destructive" : ""} ${!isEditing ? "bg-muted" : ""}`}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...form.register("username")}
                      disabled={!isEditing || updateProfileMutation.isPending}
                      className={`${form.formState.errors.username ? "border-destructive" : ""} ${!isEditing ? "bg-muted" : ""}`}
                    />
                    {form.formState.errors.username && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email} disabled className="bg-muted" />
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                      disabled={updateProfileMutation.isPending}
                      placeholder="Leave blank to keep current password"
                      className={
                        form.formState.errors.password
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
