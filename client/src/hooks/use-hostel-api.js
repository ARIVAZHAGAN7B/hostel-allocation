import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiGetHostels,
  apiGetHostelById,
  apiGetRooms,
  apiGetRoommateMatches,
  apiSendRoommateRequest,
  apiGetComplaints,
  apiCreateComplaint,
  apiGetPayments,
  apiGetAttendance,
  apiMarkAttendance,
  apiGetNotifications,
  apiGetStats,
  apiGetMe,
  apiUpdateProfile,
  apiSubmitApplication,
  apiSubmitRoomChange,
  apiGetApplications,
  apiGetRoomChangeRequests,
  apiUpdateApplicationStatus,
  apiUpdateRoomChangeStatus,
  getCurrentUser,
} from "../lib/api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const me = await apiGetMe();
      if (me && !me.error) return me;
      return getCurrentUser();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiUpdateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useHostels(type = "All", search = "") {
  return useQuery({
    queryKey: ["hostels", type, search],
    queryFn: () => apiGetHostels(type, search),
    staleTime: 1000 * 60 * 5,
  });
}

export function useHostelDetails(id) {
  return useQuery({
    queryKey: ["hostel", id],
    queryFn: () => apiGetHostelById(id),
    enabled: !!id,
  });
}

export function useRooms(params = {}) {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: () => apiGetRooms(params),
  });
}

export function useApplications(params = {}) {
  return useQuery({
    queryKey: ["applications", params],
    queryFn: () => apiGetApplications(params),
    refetchInterval: 3000,
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiSubmitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, allottedRoom }) => apiUpdateApplicationStatus(id, status, allottedRoom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useRoomChangeRequests(params = {}) {
  return useQuery({
    queryKey: ["room-changes", params],
    queryFn: () => apiGetRoomChangeRequests(params),
    refetchInterval: 3000,
  });
}

export function useSubmitRoomChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiSubmitRoomChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-changes"] });
    },
  });
}

export function useUpdateRoomChangeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, allottedRoom }) => apiUpdateRoomChangeStatus(id, status, allottedRoom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-changes"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useRoommateMatches(params = {}) {
  return useQuery({
    queryKey: ["roommates", params],
    queryFn: () => apiGetRoommateMatches(params),
  });
}

export function useComplaints(params = {}) {
  return useQuery({
    queryKey: ["complaints", params],
    queryFn: () => apiGetComplaints(params),
  });
}

export function usePayments(params = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => apiGetPayments(params),
  });
}

export function useAttendance(params = {}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => apiGetAttendance(params),
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiMarkAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => apiGetNotifications(params),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: apiGetStats,
  });
}

export function useSendRoommateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiSendRoommateRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roommates"] });
    },
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiCreateComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}
