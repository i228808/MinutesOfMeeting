const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class LLMService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    /**
     * Analyze a meeting transcript and extract all relevant information
     */
    async analyzeTranscript(transcript) {
        const prompt = `
You are an expert meeting analyst. Analyze the following meeting transcript and extract structured information.

TRANSCRIPT:
${transcript}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "A concise 2-3 sentence summary of the meeting",
  "actors": [
    {"name": "Person Name", "email": null, "identified_from": "speaker"}
  ],
  "roles": [
    {"actor": "Person Name", "role": "Their role/title", "department": "Department if mentioned"}
  ],
  "responsibilities": [
    {"actor": "Person Name", "task": "Description of the task", "priority": "HIGH/MEDIUM/LOW"}
  ],
  "deadlines": [
    {"task": "Task description", "actor": "Person responsible", "deadline": "YYYY-MM-DD or null if not specified"}
  ],
  "key_decisions": [
    {"decision": "What was decided", "made_by": "Who made it", "context": "Brief context"}
  ]
}

Important:
- Extract ALL mentioned individuals and their action items
- Infer priorities based on urgency words (ASAP, critical, etc.)
- Convert relative dates (next Monday, end of week) to actual dates if possible
- If information is unclear, use null instead of guessing
- Return ONLY valid JSON, no markdown formatting
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Failed to parse LLM response as JSON');
        } catch (error) {
            console.error('LLM Analysis Error:', error);
            throw new Error(`Failed to analyze transcript: ${error.message}`);
        }
    }

    /**
     * Extract only actors/participants from transcript
     */
    async extractActors(transcript) {
        const prompt = `
Extract all people mentioned or speaking in this transcript.
Return a JSON array of objects with "name" and "identified_from" (either "speaker" or "mentioned").

TRANSCRIPT:
${transcript}

Return ONLY valid JSON array, no markdown:
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Extract Actors Error:', error);
            return [];
        }
    }

    /**
     * Extract action items and responsibilities
     */
    async extractResponsibilities(transcript) {
        const prompt = `
Extract all action items and responsibilities from this meeting transcript.
Return a JSON array with "actor", "task", "priority" (HIGH/MEDIUM/LOW), and "status" (PENDING).

TRANSCRIPT:
${transcript}

Return ONLY valid JSON array, no markdown:
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Extract Responsibilities Error:', error);
            return [];
        }
    }

    /**
     * Extract deadlines from transcript
     */
    async extractDeadlines(transcript) {
        const prompt = `
Extract all deadlines and due dates mentioned in this meeting transcript.
Today's date is ${new Date().toISOString().split('T')[0]}.
Convert relative dates (next Monday, end of week, etc.) to actual ISO dates.

Return a JSON array with "task", "actor" (who is responsible), "deadline" (YYYY-MM-DD format or null).

TRANSCRIPT:
${transcript}

Return ONLY valid JSON array, no markdown:
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Extract Deadlines Error:', error);
            return [];
        }
    }

    /**
     * Generate a contract draft based on meeting data
     */
    async generateContract(meetingData, contractType = 'GENERAL') {
        const contractPrompts = {
            NDA: 'Non-Disclosure Agreement',
            SERVICE_AGREEMENT: 'Service Agreement',
            EMPLOYMENT: 'Employment Contract',
            PARTNERSHIP: 'Partnership Agreement',
            GENERAL: 'General Business Contract'
        };

        const prompt = `
You are a legal document expert. Generate a professional ${contractPrompts[contractType]} based on the following meeting information.

MEETING SUMMARY:
${meetingData.summary || 'No summary provided'}

PARTIES INVOLVED:
${JSON.stringify(meetingData.actors || [], null, 2)}

RESPONSIBILITIES/DELIVERABLES:
${JSON.stringify(meetingData.responsibilities || [], null, 2)}

DEADLINES:
${JSON.stringify(meetingData.deadlines || [], null, 2)}

KEY DECISIONS:
${JSON.stringify(meetingData.key_decisions || [], null, 2)}

Generate a complete, professional contract with:
1. Title
2. Date
3. Parties section
4. Purpose/Recitals
5. Terms and Conditions
6. Responsibilities of each party
7. Timeline/Deadlines
8. Confidentiality clause (if applicable)
9. Termination clause
10. Signatures section

Use proper legal language but keep it understandable.
Return the contract as plain text (not markdown).
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Generate Contract Error:', error);
            throw new Error(`Failed to generate contract: ${error.message}`);
        }
    }

    /**
     * Improve or edit existing contract text
     */
    async improveContract(currentText, instructions) {
        const prompt = `
You are a legal document expert. Improve the following contract based on these instructions:

INSTRUCTIONS: ${instructions}

CURRENT CONTRACT:
${currentText}

Return the improved contract as plain text.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Improve Contract Error:', error);
            throw new Error(`Failed to improve contract: ${error.message}`);
        }
    }

    /**
     * Generate meeting summary
     */
    async generateSummary(transcript) {
        const prompt = `
Summarize this meeting transcript in 3-4 concise sentences, highlighting:
- Main topics discussed
- Key decisions made
- Important action items

TRANSCRIPT:
${transcript}

Return only the summary text, no formatting.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Generate Summary Error:', error);
            return 'Summary generation failed.';
        }
    }
}

module.exports = new LLMService();
