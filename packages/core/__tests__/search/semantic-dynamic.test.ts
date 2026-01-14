
import { describe, it, expect } from "bun:test";
import { semanticRerank, type RankedResult } from "../../src/search/semantic";

describe("semanticRerank dynamic", () => {
  it("uses provided text for embedding", async () => {
    // Mock result with custom text (simulating dynamic content)
    // Use lexical overlap for hash embedding test
    const lexicalBaseline: RankedResult[] = [
      { id: "match", score: 0.5, text: "optimize performance speed" },
      { id: "no-match", score: 0.5, text: "slow sluggish lag" },
    ];
    
    // Hash embedding fallback relies on character n-grams
    const lexicalResults = await semanticRerank("performance", lexicalBaseline, { fallback: "hash" });
    
    expect(lexicalResults[0].id).toBe("match");
    expect(lexicalResults[0].score).toBeGreaterThan(lexicalResults[1].score);
  });
});
