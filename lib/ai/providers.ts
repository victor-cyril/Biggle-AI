import { customProvider } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { google } from "@ai-sdk/google";
import { chatModels, DEVELOPMENT_GOOGLE_CHAT_MODEL } from "./models";

const NODE_ENV = process.env.NODE_ENV!;

export const isProduction = NODE_ENV === "production";

const createLanguageModels = (isProduction: boolean) => {
  const models: { [key: string]: any } = {};

  // Production models
  chatModels.forEach(
    (model) => (models[model.id] = gateway.languageModel(model.id))
  );

  // Development model for testing
  models[DEVELOPMENT_GOOGLE_CHAT_MODEL] = google.languageModel(
    DEVELOPMENT_GOOGLE_CHAT_MODEL
  );

  // Special title generation model
  models["title-model"] = isProduction
    ? gateway.languageModel("google/gemini-2.5-flash")
    : google.languageModel(DEVELOPMENT_GOOGLE_CHAT_MODEL);

  return models;
};

export const myProvider = customProvider({
  languageModels: createLanguageModels(isProduction),
});
