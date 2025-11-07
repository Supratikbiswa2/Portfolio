// src/ai/flows/face-verification.ts
'use server';

/**
 * @fileOverview Verifies a user's face against registered face data.
 *
 * - verifyFace - Verifies if a face matches the registered one.
 * - VerifyFaceInput - Input type for the verification function.
 * - VerifyFaceOutput - Return type for the verification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyFaceInputSchema = z.object({
  registeredFaceDataUri: z
    .string()
    .describe(
      "A registered photo of the user's face, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  currentFaceDataUri: z
    .string()
    .describe(
      "The current photo of the user's face for verification, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyFaceInput = z.infer<typeof VerifyFaceInputSchema>;

const VerifyFaceOutputSchema = z.object({
  isMatch: z.boolean().describe('Whether the current face matches the registered face.'),
  confidence: z.number().optional().describe('The confidence score of the match (0-1).'),
  reason: z.string().optional().describe('The reason for the verification result.'),
});
export type VerifyFaceOutput = z.infer<typeof VerifyFaceOutputSchema>;


export async function verifyFace(
  input: VerifyFaceInput
): Promise<VerifyFaceOutput> {
  return verifyFaceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyFacePrompt',
  input: {schema: VerifyFaceInputSchema},
  output: {schema: VerifyFaceOutputSchema},
  prompt: `You are a highly accurate AI face verification system. Your task is to compare two images of a person's face and determine if they are the same person.

  You will be given a registered face image and a current face image for verification.

  Registered Face:
  {{media url=registeredFaceDataUri}}

  Current Face for Verification:
  {{media url=currentFaceDataUri}}

  Analyze the key facial features in both images (e.g., eyes, nose, mouth, jawline, and overall face structure).

  - If the faces are a clear match, set 'isMatch' to true and provide a high confidence score (e.g., > 0.9).
  - If the faces are clearly different, set 'isMatch' to false, provide a low confidence score, and a brief reason for the mismatch.
  - If the comparison is ambiguous due to factors like poor lighting, different angles, or obstructions, set 'isMatch' to false, provide a moderate confidence score, and state the reason for the ambiguity.

  Respond in JSON format.
  `,
});

const verifyFaceFlow = ai.defineFlow(
  {
    name: 'verifyFaceFlow',
    inputSchema: VerifyFaceInputSchema,
    outputSchema: VerifyFaceOutputSchema,
  },
  async input => {
    if (!input.registeredFaceDataUri || !input.currentFaceDataUri) {
      return {
        isMatch: false,
        confidence: 0,
        reason: "Missing image data for verification."
      }
    }
    
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
       console.error('AI face verification error:', error);
       return {
        isMatch: false,
        confidence: 0,
        reason: 'AI service is currently unavailable. Please try again later.',
      };
    }
  }
);
