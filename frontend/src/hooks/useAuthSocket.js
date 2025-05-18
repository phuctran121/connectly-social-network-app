// src/hooks/useAuthSocket.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setOnlineUsers } from "../store/slices/authSlice";
import { useCheckAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { initSocket, disconnectSocket } from "../lib/socket";
import { showNotification } from "../store/slices/notificationSlice";

export const useAuthSocket = () => {
  const dispatch = useDispatch();
  const { data: authUser, isSuccess } = useCheckAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isSuccess && authUser?._id) {
      const socket = initSocket(authUser._id);

      socket.on("getOnlineUsers", (userIds) => {
        dispatch(setOnlineUsers(userIds));
      });

      const handleNewNotification = () => {
        queryClient.invalidateQueries({ queryKey: ["unreadMessagesCount"] });
      };

      socket.on("newMessageNotification", handleNewNotification);

      const handleNewConnectionRequest = () => {
        queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      };

      socket.on("newConnectionRequest", handleNewConnectionRequest);

      const handleNewAcceptedConnectionRequest = () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      };

      socket.on(
        "newAcceptedConnectionRequest",
        handleNewAcceptedConnectionRequest
      );

      const handleNewLike = () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      };

      socket.on("newLike", handleNewLike);

      const handleNewComment = (data) => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        const userName = data?.comment?.user || "Someone";
        const content = data?.comment?.content || "left a comment";

        console.log("New comment data:", data);

        dispatch(
          showNotification({
            message: `${userName}: ${content}`,
            postId: data?.postId || null,
          })
        );
      };

      socket.on("newComment", handleNewComment);
    }

    return () => {
      disconnectSocket();
    };
  }, [authUser?._id, isSuccess, dispatch, queryClient]);
};
