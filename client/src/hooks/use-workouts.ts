import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertWorkoutLog } from "@shared/schema";

// === Workouts ===

export function useWorkouts(type?: 'hero' | 'villain' | 'custom') {
  return useQuery({
    queryKey: [api.workouts.list.path, type],
    queryFn: async () => {
      const url = type 
        ? `${api.workouts.list.path}?type=${type}` 
        : api.workouts.list.path;
        
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch workouts");
      return api.workouts.list.responses[200].parse(await res.json());
    },
  });
}

export function useWorkout(slug: string) {
  return useQuery({
    queryKey: [api.workouts.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.workouts.get.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch workout");
      return api.workouts.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

// === Logs & History ===

export function useWorkoutLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      const res = await fetch(api.logs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertWorkoutLog) => {
      const res = await fetch(api.logs.create.path, {
        method: api.logs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.logs.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save workout log");
      }
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.user.progress.path] });
      toast({
        title: "Workout Complete!",
        description: "Your progress has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// === User Progress ===

export function useUserProgress() {
  return useQuery({
    queryKey: [api.user.progress.path],
    queryFn: async () => {
      const res = await fetch(api.user.progress.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch progress");
      return api.user.progress.responses[200].parse(await res.json());
    },
  });
}

export function useTogglePro() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (isPro: boolean) => {
      const res = await fetch(api.user.togglePro.path, {
        method: api.user.togglePro.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPro }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update subscription");
      return api.user.togglePro.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.user.progress.path] });
      // Also invalidate user auth query to update global state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] }); 
      
      toast({
        title: data.isPro ? "Welcome to Pro!" : "Subscription Cancelled",
        description: data.isPro 
          ? "You now have access to all Villain workouts." 
          : "You have reverted to the free tier.",
        variant: "default",
      });
    },
  });
}
