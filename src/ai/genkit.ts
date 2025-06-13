
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: any; // Use 'any' for the fallback structure

try {
  aiInstance = genkit({
    plugins: [
      googleAI() // Assumes GOOGLE_APPLICATION_CREDENTIALS are set for authentication
    ],
    model: 'googleai/gemini-2.0-flash', // Ensure this model is available and correctly configured
  });
  console.log("[Genkit] AI instance initialized successfully.");
} catch (error) {
  console.error("CRITICAL: Genkit AI instance initialization failed:", error);
  // Fallback 'ai' object that will throw if its methods are called
  const errorMessage = "Genkit AI not initialized due to a startup error. Check server logs for details.";
  aiInstance = {
    defineFlow: () => { throw new Error(errorMessage + " (called defineFlow)"); },
    definePrompt: () => { throw new Error(errorMessage + " (called definePrompt)"); },
    generate: async () => { throw new Error(errorMessage + " (called generate)"); },
    generateStream: () => { throw new Error(errorMessage + " (called generateStream)"); },
    defineTool: () => { throw new Error(errorMessage + " (called defineTool)"); },
    defineSchema: () => { throw new Error(errorMessage + " (called defineSchema)"); },
    // Add any other 'ai' methods your application might directly call from flows.
    // This helps in pinpointing where an uninitialized Genkit is being accessed.
  };
  console.warn("[Genkit] Using fallback AI instance due to initialization error.");
}

export const ai = aiInstance;
