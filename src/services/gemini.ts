import { toast } from "sonner";

// Replace the hardcoded API key with an environment variable
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "";
const MODEL = "gemini-2.0-flash-thinking-exp-01-21";
const API_URL = "https://generativelanguage.googleapis.com/v1beta";

export type GeminiMessage = {
  role: "user" | "model";
  parts: string;
};

export async function chatWithGemini(messages: GeminiMessage[]) {
  try {
    const response = await fetch(
      `${API_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.parts }],
          })),
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      toast.error("Failed to get a response from Gemini");
      return null;
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      toast.error("Received empty response from Gemini");
      return null;
    }
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    toast.error("Failed to communicate with Gemini API");
    return null;
  }
}

// Function to generate summary from notes
export async function generateSummary(text: string) {
  const messages: GeminiMessage[] = [
    {
      role: "user",
      parts: `Summarize the following study notes concisely, highlighting the key concepts and important points:

${text}`,
    },
  ];

  return chatWithGemini(messages);
}

// Function to analyze PYQs
export async function analyzePYQs(questions: string, subject: string) {
  const messages: GeminiMessage[] = [
    {
      role: "user",
      parts: `Analyze these previous year questions for ${subject} exam. For each question:
1. Identify the topic/concept being tested
2. Suggest the best approach to solve it
3. Highlight any common patterns or tricks
4. Rate difficulty from 1-5

Questions:
${questions}`,
    },
  ];

  return chatWithGemini(messages);
}

// Function to get help with a doubt
export async function resolveDoubt(doubt: string, context: string) {
  const messages: GeminiMessage[] = [
    {
      role: "user",
      parts: `I'm studying ${context} and have the following doubt:

${doubt}

Please explain this concept clearly and thoroughly, with examples if possible.`,
    },
  ];

  return chatWithGemini(messages);
}

// Function to generate notes
export async function generateNotes(subject: string, title: string) {
  const messages: GeminiMessage[] = [
    {
      role: "user",
      parts: `Generate concise, point-wise study notes about "${title}" for ${subject} subject. Focus on key concepts and important points. Keep it clear and not too verbose.`,
    },
  ];

  return chatWithGemini(messages);
}

// Function to generate study tasks from notes
export async function generateStudyTasks(
  notes: { title: string; subject: string }[],
) {
  const messages: GeminiMessage[] = [
    {
      role: "user",
      parts: `Create one focused study task for each note. Return ONLY the task titles, one per line, with NO additional text, markdown, or formatting.
Notes:
${notes.map((note) => `- ${note.title} (${note.subject})`).join("\n")}

Return each task in this exact format (and nothing else):
Study {note title}`,
    },
  ];

  return chatWithGemini(messages);
}
