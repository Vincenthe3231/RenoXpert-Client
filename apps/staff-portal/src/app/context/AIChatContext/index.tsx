"use client";
import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    SetStateAction,
    Dispatch,
} from "react";
import useSWR from "swr";
const getFetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}`);
    }
    return res.json();
};

const postFetcher = async (url: string, payload?: any) => {
    const body = payload && typeof payload === "object" && "arg" in payload
        ? (payload as { arg: any }).arg
        : payload;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error(`Failed to post ${url}`);
    }
    return res.json();
};

const sendMessageToGemini = async (text: string) => {
    const response = await postFetcher("/api/chat-ai", { text });
    const aiReply = response?.data?.[1]?.text || response?.data?.text || "";
    if (!aiReply) {
        throw new Error("No AI response");
    }
    return aiReply;
};
import {
    ChatAIMessage,
    ChatSession,
} from "@/app/(DashboardLayout)/types/apps/ai-chat";

type ChatAIContextType = {
    chatList: ChatAIMessage[];
    setChatList: Dispatch<SetStateAction<ChatAIMessage[]>>;
    loading: boolean;
    error: string;
    sendMessage: (text: string, useGemini: boolean) => Promise<void>;
    typing: boolean;
    chatSessions: ChatSession[];
    saveSession: (userText: string, aiText: string) => void;
    setChatSessions: Dispatch<SetStateAction<ChatSession[]>>;
    setTyping: Dispatch<SetStateAction<boolean>>;
};

// Create context
export const ChatAIContext = createContext<ChatAIContextType | undefined>(
    undefined
);

// Provider
export const ChatAIProvider = ({ children }: { children: ReactNode }) => {
    const [chatList, setChatList] = useState<ChatAIMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [typing, setTyping] = useState(false);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const { data, error: swrError, mutate } = useSWR("/api/chat-ai", getFetcher);

    // On fetch success
    useEffect(() => {
        if (data?.data) {
            setChatList(data.data);
            setLoading(false);
        }
        if (swrError) {
            setError("Failed to fetch chat.");
            setLoading(false);
        }
    }, [data, swrError]);

    //for save  history

    const saveSession = (userText: string, aiText: string) => {
        const sessionTimestamp = Date.now();

        const newSession: ChatSession = {
            id: sessionTimestamp.toString(),
            title: userText,
            messages: [
                { id: sessionTimestamp, sender: "user", text: userText },
                { id: sessionTimestamp + 1, sender: "ai", text: aiText },
            ],
            timestamp: sessionTimestamp,
            status: "active",
        };

        setChatSessions((prev) => [...prev, newSession]);
    };

    const sendMessage = async (text: string, useGemini = true) => {
        try {
            setTyping(true);

            if (useGemini) {
                // Generate unique IDs
                const userMessage: ChatAIMessage = {
                    id: Date.now(),
                    sender: "user",
                    text,
                };
                setChatList((prev) => [...prev, userMessage]);

                const aiResponse = await sendMessageToGemini(text);

                const aiMessage: ChatAIMessage = {
                    id: Date.now() + 1,
                    sender: "ai",
                    text: aiResponse,
                };

                saveSession(text, aiResponse);
                setChatList((prev) => [...prev, aiMessage]);
            } else {
                const response = await postFetcher("/api/chat-ai", { text });

                const [userMsg, aiReply] = response.data;

                setChatList((prev) => [...prev, userMsg, aiReply]);

                saveSession(userMsg.text, aiReply.text);
            }
        } catch (err) {
            setError("Failed to send message");
            console.error(err);
        } finally {
            setTyping(false);
        }
    };



    return (
        <ChatAIContext.Provider
            value={{
                setTyping,
                setChatSessions,
                saveSession,
                chatSessions,
                chatList,
                setChatList,
                loading,
                error,
                typing,
                sendMessage,
            }}
        >
            {children}
        </ChatAIContext.Provider>
    );
};
