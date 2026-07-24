import { create } from "zustand";


export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}


interface ChatState {

  messages: ChatMessage[];

  loading: boolean;


  addMessage: (
    message: ChatMessage
  ) => void;


  setMessages: (
    messages: ChatMessage[]
  ) => void;


  clearMessages: () => void;


  setLoading: (
    loading: boolean
  ) => void;

}



export const useChatStore =
create<ChatState>((set) => ({

  messages: [],

  loading: false,


  /*
  |--------------------------------------------------------------------------
  | Add New Message
  |--------------------------------------------------------------------------
  */

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        message,
      ],
    })),



  /*
  |--------------------------------------------------------------------------
  | Replace Messages
  |--------------------------------------------------------------------------
  */

  setMessages: (messages) =>
    set({
      messages,
    }),



  /*
  |--------------------------------------------------------------------------
  | Clear Conversation
  |--------------------------------------------------------------------------
  */

  clearMessages: () =>
    set({
      messages: [],
      loading: false,
    }),



  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  setLoading: (loading) =>
    set({
      loading,
    }),


}));