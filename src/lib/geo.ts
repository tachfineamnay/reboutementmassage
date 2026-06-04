export type GeoChecklistId =
  | "h2_structure"
  | "atomic_answer"
  | "answer_length"
  | "bullet_lists"
  | "faq_visible"
  | "schema_consistency";

export type GeoChecklistItem = {
  id: GeoChecklistId;
  label: string;
  passed: boolean;
  detail: string;
};

export type SchemaValidationSummary = {
  valid: boolean;
  warnings: string[];
};

export type GeoAuditResult = {
  llmReadabilityScore: number;
  atomicAnswerPresent: boolean;
  answerCoverageScore: number;
  schemaValidation: SchemaValidationSummary;
  checklist: GeoChecklistItem[];
};

type ProseNode = {
  type?: string;
  text?: string;
  attrs?: {
    level?: number;
  };
  content?: ProseNode[];
};

type ContentBlock = {
  type: "heading" | "paragraph" | "list" | "other";
  level?: number;
  text: string;
  wordCount: number;
};

export type GeoAuditInput = {
  title?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  plainText?: string | null;
  html?: string | null;
  editorJson?: unknown;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function countWords(value: string) {
  return normalizeSpace(value).split(/\s+/).filter(Boolean).length;
}

function nodeText(node: ProseNode): string {
  if (node.type === "text") return node.text ?? "";
  if (!Array.isArray(node.content)) return "";
  return normalizeSpace(node.content.map(nodeText).join(" "));
}

function listText(node: ProseNode): string {
  if (!Array.isArray(node.content)) return "";
  return normalizeSpace(node.content.map(nodeText).join(" "));
}

function blocksFromJson(editorJson: unknown): ContentBlock[] {
  const root = editorJson as ProseNode | null;
  if (!root || !Array.isArray(root.content)) return [];

  return root.content
    .map((node): ContentBlock | null => {
      const text = node.type === "bulletList" || node.type === "orderedList"
        ? listText(node)
        : nodeText(node);
      const normalizedText = normalizeSpace(text);
      if (!normalizedText) return null;

      if (node.type === "heading") {
        return {
          type: "heading",
          level: node.attrs?.level,
          text: normalizedText,
          wordCount: countWords(normalizedText),
        };
      }

      if (node.type === "paragraph") {
        return {
          type: "paragraph",
          text: normalizedText,
          wordCount: countWords(normalizedText),
        };
      }

      if (node.type === "bulletList" || node.type === "orderedList") {
        return {
          type: "list",
          text: normalizedText,
          wordCount: countWords(normalizedText),
        };
      }

      return {
        type: "other",
        text: normalizedText,
        wordCount: countWords(normalizedText),
      };
    })
    .filter((block): block is ContentBlock => Boolean(block));
}

function blocksFromHtml(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const pattern = /<(h2|h3|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const text = normalizeSpace(
      match[2]
        .replace(/<li\b[^>]*>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
    );
    if (!text) continue;

    if (tag === "h2" || tag === "h3") {
      blocks.push({
        type: "heading",
        level: tag === "h2" ? 2 : 3,
        text,
        wordCount: countWords(text),
      });
      continue;
    }

    blocks.push({
      type: tag === "p" ? "paragraph" : "list",
      text,
      wordCount: countWords(text),
    });
  }

  return blocks;
}

function blocksFromPlainText(plainText: string): ContentBlock[] {
  return plainText
    .split(/\n{2,}/)
    .map(normalizeSpace)
    .filter(Boolean)
    .map((text) => ({
      type: "paragraph" as const,
      text,
      wordCount: countWords(text),
    }));
}

function getBlocks(input: GeoAuditInput) {
  const fromJson = blocksFromJson(input.editorJson);
  if (fromJson.length > 0) return fromJson;

  if (input.html) {
    const fromHtml = blocksFromHtml(input.html);
    if (fromHtml.length > 0) return fromHtml;
  }

  return input.plainText ? blocksFromPlainText(input.plainText) : [];
}

function followsHeading(blocks: ContentBlock[], index: number) {
  for (let i = index + 1; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (block.type === "heading") return null;
    if (block.type === "paragraph") return block;
  }
  return null;
}

function containsQuestion(text: string) {
  return /\?|\b(comment|pourquoi|quand|combien|quel|quelle|what|why|when|how|where|which|que|como|cu[aá]ndo|por qu[eé]|d[oó]nde)\b/i.test(text);
}

export function auditGeoContent(input: GeoAuditInput): GeoAuditResult {
  const blocks = getBlocks(input);
  const h2Blocks = blocks.filter((block) => block.type === "heading" && block.level === 2);
  const listCount = blocks.filter((block) => block.type === "list").length;
  const answerBlocks = h2Blocks
    .map((heading) => followsHeading(blocks, blocks.indexOf(heading)))
    .filter((block): block is ContentBlock => Boolean(block));
  const idealAnswerBlocks = answerBlocks.filter(
    (block) => block.wordCount >= 40 && block.wordCount <= 60
  );
  const flexibleAnswerBlocks = answerBlocks.filter(
    (block) => block.wordCount >= 25 && block.wordCount <= 80
  );
  const hasQuestionHeading = h2Blocks.some((block) => containsQuestion(block.text));
  const faqVisible =
    blocks.some((block) => block.type === "heading" && /faq|questions|preguntas|réponses|respuestas/i.test(block.text)) ||
    blocks.filter((block) => containsQuestion(block.text)).length >= 2;

  const warnings: string[] = [];
  if (!input.seoTitle && !input.title) warnings.push("Titre SEO ou titre article manquant.");
  if (!input.metaDescription) warnings.push("Meta description manquante.");
  if (!input.focusKeyword) warnings.push("Mot-clé principal non renseigné.");

  const hasH2 = h2Blocks.length > 0;
  const hasAtomicAnswer = flexibleAnswerBlocks.length > 0 || (hasQuestionHeading && answerBlocks.length > 0);
  const hasIdealAnswerLength = idealAnswerBlocks.length > 0;
  const hasBullets = listCount > 0;
  const schemaValid = warnings.length === 0;
  const answerCoverageScore =
    h2Blocks.length === 0 ? 0 : clampScore((flexibleAnswerBlocks.length / h2Blocks.length) * 100);

  const checklist: GeoChecklistItem[] = [
    {
      id: "h2_structure",
      label: "Structure H2 claire",
      passed: hasH2,
      detail: hasH2 ? `${h2Blocks.length} intertitre(s) H2 détecté(s).` : "Ajoutez des H2 qui portent une intention de recherche.",
    },
    {
      id: "atomic_answer",
      label: "Réponse atomique sous H2",
      passed: hasAtomicAnswer,
      detail: hasAtomicAnswer
        ? "Une réponse directe suit au moins un H2."
        : "Ajoutez un paragraphe de réponse immédiatement après un H2.",
    },
    {
      id: "answer_length",
      label: "Paragraphe 40-60 mots",
      passed: hasIdealAnswerLength,
      detail: hasIdealAnswerLength
        ? "Au moins une réponse est dans la fenêtre 40-60 mots."
        : "Visez 40 à 60 mots pour la première réponse sous un H2.",
    },
    {
      id: "bullet_lists",
      label: "Listes extractibles",
      passed: hasBullets,
      detail: hasBullets ? `${listCount} liste(s) détectée(s).` : "Ajoutez une liste à puces ou numérotée pour les étapes, critères ou bénéfices.",
    },
    {
      id: "faq_visible",
      label: "FAQ visible",
      passed: faqVisible,
      detail: faqVisible ? "Questions visibles détectées." : "Ajoutez des questions/réponses visibles si le sujet s'y prête.",
    },
    {
      id: "schema_consistency",
      label: "Cohérence schema/contenu",
      passed: schemaValid,
      detail: schemaValid ? "Les champs SEO principaux sont présents." : warnings.join(" "),
    },
  ];

  const llmReadabilityScore = clampScore(
    (hasH2 ? 20 : 0) +
      (hasAtomicAnswer ? 25 : 0) +
      (hasIdealAnswerLength ? 15 : 0) +
      (hasBullets ? 15 : 0) +
      (faqVisible ? 10 : 0) +
      (schemaValid ? 15 : 0)
  );

  return {
    llmReadabilityScore,
    atomicAnswerPresent: hasAtomicAnswer,
    answerCoverageScore,
    schemaValidation: {
      valid: schemaValid,
      warnings,
    },
    checklist,
  };
}
