import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry mechanism with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isOverloaded = error.message?.includes('503') ||
                error.message?.includes('overloaded') ||
                error.message?.includes('Service Unavailable');

            const isLastAttempt = attempt === maxRetries;

            if (isOverloaded && !isLastAttempt) {
                const delayTime = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
                console.log(`⚠️ Model overloaded. Retrying in ${delayTime}ms... (Attempt ${attempt}/${maxRetries})`);
                await delay(delayTime);
                continue;
            }

            // If not overloaded or last attempt, throw the error
            throw error;
        }
    }
};

export const generateResult = async (prompt) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        console.log("--- Debug AI Service ---");
        console.log("Checking GEMINI_API_KEY:", apiKey ? `Found (Length: ${apiKey.trim().length})` : "NOT FOUND");

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing in your .env file. Please check your backend/.env file.");
        }

        // Using Gemini 2.5 Flash - the stable, recommended model
        // Best for: price-performance, large scale processing, low-latency tasks
        const modelName = "gemini-2.5-flash";
        console.log("Using model:", modelName);

        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: modelName });

        // Use retry mechanism for API calls
        const result = await retryWithBackoff(async () => {
            console.log("📤 Sending prompt to Gemini API:", prompt.substring(0, 50) + "...");
            const response = await model.generateContent(prompt);
            console.log("✅ Successfully received response from Gemini API");
            return response;
        });

        return result.response.text();
    } catch (error) {
        console.error("❌ Error in AI Service:");
        console.error("Error message:", error.message);

        // Provide user-friendly error messages
        if (error.message?.includes('503') || error.message?.includes('overloaded')) {
            throw new Error("The AI model is currently experiencing high demand. Please try again in a few moments.");
        } else if (error.message?.includes('API key')) {
            throw new Error("Invalid API key. Please check your GEMINI_API_KEY in the .env file.");
        } else if (error.message?.includes('quota')) {
            throw new Error("API quota exceeded. Please check your Google AI Studio quota limits.");
        }

        throw error;
    }
}