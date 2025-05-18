import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { NavLink, Link } from "react-router-dom";
import {
  Bell,
  Home,
  LogOut,
  User,
  Users,
  MessageSquareMore,
} from "lucide-react";
import { useGetUnreadMessagesCount } from "../../hooks/useChat";

const Navbar = () => {
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]); // Lấy dữ liệu từ cache

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => axiosInstance.get("/notifications"),
    enabled: !!authUser,
  });

  const { data: connectionRequests } = useQuery({
    queryKey: ["connectionRequests"],
    queryFn: async () => axiosInstance.get("/connections/requests"),
    enabled: !!authUser,
  });

  const { mutate: logout } = useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const unreadNotificationCount = notifications?.data.filter(
    (notif) => !notif.read
  ).length;
  const unreadConnectionRequestsCount = connectionRequests?.data?.length;

  const { data: unreadMessagesCount } = useGetUnreadMessagesCount();

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center relative h-full ${
      isActive
        ? "text-blue-600 font-semibold border-b-2 py-2 px-1"
        : "text-neutral px-1"
    }`;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-10 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4  py-2">
            <Link to="/">
              <img className="h-8 rounded" src="/gettech.webp" alt="LinkedIn" />
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {authUser ? (
              <>
                <NavLink
                  to={"/"}
                  className={({ isActive }) => navLinkClass({ isActive })}
                >
                  <Home size={20} />
                  <span className="text-xs hidden md:block">Home</span>
                </NavLink>
                <NavLink
                  to="/network"
                  className={({ isActive }) => navLinkClass({ isActive })}
                >
                  <Users size={20} />
                  <span className="text-xs hidden md:block">My Network</span>
                  {unreadConnectionRequestsCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {unreadConnectionRequestsCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/messages"
                  className={({ isActive }) => navLinkClass({ isActive })}
                >
                  <MessageSquareMore size={20} />
                  <span className="text-xs hidden md:block">Messages</span>
                  {unreadMessagesCount?.unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-2 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {unreadMessagesCount?.unreadCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/notifications"
                  className={({ isActive }) => navLinkClass({ isActive })}
                >
                  <Bell size={20} />
                  <span className="text-xs hidden md:block">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center"
                    >
                      {unreadNotificationCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to={`/profile/${authUser.username}`}
                  className={({ isActive }) => navLinkClass({ isActive })}
                >
                  <User size={20} />
                  <span className="text-xs hidden md:block">Me</span>
                </NavLink>
                <button
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => logout()}
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
