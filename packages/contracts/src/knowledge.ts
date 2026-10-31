import {
  invalid,
  integer,
  member,
  onlyKeys,
  record,
  text,
  version,
} from "./validation.js";

export const KNOWLEDGE_LIMITS = {
  maximumSourceBytes: 5 * 1024 * 1024,
  maximumSourcesPerWorkspace: 100,
  maximumExtractedCharacters: 200000,
  maximumManualFaqCharacters: 10000,
} as const;
export const IMPORT_STATES = [
  "pending",
  "validating",
  "extracting",
  "review_required",
  "approved",
  "indexing",
  "ready",
  "failed",
  "deleting",
  "deleted",
] as const;
export const KNOWLEDGE_MEDIA_TYPES = [
  "text/plain",
  "text/markdown",
  "application/pdf",
] as const;

export interface KnowledgeUploadMetadata {
  version: 1;
  filename: string;
  mediaType: (typeof KNOWLEDGE_MEDIA_TYPES)[number];
  sizeBytes: number;
  language: "en" | "de";
}

/** Metadata validation is not content inspection, malware detection or authorization. */
export function parseKnowledgeUploadMetadata(
  value: unknown,
): KnowledgeUploadMetadata {
  const data = record(value);
  onlyKeys(data, ["version", "filename", "mediaType", "sizeBytes", "language"]);
  const filename = text(data.filename, 120);
  if (
    /[\\/\u0000-\u001f]/.test(filename) ||
    filename === "." ||
    filename === ".."
  )
    invalid();
  const sizeBytes = integer(
    data.sizeBytes,
    KNOWLEDGE_LIMITS.maximumSourceBytes,
  );
  if (!sizeBytes) invalid();
  return {
    version: version(data.version),
    filename,
    mediaType: member(data.mediaType, KNOWLEDGE_MEDIA_TYPES),
    sizeBytes,
    language: member(data.language, ["en", "de"]),
  };
}
