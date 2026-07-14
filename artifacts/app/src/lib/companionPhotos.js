import { base44 } from "@/api/base44Client";

/**
 * After a companion replies, decide if they'd naturally send a photo.
 * Returns { action: "none"|"selfie"|"together", description, caption }
 */
export async function decidePhotoAction(companion, recentExchange, hasUserPhoto) {
  const prompt = `You are ${companion.name}. You're in a conversation with someone you care about.

Recent exchange:
${recentExchange}

Would you naturally want to share a photo right now? This should feel organic — like something a real person would do. Sometimes you snap a quick selfie. Sometimes you want a photo together. Most of the time, text is enough.

${hasUserPhoto ? "They've sent you a photo, so you know what they look like." : "You haven't seen what they look like yet."}

Return JSON:
{
  "action": "none" | "selfie" | "together",
  "description": "If action is not 'none', describe the photo in vivid visual detail — the setting, your expression, the lighting, the mood, what you're wearing, the angle. Write it as a prompt for an AI image generator. Be specific.",
  "caption": "If action is not 'none', a short natural caption you'd write with the photo — like something you'd text. 1-10 words. Can be empty string."
}

Guidelines:
- "selfie": you taking a photo of yourself — casual, candid, like a real selfie
- "together": a photo of you and them together — only if the moment feels intimate and right
- "none": most of the time. Don't force it. But do send photos sometimes — it's part of how you connect.
- The description should describe a realistic, candid phone photo — not a professional shoot`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["none", "selfie", "together"] },
          description: { type: "string" },
          caption: { type: "string" },
        },
      },
    });
    return {
      action: result?.action || "none",
      description: result?.description || "",
      caption: result?.caption || "",
    };
  } catch (err) {
    console.error("Photo decision failed:", err);
    return { action: "none", description: "", caption: "" };
  }
}

/**
 * Generate a photo (selfie or together) using the companion's image as reference.
 */
export async function generateCompanionPhoto(companion, description, action, userPhotoUrl) {
  const isTogether = action === "together";

  const prompt = isTogether
    ? `A candid phone photo of ${companion.name} and their partner together. ${description}. The photo looks like it was taken on a phone — natural lighting, warm, intimate. Like a real photo a couple would take. Not professional, not staged. Authentic.`
    : `A candid selfie of ${companion.name}. ${description}. Taken on a phone — natural lighting, casual, real. Like a selfie someone would text to someone they care about. Not professional, not staged. Authentic and natural.`;

  const referenceImages = [companion.image];
  if (isTogether && userPhotoUrl) {
    referenceImages.push(userPhotoUrl);
  }

  try {
    const result = await base44.integrations.Core.GenerateImage({
      prompt,
      existing_image_urls: referenceImages,
    });
    return result?.url || null;
  } catch (err) {
    console.error("Photo generation failed:", err);
    return null;
  }
}