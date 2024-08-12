import { z } from "zod";

export const ArxivEntrySchema = z.object({
  id: z.array(z.string()),
  updated: z.array(z.string()),
  published: z.array(z.string()),
  title: z.array(z.string()),
  summary: z.array(z.string()),
  author: z.array(z.object({ name: z.array(z.string()) })),
  link: z.array(z.object({ $: z.object({}) })),
  "arxiv:primary_category": z.array(
    z.object({ $: z.object({ term: z.string() }) }),
  ),
  category: z.array(z.object({ $: z.object({ term: z.string() }) })),
});

export const ArxivResponseSchema = z.object({
  feed: z.object({
    $: z.object({ xmlns: z.string() }),
    link: z.array(z.object({ $: z.object({}) })),
    title: z.array(
      z.object({ _: z.string(), $: z.object({ type: z.string() }) }),
    ),
    id: z.array(z.string()),
    updated: z.array(z.string()),
    "opensearch:totalResults": z.array(z.object({ _: z.string() })),
    "opensearch:startIndex": z.array(z.object({ _: z.string() })),
    "opensearch:itemsPerPage": z.array(z.object({ _: z.string() })),
    entry: z.array(ArxivEntrySchema),
  }),
});

export const ArxivPaperDataSchema = z.object({
  link: z.string(),
  updated: z.string(),
  published: z.string(),
  title: z.string(),
  summary: z.string(),
  authors: z.array(z.string()),
  primaryCategory: z.string(),
  categories: z.array(z.string()),
});
