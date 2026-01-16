
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("No API key found in .env");
            return;
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to get client

        // There isn't a direct listModels on the client instance in standard usage of this SDK version easily exposed without potentially digging.
        // Actually, for the Node SDK, checking available models usually requires the listModels method on the genAI instance if available, 
        // or we just rely on documentation. 
        // BUT, we can try to hit the API directly if the SDK doesn't make it obvious, or just try a standard Hello World with a known working model.

        // Let's try the most basic 'gemini-pro' interaction and see the detailed error if it fails.
        console.log("Testing gemini-pro...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-pro" });
            const r = await m.generateContent("Test");
            console.log("gemini-pro works! Response:", r.response.text());
        } catch (e) {
            console.error("gemini-pro failed:", e.message);
        }

        console.log("Testing gemini-1.5-flash...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const r = await m.generateContent("Test");
            console.log("gemini-1.5-flash works! Response:", r.response.text());
        } catch (e) {
            console.error("gemini-1.5-flash failed:", e.message);
        }

    } catch (error) {
        console.error("Script error:", error);
    }
}

listModels();
