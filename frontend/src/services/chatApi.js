import { axiosInstance } from "../lib/axios";

export const getUsers = async () => {
  const res = await axiosInstance.get("/messages/users/lastMessages");
  return res.data;
};

export const getMessages = async (userId) => {
  const res = await axiosInstance.get(`/messages/${userId}`);
  return res.data;
};

export const getUnreadMessagesCount = async () => {
  const res = await axiosInstance.get("/messages/unreadMessagesCount");
  return res.data;
};

export const sendMessage = async ({ userId, messageData }) => {
  const res = await axiosInstance.post(`/messages/send/${userId}`, messageData);
  return res.data;
};

export const getLatestMessages = async () => {
  const res = await axiosInstance.get("/messages/user/latest");
  return res.data;
};

export const markMessagesAsRead = async (userId) => {
  const res = await axiosInstance.put(`/messages/read/${userId}`);
  return res.data;
};

export const markMessagesAsReadWhileMessaging = async (userId) => {
  const res = await axiosInstance.put(`/messages/readWhileMessaging/${userId}`);
  return res.data;
};
