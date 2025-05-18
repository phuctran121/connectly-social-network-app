import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { hideNotification } from "../store/slices/notificationSlice";

const Notification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isVisible, message, postId } = useSelector(
    (state) => state.notification
  );

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, dispatch]);

  if (!isVisible) return null;

  const handleClick = () => {
    if (postId) {
      navigate(`/post/${postId}`);
      dispatch(hideNotification());
    }
  };

  return (
    <div
      className="
        fixed bottom-5 right-5 bg-gradient-to-r from-blue-500 to-indigo-600 
        text-white p-4 rounded-lg shadow-xl z-50 max-w-xs w-full cursor-pointer
        animate-[slideIn_0.3s_ease-out,slideOut_0.3s_ease-out_2.7s_forwards]
        hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200
      "
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{message.split(":")[0]}</p>
          <p className="text-xs opacity-90">{message.split(":")[1]}</p>
        </div>
      </div>
    </div>
  );
};

export default Notification;
