"use client";

import {
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
  useId,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AutosizeTextarea } from "../ui/autosize-textarea";
import { Brain, X, Send, Pin, PinOff } from "lucide-react";
import { cn, formatString, generateInitials } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import store, { RootState } from "@/redux/store";
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";
import { useSensei } from "@/contexts/SenseiContext";

// The AI message is being added twice because:
// 1. It's added once in the `addAiMessage` function
// 2. It's added again when the socket receives the "ai_message" event
// To fix this, we should only add the message in one place, preferably when receiving the socket event

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
};

const getCurrentTimestamp = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hello there",
    sender: "ai",
    timestamp: getCurrentTimestamp(),
  },
  {
    id: 2,
    text: "I'm an automated chatbot here to answer your questions. Please feel free to ask me anything to get started.",
    sender: "ai",
    timestamp: getCurrentTimestamp(),
  },
];

const suggestedQuestions = [
  "How do I create a survey?",
  "Can I customize the survey design and layout?",
  "Can I create surveys in different languages?",
];

type Props = {
  isOpen: boolean;
  toggleCollapse: ActionCreatorWithoutPayload<"senseiMaster/toggleCollapse">;
  isPinned: boolean;
  setIsPinned: (isPinned: boolean) => void;
  pinToSide: () => void;
  setDefaultPosition: (position: { x: number; y: number }) => void;
  senseiStateSetter: (
    state:
      | "sleep"
      | "be idle"
      | "start talking"
      | "start thinking"
      | "stop talking"
  ) => void;
};

const SenseiMasterChat: React.FC<Props> = ({
  toggleCollapse,
  isOpen,
  senseiStateSetter,
  setDefaultPosition,
  isPinned,
  pinToSide,
  setIsPinned,
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const conversation_id = store.getState().survey.conversation_id;
  // const survey_id = store.getState().survey.id; // Changed from 'i' to 'id'

  const { aiResponse, loading, isConnected, emitEvent, socketIo, setLoading } =
    useSensei();

  useEffect(() => {
    socketIo?.onAny((eventName: string, ...args: any) => {
      handleEvent(eventName, ...args);
    });
  }, [socketIo]);

  const handleEvent = (eventName: string, ...args: any[]) => {
    switch (eventName) {
      case "ai_message":
        handleAiMessage(args[0].response);
        break;
      // Add more cases for different events here
      default:
        break;
    }
  };

  const handleAiMessage = (aiResponseText: string) => {
    setLoading(false);
    const formattedResponse = formatString(aiResponseText);
    addAiMessage(formattedResponse);
  };

  const addUserMessage = () => {
    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: "user",
      timestamp: getCurrentTimestamp(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
  };

  const addAiMessage = (text: string) => {
    const aiMessageId = Date.now() + Math.floor(Math.random() * 1000000);
    const aiMessage: Message = {
      id: aiMessageId,
      text: text,
      sender: "ai",
      timestamp: getCurrentTimestamp(),
    };
    setMessages((prevMessages) => {
      // Check if the message already exists
      const messageExists = prevMessages.some((msg) => msg.text === text);
      if (!messageExists) {
        return [...prevMessages, aiMessage];
      }
      return prevMessages;
    });
    simulateTyping(text, aiMessageId);
  };

  const simulateTyping = (text: string, messageId: number) => {
    senseiStateSetter("start talking");
    let displayedText = "";
    const totalTime = text.length * 20;

    text.split("").forEach((char, index) => {
      setTimeout(() => {
        displayedText += char;
        updateMessage(messageId, displayedText);
      }, index * 20);
    });

    setTimeout(() => {
      senseiStateSetter("stop talking");
    }, totalTime);
  };

  const updateMessage = (messageId: number, text: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === messageId ? { ...msg, text } : msg))
    );
  };

  const handleSendMessage = () => {
    const payload = {
      conversation_id,
      query: "generate two single questions",
      survey_id: "66c5fe26ee8565ca5ffc732a",
      survey_stage: "generation",
    };
    emitEvent("user-message", payload);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      senseiStateSetter("start thinking");
      addUserMessage();
      const payload = {
        conversation_id,
        query: input.trim(),
        survey_id: "66c5fe26ee8565ca5ffc732a",
        survey_stage: "generation",
      };
      console.log("user_message", payload);
      emitEvent("user_message", payload);
    }
  };

  useEffect(() => {
    senseiStateSetter(loading ? "start thinking" : "be idle");
  }, [loading, senseiStateSetter]);

  const getCurrentTimestamp = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5b03b2] rounded-t-md to-[#9d50bb] text-white p-4 pt-10 cursor-move">
        <p className="text-xl font-bold text-white text-left">Sensei</p>
        <div
          className="absolute right-4 top-3 p-0 flex justify-end gap-2"
          onMouseDown={(event) => {
            setStartPos({ x: event.clientX, y: event.clientY });
            setIsDragging(false);
          }}
          onMouseMove={(event) => {
            const distanceMoved = Math.sqrt(
              Math.pow(event.clientX - startPos.x, 2) +
                Math.pow(event.clientY - startPos.y, 2)
            );
            if (distanceMoved > 5) setIsDragging(true);
          }}
          onMouseUp={() => {
            if (!isDragging) dispatch(toggleCollapse());
          }}
        >
          {/* Pin Button */}
          <Button
            variant="ghost"
            size="icon"
            className="p-0 size-8 text-white rounded-full hover:bg-white/20 hover:text-white"
            onClick={() => {
              if (isPinned) {
                setIsPinned(false);
              } else {
                pinToSide();
              }
            }}
          >
            {isPinned ? (
              <PinOff className="size-5 rotate-45" />
            ) : (
              <Pin className="size-5 rotate-45" />
            )}
          </Button>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="p-0 size-8 text-white rounded-full hover:bg-white/20 hover:text-white"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 px-0 space-y-4">
        <AnimatePresence>
          {messages.map((message: Message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.sender !== "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={cn(
                  `max-w-[95%] sm:max-w-[80%] p-3 py-0 rounded-lg flex gap-x-3 items-start`,
                  message.sender !== "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex justify-center items-center size-6 sm:size-10 shrink-0 bg-[#EAD6FF30] rounded-full shadow-md",
                    message.sender !== "user" ? "bg-[#EAD6FF30]" : "bg-white"
                  )}
                >
                  {message.sender === "ai" ? (
                    <Brain className="inline-block size-4 sm:size-5 text-purple-600 shrink-0" />
                  ) : (
                    <div className="font-semibold size-8 rounded-full flex items-center justify-center cursor-pointer">
                      {generateInitials((user as any)?.name ?? "")}
                    </div>
                  )}
                </div>
                <div className="grid">
                  <p
                    className={cn(
                      "text-sm p-3 rounded-lg rounded-tl-none text-left",
                      message.sender !== "user"
                        ? "bg-purple-600 text-white"
                        : "bg-[#F1F7FF] text-gray-800"
                    )}
                  >
                    {message.text}
                  </p>
                  <p
                    className={cn(
                      "text-[0.65rem] mt-0.5 opacity-70",
                      message.sender === "user"
                        ? "justify-self-start"
                        : "justify-self-end"
                    )}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Ref to scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>
      {/* Message Input Section */}
      <div className="bg-white">
        <div className="flex flex-wrap gap-2 mb-4 px-2">
          {/* Optional suggested questions section */}
        </div>
        <div className="flex items-center space-x-2 border-t border-border px-2">
          <AutosizeTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Reply"
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border-none py-2 h-8 p-2 outline-transparent outline-offset-0 focus:outline-none focus-visible:outline-none resize-none"
            maxHeight={200}
            onKeyDown={() => senseiStateSetter("be idle")}
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={Boolean(input.trim().length < 1)}
            size="icon"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full size-8"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SenseiMasterChat;