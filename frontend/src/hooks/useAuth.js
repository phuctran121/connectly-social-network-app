import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  checkAuth,
  signup,
  login,
  logout,
  updateProfile,
  cancelConnectionRequest,
} from "../services/authApi";
import toast from "react-hot-toast";

export const useCheckAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: checkAuth,
    retry: false,
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast.success("Logged in successfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
};

export const useCancelConnectionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId) => cancelConnectionRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(["connectionRequests"]);
      toast.success("Connection request cancelled successfully");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
};
