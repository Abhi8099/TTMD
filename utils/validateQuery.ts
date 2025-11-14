export function validateQuery(query: string): string {
  const original = query ?? "";
  const trimmed = original.trim();

  if (!trimmed) {
    throw new Error("❌ Query cannot be empty.");
  }

  // Lower-case for inspection only
  const lowered = trimmed.toLowerCase();

  // Allow a single trailing semicolon, but forbid semicolons in the middle
  const hasTrailingSemicolon = lowered.endsWith(";");
  const normalized = hasTrailingSemicolon
    ? lowered.slice(0, -1).trim()
    : lowered;

  // If there is any remaining `;` inside the query, assume multi-statement
  if (normalized.includes(";")) {
    throw new Error(
      "❌ Suspicious SQL detected: only a single statement is allowed."
    );
  }

  // Block obvious injection patterns
  const dangerousPatterns = [
    /--/g, // line comments
    /\/\*/g, // block comment start
    /\*\//g, // block comment end
    /\bor\b\s+1=1\b/g,
    /\bunion\b\s+select\b/g,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(normalized)) {
      throw new Error(
        "❌ Suspicious SQL detected: possible injection attempt"
      );
    }
  }

  // Block clearly destructive statements
  const destructiveKeywords = [
    "drop",
    "delete",
    "truncate",
    "alter",
    "create",
    "update",
    "insert",
    "replace",
    "attach",
    "detach",
  ];

  if (
    destructiveKeywords.some(
      (kw) => normalized === kw || normalized.startsWith(kw + " ")
    )
  ) {
    throw new Error(`❌ Dangerous SQL operation blocked: ${trimmed}`);
  }

  // Only allow SELECT queries
  if (!normalized.startsWith("select")) {
    throw new Error("❌ Only SELECT queries are allowed.");
  }

  // Return the original query (with or without trailing ;)
  return trimmed;
}
