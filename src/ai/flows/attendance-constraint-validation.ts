// src/ai/flows/attendance-constraint-validation.ts
'use server';

/**
 * @fileOverview Validates attendance constraints using AI and logs invalid attempts.
 *
 * - validateAttendanceConstraints - Validates if attendance constraints are met.
 * - ValidateAttendanceConstraintsInput - Input type for the validation function.
 * - ValidateAttendanceConstraintsOutput - Return type for the validation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAttendanceConstraintsInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  classId: z.string().describe('The ID of the class.'),
  timestamp: z.string().describe('The timestamp of the attendance attempt.'),
  locationDataUri: z
    .string()
    .describe(
      'The GPS location of the student as a data URI. Expected format: data:application/json;charset=utf-8;base64,<encoded_data>'
    ),
  scheduledStartTime: z.string().describe('The scheduled start time of the class.'),
  scheduledEndTime: z.string().describe('The scheduled end time of the class.'),
});
export type ValidateAttendanceConstraintsInput = z.infer<typeof ValidateAttendanceConstraintsInputSchema>;

const ValidateAttendanceConstraintsOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the attendance attempt is valid or not.'),
  reason: z.string().optional().describe('The reason why the attendance attempt is invalid.'),
  logAttempt: z.boolean().describe('Whether to log this attempt for review.'),
  classification: z.string().optional().describe('Classification of the invalid attempt'),
});
export type ValidateAttendanceConstraintsOutput = z.infer<typeof ValidateAttendanceConstraintsOutputSchema>;

const logInvalidAttendanceAttempt = ai.defineTool({
  name: 'logInvalidAttendanceAttempt',
  description: 'Logs an invalid attendance attempt with details about the student, class, and reason for invalidity.',
  inputSchema: z.object({
    studentId: z.string().describe('The ID of the student who attempted to mark attendance.'),
    classId: z.string().describe('The ID of the class for which attendance was attempted.'),
    timestamp: z.string().describe('The timestamp of the invalid attendance attempt.'),
    reason: z.string().describe('The reason why the attendance attempt was invalid.'),
    locationDataUri: z
      .string()
      .describe(
        'The GPS location of the student as a data URI. Expected format: data:application/json;charset=utf-8;base64,<encoded_data>'
      ),
  }),
  outputSchema: z.boolean().describe('Returns true if the attempt was successfully logged, false otherwise.'),
},
async (input) => {
  console.log(`Logging invalid attendance attempt for student ${input.studentId}, class ${input.classId} at ${input.timestamp} due to: ${input.reason}`);
  // Placeholder implementation for logging the attempt.
  // In a real application, this would involve writing to a database or logging service.
  return true;
});

export async function validateAttendanceConstraints(
  input: ValidateAttendanceConstraintsInput
): Promise<ValidateAttendanceConstraintsOutput> {
  return validateAttendanceConstraintsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateAttendanceConstraintsPrompt',
  input: {schema: ValidateAttendanceConstraintsInputSchema},
  output: {schema: ValidateAttendanceConstraintsOutputSchema},
  tools: [logInvalidAttendanceAttempt],
  prompt: `You are an AI assistant that validates student attendance based on location and time constraints.

  Here's the student's location data:
  {{locationDataUri}}

  Here's the class schedule:
  Start Time: {{scheduledStartTime}}
  End Time: {{scheduledEndTime}}

  Current Time: {{timestamp}}

  Determine if the student is within college premises and if the current time is within the scheduled class time.

  If the student is not within the specified location or the time is outside the class schedule, set isValid to false, provide a reason, set logAttempt to true, and classify the attempt.

  If logAttempt is true, call the logInvalidAttendanceAttempt tool to log the invalid attempt for review.

  If the student is within the specified location and the time is within the class schedule, set isValid to true, and logAttempt to false.

  Respond in JSON format.
  `,
});

const validateAttendanceConstraintsFlow = ai.defineFlow(
  {
    name: 'validateAttendanceConstraintsFlow',
    inputSchema: ValidateAttendanceConstraintsInputSchema,
    outputSchema: ValidateAttendanceConstraintsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);

      if (output && output.logAttempt) {
        await logInvalidAttendanceAttempt({
          studentId: input.studentId,
          classId: input.classId,
          timestamp: input.timestamp,
          reason: output.reason || 'No reason provided.',
          locationDataUri: input.locationDataUri,
        });
      }
      return output!;
    } catch (error) {
      console.error('AI attendance validation error:', error);
      return {
        isValid: false,
        reason: 'AI service is currently unavailable. Please try again later.',
        logAttempt: true,
      };
    }
  }
);
