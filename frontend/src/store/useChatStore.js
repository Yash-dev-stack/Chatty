import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "./../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: true,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const repsonse = await axiosInstance.get("message/user");
      set({ users: repsonse.data });
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`message/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      toast.error(error.repsonse.data.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (message) => {
    const { messages, selectedUser } = get();
    try {
      const response = await axiosInstance.post(
        `message/send/${selectedUser._id}`,
        message
      );
      set({ messages: [...messages, response.data] });
    } catch (error) {
      toast.error("errrl");
      console.log("errepre", error);
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSendFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSendFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: async (selectedUser) => set({ selectedUser }),
}));
