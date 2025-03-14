// store/slices/senseiMasterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Message = {
  id: number;
  text: string;
  actions?: string[];
  question_id?: number;
  sender: "user" | "ai";
  timestamp: string;
  trigger_type?: "single-regen" | "option" | "check-compatibility";
};

const defaultDraggablePosition = {
  x: typeof window !== "undefined" ? window.innerWidth - 100 : 0,
  y: typeof window !== "undefined" ? window.innerHeight - 500 : 0,
};

interface SenseiMasterState {
  count: number;
  animationState: any;
  isCollapsed: boolean;
  triggerType?: string;
  actionMessage?: string;
  currentQuestionType?: string | null;
  question?: string;
  currentQuestion?: {
    question: {
      Question: string;
      "Option type": string;
      Options: string[];
    };
  };
  isPinned: boolean;
  isDragging: boolean;
  startPos: { x: number; y: number };
  defaultPosition: { x: number; y: number };
  windowWidth: number;
  windowHeight: number;
  messages: Message[];
}

const initialState: SenseiMasterState = {
  count: 0,
  animationState: "Sleeping",
  actionMessage: "",
  currentQuestionType: null,
  isCollapsed: true,
  triggerType: "",
  question: "",
  isPinned: false,
  isDragging: false,
  startPos: { x: 0, y: 0 },
  defaultPosition: defaultDraggablePosition,
  windowWidth: typeof window !== "undefined" ? window.innerWidth : 0,
  windowHeight: typeof window !== "undefined" ? window.innerHeight : 0,
  messages: [],
};

export const senseiMasterSlice = createSlice({
  name: "senseiMaster",
  initialState,
  reducers: {
    setCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    setAnimationState: (state, action: PayloadAction<any>) => {
      state.animationState = action.payload;
    },
    setActionMessage: (state, action: PayloadAction<any>) => {
      state.actionMessage = action.payload;
    },
    setCurrentQuestionType: (state, action: PayloadAction<any>) => {
      state.currentQuestionType = action.payload;
    },
    toggleCollapse: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    setCurrentQuestion: (state, action: PayloadAction<any>) => {
      state.currentQuestion = action.payload;
    },
    setIsPinned: (state, action: PayloadAction<boolean>) => {
      state.isPinned = action.payload;
    },
    setIsCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
    setStartPos: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.startPos = action.payload;
    },
    setDefaultPosition: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.defaultPosition = action.payload;
    },
    setWindowWidth: (state, action: PayloadAction<number>) => {
      state.windowWidth = action.payload;
    },
    setWindowHeight: (state, action: PayloadAction<number>) => {
      state.windowHeight = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (
      state,
      action: PayloadAction<{ id: number; text: string }>
    ) => {
      const message = state.messages.find(
        (msg) => msg.id === action.payload.id
      );
      if (message) {
        message.text = action.payload.text;
      }
    },
  },
});

export const {
  setCount,
  setAnimationState,
  toggleCollapse,
  setActionMessage,
  setIsPinned,
  setIsCollapsed,
  setCurrentQuestion,
  setIsDragging,
  setStartPos,
  setDefaultPosition,
  setWindowWidth,
  setWindowHeight,
  setCurrentQuestionType,
  setMessages,
  addMessage,
  updateMessage,
} = senseiMasterSlice.actions;

export default senseiMasterSlice.reducer;
