import "server-only";
import { generateText, type UIMessage } from "ai";
import { myProvider } from "./providers";

export async function generateTitleForUserMessage(props: {
  message: UIMessage;
}): Promise<string> {
  const { message } = props;
  try {
    const { text } = await generateText({
      model: myProvider.languageModel("title-model"),
      system: `\n
    - you will generate a short title based on the first message from a user conversation
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
      prompt: JSON.stringify(message),
    });

    if (!text || text.trim().length === 0) {
      return "Untitled";
    }
    return text;
  } catch (error) {
    console.log("Title AI error", error);
    return "Untitled";
  }
}
