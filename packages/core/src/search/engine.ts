// packages/core/src/search/engine.ts
// Composite search engine combining BM25 with optional semantic reranking

import type { Prompt } from "../prompts/types";
import { prompts, getPrompt } from "../prompts/registry";
import { buildIndex, search as bm25Search, type BM25Index } from "./bm25";
import { tokenize } from "./tokenize";
import { expandQuery } from "./synonyms";

export interface SearchResult {
  prompt: Prompt;
  score: number;
  matchedFields: string[];
}

export interface SearchOptions {
  limit?: number;
  category?: string;
  tags?: string[];
  expandSynonyms?: boolean;
}

// Lazy-initialized index
let _index: BM25Index | null = null;

function getIndex(): BM25Index {
  if (!_index) {
    _index = buildIndex(prompts);
  }
  return _index;
}

/**
 * Reset the search index (call when prompts change)
 */
export function resetIndex(): void {
  _index = null;
}

/**
 * Search prompts with BM25
 */
export function searchPrompts(
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const {
    limit = 20,
    category,
    tags,
    expandSynonyms = true,
  } = options;

  // Get base results from BM25
  const index = getIndex();

  // Optionally expand query with synonyms
  const queryTokens = tokenize(query);
  let searchTokens = queryTokens;
  if (expandSynonyms) {
    searchTokens = expandQuery(queryTokens);
  }
  const searchQuery = searchTokens.join(" ");

  const bm25Results = bm25Search(index, searchQuery, limit * 2);

  // Map to full results and apply filters
  let results: SearchResult[] = bm25Results
    .map(({ id, score }) => {
      const prompt = getPrompt(id);
      if (!prompt) return null;

      // Determine which fields matched (check both original query and expanded synonyms)
      const matchedFields: string[] = [];
      const titleLower = prompt.title.toLowerCase();
      const descLower = prompt.description.toLowerCase();
      const tagsLower = prompt.tags.map((t) => t.toLowerCase());
      const contentLower = prompt.content.toLowerCase();

      // Check if any search term matches each field
      for (const term of searchTokens) {
        if (titleLower.includes(term) && !matchedFields.includes("title")) {
          matchedFields.push("title");
        }
        if (descLower.includes(term) && !matchedFields.includes("description")) {
          matchedFields.push("description");
        }
        if (tagsLower.some((t) => t.includes(term)) && !matchedFields.includes("tags")) {
          matchedFields.push("tags");
        }
        if (contentLower.includes(term) && !matchedFields.includes("content")) {
          matchedFields.push("content");
        }
      }

      return { prompt, score, matchedFields };
    })
    .filter((r): r is SearchResult => r !== null);

  // Apply category filter
  if (category) {
    results = results.filter((r) => r.prompt.category === category);
  }

  // Apply tags filter (match any)
  if (tags?.length) {
    results = results.filter((r) =>
      tags.some((tag) => r.prompt.tags.includes(tag))
    );
  }

  return results.slice(0, limit);
}

/**
 * Quick search for autocomplete (lighter weight)
 */
export function quickSearch(query: string, limit: number = 5): Prompt[] {
  if (!query.trim()) return [];
  return searchPrompts(query, { limit, expandSynonyms: false }).map((r) => r.prompt);
}
