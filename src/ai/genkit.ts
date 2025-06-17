
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import type { ModelReference, RetrieverReference, TelemetryConfig, PromptConfig } from 'genkit';


let aiInstance: any; 

try {
  aiInstance = genkit({
    plugins: [
      googleAI() 
    ],
    //defaultModel: 'googleai/gemini-2.0-flash', // Corrected: 'model' to 'defaultModel'
  }); // Added type assertion for clarity
  console.log("[Genkit] AI instance initialized successfully.");
} catch (error) {
  console.error("CRITICAL: Genkit AI instance initialization failed:", error);
  
  const errorMessage = "Genkit AI not initialized. This is often due to a missing or invalid API key (e.g., GOOGLE_API_KEY). Check server logs and environment variable configuration.";
  
  aiInstance = {
    defineFlow: (config: any, flowFn: any) => {
      console.warn(`[Genkit Fallback] defineFlow called for '${config?.name || 'unknown flow'}'. Genkit is not initialized.`);
      return async (input: any) => { 
        console.error(`[Genkit Fallback] Flow '${config?.name || 'unknown flow'}' invoked, but Genkit is not initialized.`);
        throw new Error(errorMessage + ` (flow '${config?.name || 'unknown flow'}' invoked)`);
      };
    },
    definePrompt: (config: any) => {
      console.warn(`[Genkit Fallback] definePrompt called for '${config?.name || 'unknown prompt'}'. Genkit is not initialized.`);
      return async (input: any) => { 
        console.error(`[Genkit Fallback] Prompt '${config?.name || 'unknown prompt'}' invoked, but Genkit is not initialized.`);
        throw new Error(errorMessage + ` (prompt '${config?.name || 'unknown prompt'}' invoked)`);
      };
    },
    generate: async () => {
      console.error("[Genkit Fallback] ai.generate invoked, but Genkit is not initialized.");
      throw new Error(errorMessage + " (called generate)");
    },
    generateStream: () => {
      console.error("[Genkit Fallback] ai.generateStream invoked, but Genkit is not initialized.");
      // For generateStream, we need to return an object with a stream and a response promise
      const errorStream = async function*() {
        yield { error: errorMessage + " (called generateStream - stream part)" };
      }
      return { 
        stream: errorStream(), 
        response: Promise.reject(new Error(errorMessage + " (called generateStream - response part)"))
      };
    },
    defineTool: (config: any, toolFn: any) => {
      console.warn(`[Genkit Fallback] defineTool called for '${config?.name || 'unknown tool'}'. Genkit is not initialized.`);
      return async (input: any) => {
        console.error(`[Genkit Fallback] Tool '${config?.name || 'unknown tool'}' invoked, but Genkit is not initialized.`);
        throw new Error(errorMessage + ` (tool '${config?.name || 'unknown tool'}' invoked)`);
      };
    },
    defineSchema: (name: string, schema: any) => {
      console.warn(`[Genkit Fallback] defineSchema called for '${name}'. Genkit is not initialized.`);
      return schema; 
    },
  };
  console.warn("[Genkit] Using fallback AI instance due to initialization error.");
}

export const ai = aiInstance;
