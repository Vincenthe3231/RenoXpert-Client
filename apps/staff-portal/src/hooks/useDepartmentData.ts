import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export const colorSchemeOptions = [
  { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-500" },
  { value: "violet", label: "Violet", class: "bg-violet-500" },
  { value: "amber", label: "Amber", class: "bg-amber-500" },
  { value: "slate", label: "Slate", class: "bg-slate-500" },
] as const;

export type ColorScheme = typeof colorSchemeOptions[number]["value"];

interface AddDepartmentParams {
  name: string;
  colorScheme: ColorScheme;
}

export function useAddDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: AddDepartmentParams) => {
      // Transform camelCase to snake_case for Laravel backend
      const payload = {
        name: params.name,
        color_scheme: params.colorScheme
      };
      const response = await axios.post("/api/departments", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create department";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    },
  });
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  colorScheme: ColorScheme;
  createdAt?: string;
  memberCount?: number;
}

// Fallback to hardcoded departments if API fails
import { UserDepartments } from "@/lib/api/auth";

const fallbackDepartments: Department[] = UserDepartments.map((dept, index) => ({
  id: `fallback-${index}`,
  name: dept,
  colorScheme: (["cyan", "pink", "emerald", "violet", "amber", "slate"] as ColorScheme[])[index % 6] || "cyan",
}));

export function useDepartments() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/departments");
        return response.data as { data: Department[] };
      } catch (err) {
        // If API fails, return fallback departments
        console.warn("Failed to fetch departments from API, using fallback list", err);
        return { data: fallbackDepartments };
      }
    },
    retry: 1, // Only retry once
  });

  return {
    data: data?.data || fallbackDepartments,
    isLoading,
    error,
  };
}

interface UpdateDepartmentParams {
  id: string;
  updates: {
    name?: string;
    description?: string;
    colorScheme?: ColorScheme;
  };
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateDepartmentParams) => {
      const response = await axios.patch(`/api/departments/${params.id}`, params.updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update department";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/departments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete department";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    },
  });
}

