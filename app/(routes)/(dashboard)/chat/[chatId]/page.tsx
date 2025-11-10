"use client";
import React from "react";
import ChatInterface from "@/components/chat";
import { useParams } from "next/navigation";
import Header from "../../_components/header";
import { useChatById } from "@/actions/chats";

const SingleChat = () => {
  const params = useParams();
  const chatId = params.chatId as string;

  const { data, isLoading } = useChatById({
    id: chatId,
    enabled: true,
  });

  const chat = data ?? {};

  const title = chat?.title ?? "Untitled";
  const initialMessages = chat?.messages ?? [];

  console.log({ chat, initialMessages });

  return (
    <>
      <Header title={title} showActions />
      <div className="relative w-full">
        <ChatInterface
          chatId={chatId}
          initialMessages={initialMessages}
          initialLoading={isLoading}
          onlyInput={false}
        />
      </div>
    </>
  );
};

export default SingleChat;
