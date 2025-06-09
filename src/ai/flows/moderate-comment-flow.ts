
'use server';
/**
 * @fileOverview A Genkit flow to moderate user-submitted comments.
 *
 * - moderateComment - A function that analyzes comment text for safety.
 * - ModerateCommentInput - The input type for the moderateComment function.
 * - ModerateCommentOutput - The return type for the moderateComment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateCommentInputSchema = z.object({
  commentText: z.string().describe('The user comment text to be moderated.'),
});
export type ModerateCommentInput = z.infer<typeof ModerateCommentInputSchema>;

const ModerateCommentOutputSchema = z.object({
  isSafe: z
    .boolean()
    .describe(
      'True if the comment is considered safe and appropriate for public display, false otherwise.'
    ),
  reason: z
    .string()
    .optional()
    .describe('A brief reason if the comment is not safe (e.g., "Profanity", "Spam").'),
  // Potentially add categories of violation if needed later
});
export type ModerateCommentOutput = z.infer<typeof ModerateCommentOutputSchema>;

export async function moderateComment(input: ModerateCommentInput): Promise<ModerateCommentOutput> {
  return moderateCommentFlow(input);
}

const moderationPrompt = ai.definePrompt({
  name: 'moderateCommentPrompt',
  input: {schema: ModerateCommentInputSchema},
  output: {schema: ModerateCommentOutputSchema},
  prompt: `You are a highly vigilant and fair content moderator for an e-commerce accessories website. 
Your task is to analyze user-submitted comments and determine if they are safe and appropriate for public display.

A comment is considered NOT SAFE (isSafe: false) if it contains:
- Profanity, swearing, curse words, or significantly offensive language.
- Hate speech, discriminatory remarks, bullying, or personal attacks.
- Spam, advertisements, or links to external malicious or irrelevant sites.
- Gibberish, nonsensical text, or comments clearly not related to the product.
- Excessively negative, aggressive, or threatening sentiment that does not contribute to a constructive discussion about the product.
- Any content that violates community guidelines for respectful interaction.

A comment IS SAFE (isSafe: true) if it is:
- A genuine question about the product.
- A review (positive, negative, or mixed) expressed respectfully, even if critical.
- Constructive feedback.
- Relevant to the product being discussed and generally polite.

Given the following comment, determine if it is safe. 
Respond strictly with the JSON format defined in the output schema.
Set the 'isSafe' boolean field. 
If 'isSafe' is false, provide a brief 'reason' categorizing why it's not safe (e.g., "Profanity", "Spam", "Hate Speech", "Excessive Negativity", "Off-topic").

Comment:
"{{{commentText}}}"`,
});

const moderateCommentFlow = ai.defineFlow(
  {
    name: 'moderateCommentFlow',
    inputSchema: ModerateCommentInputSchema,
    outputSchema: ModerateCommentOutputSchema,
  },
  async (input) => {
    const {output} = await moderationPrompt(input);
    if (!output) {
        // Fallback in case the LLM fails to produce structured output or another error occurs
        console.error("Moderation flow failed to get LLM output for input:", input);
        return { isSafe: true, reason: "Moderation system error, defaulting to safe." }; // Default to safe or pending based on policy
    }
    return output;
  }
);

