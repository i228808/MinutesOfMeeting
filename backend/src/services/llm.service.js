/**
 * LLM Service using OpenRouter API
 * Supports multiple models via OpenRouter's unified API
 */

class LLMService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.model = process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free';
    }

    /**
     * Make a request to OpenRouter API
     */
    async makeRequest(messages, options = {}) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
                'X-Title': 'MeetingMinutes AI'
            },
            body: JSON.stringify({
                model: options.model || this.model,
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 4096
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter API Error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }

    /**
     * Analyze a meeting transcript and extract all relevant information
     * Also detects if the conversation contains contract-worthy elements
     */
    async analyzeTranscript(transcript) {
        const prompt = `You are an expert meeting analyst. Analyze the following meeting transcript and extract structured information.

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
  ],
  "contract_elements": {
    "has_offer": false,
    "offer_details": null,
    "has_service": false,
    "service_details": null,
    "has_payment": false,
    "payment_details": null,
    "has_schedule": false,
    "schedule_details": null,
    "parties_identified": [],
    "contract_type_suggestion": null
  }
}

Important:
- Extract ALL mentioned individuals and their action items
- Infer priorities based on urgency words (ASAP, critical, etc.)
- For deadlines: ONLY include if a specific date or timeframe is explicitly mentioned. If no deadlines are mentioned, return an empty array []
- Convert relative dates to actual dates based on today: ${new Date().toISOString().split('T')[0]}
- For contract_elements: Check if this transcript contains business negotiation with:
  - has_offer: Is someone offering a product/service/deal?
  - has_service: Is there a specific service/work being described?
  - has_payment: Is money/price/fees/compensation mentioned?
  - has_schedule: Is there a timeline/delivery schedule mentioned?
  - parties_identified: Who would be the parties in a potential contract?
  - contract_type_suggestion: Suggest type (NDA, SERVICE_AGREEMENT, EMPLOYMENT, PARTNERSHIP, GENERAL)
- Return ONLY valid JSON, no markdown formatting or code blocks`;

        try {
            const text = await this.makeRequest([
                { role: 'user', content: prompt }
            ]);

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);

                // Calculate if contract is detected (3+ elements present)
                const elements = analysis.contract_elements || {};
                const elementCount = [
                    elements.has_offer,
                    elements.has_service,
                    elements.has_payment,
                    elements.has_schedule
                ].filter(Boolean).length;

                analysis.contract_detected = elementCount >= 2;

                return analysis;
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
        const prompt = `Extract all people mentioned or speaking in this transcript.
Return a JSON array of objects with "name" and "identified_from" (either "speaker" or "mentioned").

TRANSCRIPT:
${transcript}

Return ONLY valid JSON array, no markdown:`;

        try {
            const text = await this.makeRequest([
                { role: 'user', content: prompt }
            ]);

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
        const prompt = `Extract all action items and responsibilities from this meeting transcript.
Return a JSON array with "actor", "task", "priority" (HIGH/MEDIUM/LOW), and "status" (PENDING).

TRANSCRIPT:
${transcript}

Return ONLY valid JSON array, no markdown:`;

        try {
            const text = await this.makeRequest([
                { role: 'user', content: prompt }
            ]);

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
        const prompt = `Extract all deadlines and due dates mentioned in this meeting transcript.
Today's date is ${new Date().toISOString().split('T')[0]}.
Convert relative dates (next Monday, end of week, etc.) to actual ISO dates.

Return a JSON array with "task", "actor" (who is responsible), "deadline" (YYYY-MM-DD format or null).

TRANSCRIPT:
${transcript}

Return ONLY valid JSON array, no markdown:`;

        try {
            const text = await this.makeRequest([
                { role: 'user', content: prompt }
            ]);

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
    async generateContract(meetingData, contractType = 'GENERAL', context = '') {
        console.log(`[LLM Service] generateContract called. ContractType: ${contractType}`);
        if (context) {
            console.log(`[LLM Service] RAG Context received. Length: ${context.length} chars`);
        } else {
            console.log(`[LLM Service] No RAG Context provided.`);
        }

        const contractPrompts = {
            NDA: 'Non-Disclosure Agreement',
            SERVICE_AGREEMENT: 'Service Agreement',
            EMPLOYMENT: 'Employment Contract',
            PARTNERSHIP: 'Partnership Agreement',
            GENERAL: 'General Business Contract'
        };

        const prompt = `You are a legal document expert. Generate a professional ${contractPrompts[contractType]} based on the following meeting information.

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

${context ? `RELEVANT LEGAL CONTEXT & SIMILAR CLAUSES (Use these as reference):\n${context}\n` : ''}

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
Return the contract as plain text (not markdown).`;

        if (context) {
            console.log(`[LLM Service] RAG Context injected into prompt.`);
        }

        try {
            return await this.makeRequest([
                { role: 'user', content: prompt }
            ]);
        } catch (error) {
            console.error('Generate Contract Error:', error);
            throw new Error(`Failed to generate contract: ${error.message}`);
        }
    }

    /**
     * Improve or edit existing contract text
     */
    async improveContract(currentText, instructions) {
        const prompt = `You are a legal document expert. Improve the following contract based on these instructions:

INSTRUCTIONS: ${instructions}

CURRENT CONTRACT:
${currentText}

Return the improved contract as plain text.`;

        try {
            return await this.makeRequest([
                { role: 'user', content: prompt }
            ]);
        } catch (error) {
            console.error('Improve Contract Error:', error);
            throw new Error(`Failed to improve contract: ${error.message}`);
        }
    }

    /**
     * Generate meeting summary
     */
    async generateSummary(transcript) {
        const prompt = `Summarize this meeting transcript in 3-4 concise sentences, highlighting:
- Main topics discussed
- Key decisions made
- Important action items

TRANSCRIPT:
${transcript}

Return only the summary text, no formatting.`;

        try {
            return await this.makeRequest([
                { role: 'user', content: prompt }
            ]);
        } catch (error) {
            console.error('Generate Summary Error:', error);
            return 'Summary generation failed.';
        }
    }

    /**
     * Generate a legal contract from transcript and contract elements
     * Takes into account the region for local law compliance
     */
    async generateContractFromTranscript(params) {
        const {
            transcript,
            contract_elements,
            region,
            contract_type,
            title,
            custom_instructions,
            context
        } = params;

        console.log(`[LLM Service] generateContractFromTranscript called.`);
        if (context) {
            console.log(`[LLM Service] RAG Context received for transcript generation.`);
        }

        const regionLawContext = this.getRegionLegalContext(region);

        const prompt = `You are an expert legal document drafter. Generate a professional contract based on the following information.

MEETING TRANSCRIPT (Source):
${transcript}

CONTRACT ELEMENTS DETECTED:
- Offer/Deal: ${contract_elements?.offer_details || 'Not specified'}
- Service/Work: ${contract_elements?.service_details || 'Not specified'}  
- Payment Terms: ${contract_elements?.payment_details || 'Not specified'}
- Schedule/Timeline: ${contract_elements?.schedule_details || 'Not specified'}
- Parties: ${JSON.stringify(contract_elements?.parties_identified || [])}

CONTRACT TYPE: ${contract_type || 'SERVICE_AGREEMENT'}
JURISDICTION/REGION: ${region || 'General'}
${regionLawContext}

${context ? `RELEVANT LEGAL CONTEXT & SIMILAR CLAUSES (Use these as reference):\n${context}\n` : ''}

${custom_instructions ? `ADDITIONAL INSTRUCTIONS: ${custom_instructions}` : ''}

Generate a complete, professional contract in MARKDOWN format that includes:

# ${title || 'Service Agreement'}

## 1. Parties
[List all parties with their roles - use [PARTY NAME] placeholders where names need to be filled]

## 2. Recitals/Background  
[Brief context of why this agreement is being made]

## 3. Definitions
[Key terms defined]

## 4. Scope of Services/Deliverables
[What will be provided/done]

## 5. Payment Terms
[Payment amount, schedule, method]

## 6. Timeline/Schedule
[Delivery dates, milestones]

## 7. Representations and Warranties
[Standard warranties for both parties]

## 8. Confidentiality
[NDA-style clause if applicable]

## 9. Intellectual Property
[Who owns what]

## 10. Termination
[How agreement can be ended]

## 11. Limitation of Liability
[Liability caps and exclusions]

## 12. Dispute Resolution
[How disputes will be handled - arbitration/courts based on region]

## 13. General Provisions
[Governing law, notices, amendments, etc.]

## Signatures
[Signature blocks for all parties with date lines]

---
*This document was auto-generated and should be reviewed by legal counsel before signing.*
*Governing Law: ${region}*

Important:
- Make it professional and legally sound for ${region}
- Include all standard clauses for a ${contract_type}
- Use clear, unambiguous language
- Add [BRACKETS] for any values that need to be confirmed/filled in
- Return ONLY the markdown content, no code blocks around it`;

        try {
            const contractText = await this.makeRequest([
                { role: 'user', content: prompt }
            ], { max_tokens: 8000 });

            return contractText;
        } catch (error) {
            console.error('Generate Contract Error:', error);
            throw new Error(`Failed to generate contract: ${error.message}`);
        }
    }

    /**
     * Get legal context for specific regions
     */
    getRegionLegalContext(region) {
        const contexts = {
            'Pakistan': 'Apply Pakistan Contract Act 1872 principles. Include arbitration clause referencing Pakistan Arbitration Act 1940. Currency in PKR.',
            'United States': 'Follow UCC and general US contract law. Include state-specific governing law clause. Currency in USD.',
            'United Kingdom': 'Apply English contract law. Include provisions compliant with UK Consumer Rights Act if applicable. Currency in GBP.',
            'European Union': 'Ensure GDPR compliance for data provisions. Apply EU consumer protection directives. Currency in EUR.',
            'India': 'Apply Indian Contract Act 1872. Include arbitration per Arbitration and Conciliation Act 1996. Currency in INR.',
            'Canada': 'Apply common law or Quebec civil law as appropriate. Include bilingual provisions if Quebec. Currency in CAD.',
            'Australia': 'Apply Australian Consumer Law and Competition and Consumer Act 2010. Currency in AUD.',
            'UAE': 'Apply UAE Federal Civil Code. Include DIFC/ADGM jurisdiction option. Currency in AED.',
            'Singapore': 'Apply Singapore contract law. Include SIAC arbitration clause. Currency in SGD.',
            'Germany': 'Apply German Civil Code (BGB). Include provisions for AGB law. Currency in EUR.',
            'France': 'Apply French Civil Code. Ensure compliance with Code de commerce. Currency in EUR.',
            'China': 'Apply PRC Contract Law. Include CIETAC arbitration clause. Currency in CNY.',
            'Japan': 'Apply Japanese Civil Code. Include JCAA arbitration. Currency in JPY.',
            'South Korea': 'Apply Korean Civil Act. Include KCAB arbitration. Currency in KRW.',
            'Brazil': 'Apply Brazilian Civil Code. Include provisions compliant with CDC. Currency in BRL.',
            'Mexico': 'Apply Mexican Civil Code. Currency in MXN.',
            'South Africa': 'Apply South African common law. Currency in ZAR.',
            'Nigeria': 'Apply Nigerian law based on English common law. Currency in NGN.',
            'Saudi Arabia': 'Apply Saudi Arabian law with Sharia compliance. Currency in SAR.',
        };

        return contexts[region] || 'Apply general international contract principles. Ensure clarity and fairness.';
    }
}

module.exports = new LLMService();
