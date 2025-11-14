export function validateQuery(query: string): string {
  const lowered = query.toLowerCase().trim();

  // 🚫 Block multi-statement or injection attempts
  const dangerousPatterns = [
    /;/g, 
    /--/g,
    /\/\*/g, 
    /\*\//g,
    /\bor\b\s+1=1\b/g,
    /\bunion\b\s+\bselect\b/g
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(lowered)) {
      throw new Error("❌ Suspicious SQL detected: possible injection attempt");
    }
  }

  // 🚫 Block dangerous verbs unless explicitly allowed
  const destructiveKeywords = [
    "drop", "delete", "update", "alter", "truncate", 
    "insert", "replace", "attach", "detach"
  ];

  if (destructiveKeywords.some(kw => lowered.startsWith(kw))) {
    throw new Error(`❌ Dangerous SQL operation blocked: ${query}`);
  }

  // Optional: only allow SELECT queries
  if (!lowered.startsWith("select")) {
    throw new Error("❌ Only SELECT queries are allowed.");
  }

  return query;
}
