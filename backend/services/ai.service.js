import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateResult = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("--- Debug AI Service ---");
    console.log("Checking GEMINI_API_KEY:", apiKey ? `Found (Length: ${apiKey.trim().length})` : "NOT FOUND");

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in your .env file. Please check your backend/.env file.");
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    return result.response.text();
}