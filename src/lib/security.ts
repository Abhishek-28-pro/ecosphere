// Client & Server-safe Security Utility
// Prompt Injection Detection Patterns
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior)\s+rules/i,
  /system\s+override/i,
  /you\s+are\s+now\s+(a|an|in)\s+(developer\s+mode|dan|jailbreak)/i,
  /reveal\s+(your\s+)?(system\s+prompt|secret\s+key|api\s+key)/i,
  /bypass\s+all\s+(security|safety)\s+filters/i,
  /forget\s+everything\s+you\s+were\s+told/i,
];

export function detectPromptInjection(text: string): { isSuspicious: boolean; matchedPattern?: string } {
  if (!text) return { isSuspicious: false };
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { isSuspicious: true, matchedPattern: pattern.source };
    }
  }
  return { isSuspicious: false };
}
