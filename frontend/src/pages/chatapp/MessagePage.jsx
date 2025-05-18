import NoChatSelected from "../../components/messagePage/NoChatSelected";
import MessageSidebar from "../../components/messagePage/MessageSideBar";
import ChatContainer from "../../components/messagePage/ChatContainer";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { getSocket } from "../../lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { resetSelectedUser } from "../../store/slices/chatSlice"; // Import action để reset selectedUser

const MessagePage = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch(); // Thêm useDispatch
  const selectedUser = useSelector((state) => state.chat.selectedUser);
  const notificationSound = new Audio(`/sounds/notification.mp3`);

  const selectedUserRef = useRef(selectedUser);

  useEffect(() => {
    dispatch(resetSelectedUser());
  }, [dispatch]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      // Lấy authUser từ cache để xác định người dùng hiện tại
      const authUser = queryClient.getQueryData(["authUser"]);
      if (!authUser) return;
      notificationSound.volume = 0.2; // Đặt âm lượng cho âm thanh thông báo
      notificationSound.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
      // Xác định người dùng liên quan đến tin nhắn
      const relatedUserId =
        newMessage.senderId === authUser._id
          ? newMessage.receiverId
          : newMessage.senderId;

      // Cập nhật danh sách người dùng trong cache
      queryClient.setQueryData(["users"], (oldUsers) => {
        if (!oldUsers) return oldUsers;

        // Tạo bản sao của danh sách người dùng
        const updatedUsers = [...oldUsers];

        // Tìm chỉ số của người dùng liên quan
        const userIndex = updatedUsers.findIndex(
          (user) => user._id === relatedUserId
        );

        const isRead = newMessage.senderId === selectedUserRef.current?._id;

        if (userIndex !== -1) {
          // Lấy người dùng ra khỏi danh sách
          const [user] = updatedUsers.splice(userIndex, 1);

          // Cập nhật thông tin lastMessage
          const updatedUser = {
            ...user,
            lastMessageSenderId: newMessage.senderId,
            lastMessageReceiverId: newMessage.receiverId,
            lastMessageTime: newMessage.createdAt,
            text: newMessage.text,
            isRead: isRead,
          };

          // Đưa người dùng lên đầu danh sách
          updatedUsers.unshift(updatedUser);
        }

        return updatedUsers;
      });
    };

    socket.on("newMessageLocal", handleNewMessage);

    return () => {
      socket.off("newMessageLocal");
    };
  }, [queryClient]);

  return (
    <div className="">
      <div className="flex items-center justify-center w-full ">
        <div className="bg-base-100 rounded-lg shadow-cl w-full h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* <Sidebar /> */}
            <MessageSidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MessagePage;
