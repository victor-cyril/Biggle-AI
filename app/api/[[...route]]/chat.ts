import { Hono } from "hono";
import { z } from "zod";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  UIMessagePart,
  type UIMessage,
} from "ai";
import { ChatModel, DEVELOPMENT_GOOGLE_CHAT_MODEL } from "@/lib/ai/models";
import { zValidator } from "@hono/zod-validator";
import { getAuthUser } from "@/lib/hono/hono-middleware";
import prisma from "@/lib/prisma";
import { isProduction, myProvider } from "@/lib/ai/providers";
import { generateUUID } from "@/lib/utils";
import { HTTPException } from "hono/http-exception";
import { createNote } from "@/lib/ai/tools/create-note";
import { searchNote } from "@/lib/ai/tools/search-note";
import { webSearch } from "@/lib/ai/tools/web-search";
import { extractWebUrl } from "@/lib/ai/tools/extract-url";
import { getSystemPrompt } from "@/lib/ai/prompt";
import {
  checkGenerationLimit,
  generateTitleForUserMessage,
} from "@/actions/server-actions/action";
import { auth } from "@/lib/auth";
import { POLAR_IMAGE_EVENT } from "@/lib/polar/plans";

const chatSchema = z.object({
  id: z.string().min(1),
  message: z.custom<UIMessage>(),
  selectedModelId: z.string() as z.ZodType<ChatModel["id"]>,
  selectedToolName: z.string().nullable(),
});

const chatIdSchema = z.object({
  id: z.string().min(1),
});

export const chatRoute = new Hono()
  .post("/", zValidator("json", chatSchema), getAuthUser, async (c) => {
    try {
      const user = c.get("user");
      const { id, message, selectedModelId, selectedToolName } =
        c.req.valid("json");

      const { isAllowed, plan } = await checkGenerationLimit(user.id);

      if (!isAllowed || !plan) {
        throw new HTTPException(403, {
          message: "Generation limit reached",
        });
      }

      let chat = await prisma.chat.findUnique({
        where: { id },
      });
      if (!chat) {
        // Generate title for the chat based on the first user message
        const title = await generateTitleForUserMessage({
          message,
        });
        // Create new chat
        chat = await prisma.chat.create({
          data: { id, title, userId: user.id },
        });
      }

      // Fetch existing messages for the chat
      const messagesFromDB = await prisma.message.findMany({
        where: { chatId: id },
        orderBy: { createdAt: "desc" },
      });

      const mapUIMessages: UIMessage[] = messagesFromDB.map((m) => ({
        id: m.id,
        role: m.role,
        parts: m.parts as UIMessagePart<any, any>[],
        metadata: {
          createdAt: m.createdAt,
        },
      }));

      // Append the new user message
      const newUIMessages = [...mapUIMessages, message];
      const modelMessages = convertToModelMessages(newUIMessages);

      // Save the new user message to the database
      await prisma.message.create({
        data: {
          id: message.id,
          chatId: id,
          role: "user",
          parts: JSON.parse(JSON.stringify(message.parts)),
        },
      });

      const modelProvider = isProduction
        ? myProvider.languageModel(selectedModelId)
        : myProvider.languageModel(DEVELOPMENT_GOOGLE_CHAT_MODEL);

      const result = streamText({
        model: modelProvider,
        system: getSystemPrompt(selectedToolName),
        messages: modelMessages,
        // for multiple tool calls, increase the step count
        stopWhen: stepCountIs(5),
        tools: {
          createNote: createNote(user.id),
          searchNote: searchNote(user.id),
          webSearch: webSearch(),
          extractWebUrl: extractWebUrl(),
        },
        toolChoice: "auto",
        onError: (error) => {
          console.log("Streaming error", error);
          throw new HTTPException(500, {
            message: "Error generating response",
          });
        },
      });

      //

      // Return the streaming response, Convert back to UIMessageStreamResponse
      return result.toUIMessageStreamResponse({
        sendSources: true,
        generateMessageId: () => generateUUID(),
        //originalMessages: newUIMessages,
        onFinish: async ({ messages, responseMessage }) => {
          try {
            // Call the polar image generation event

            if (plan === "plus") {
              await auth.api.ingestion({
                body: {
                  event: POLAR_IMAGE_EVENT,
                  metadata: { userId: user.id },
                },
                headers: c.req.raw.headers,
              });
            }

            await prisma.message.createMany({
              data: messages.map((m) => ({
                id: m.id || generateUUID(),
                chatId: id,
                role: m.role,
                parts: JSON.parse(JSON.stringify(m.parts)),
                createdAt: new Date(),
                updatedAt: new Date(),
              })),
              skipDuplicates: true,
            });
          } catch (error) {
            console.log("error", error);
          }
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        console.log("HTTP error", error);
        throw error;
      }
      throw new HTTPException(500, { message: "Internal server error" });
    }
  })
  .get("/", getAuthUser, async (c) => {
    try {
      const user = c.get("user");
      const chats = await prisma.chat.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return c.json({
        success: true,
        data: chats,
      });
    } catch (error) {
      console.log(error, "Failed to fetch chats");
      throw new HTTPException(500, { message: "Internal Server error" });
    }
  })
  .get("/:id", zValidator("param", chatIdSchema), getAuthUser, async (c) => {
    try {
      const user = c.get("user");
      const { id } = c.req.valid("param");

      const chat = await prisma.chat.findFirst({
        where: { id, userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!chat) {
        return c.json({ success: true, data: {} });
      }

      const uiMessages: UIMessage[] = chat.messages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: m.parts as UIMessagePart<any, any>[],
        metadata: { createdAt: m.createdAt },
      }));

      const chatWithMsg = {
        ...chat,
        messages: uiMessages,
      };

      return c.json({
        success: true,
        data: chatWithMsg,
      });
    } catch (error) {
      console.log(error, "Failed to fetch chat");
      throw new HTTPException(500, { message: "Internal Server error" });
    }
  });
