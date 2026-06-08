export type FaqItem = {
  question: string;
  answer: string;
};

export type EvidenceNotes = {
  experience: string;
  precautions: string;
};

export type GeoChecklistArea = "aeo" | "geo" | "eeat";

export type GeoChecklistId =
  | "primary_question"
  | "h2_question"
  | "direct_answer"
  | "extractable_list"
  | "visible_faq"
  | "author_signal"
  | "experience_signal"
  | "precautions_signal"
  | "entity_coverage"
  | "internal_links"
  | "schema_consistency";

export type GeoChecklistItem = {
  id: GeoChecklistId;
  area: GeoChecklistArea;
  label: string;
  passed: boolean;
  detail: string;
};

export type SchemaValidationSummary = {
  valid: boolean;
  warnings: string[];
};

export type GeoAuditResult = {
  aeoScore: number;
  geoScore: number;
  eeatScore: number;
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
    href?: string;
  };
  content?: ProseNode[];
};

type ContentBlock = {
  type: "heading" | "paragraph" | "list" | "other";
  level?: number;
  text: string;
  wordCount: number;
  links: string[];
};

export type GeoAuditInput = {
  title?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  plainText?: string | null;
  html?: string | null;
  editorJson?: unknown;
  primaryQuestion?: string | null;
  answerIntent?: string | null;
  targetAudience?: string | null;
  geoLocation?: string | null;
  businessGoal?: string | null;
  entityTargets?: unknown;
  faqItems?: unknown;
  evidenceNotes?: unknown;
  authorName?: string | null;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForMatch(value: string) {
  return normalizeSpace(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function countWords(value: string) {
  const normalized = normalizeSpace(value);
  return normalized ? normalized.split(/\s+/).filter(Boolean).length : 0;
}

function nodeText(node: ProseNode): string {
  if (node.type === "text") return node.text ?? "";
  if (!Array.isArray(node.content)) return "";
  return normalizeSpace(node.content.map(nodeText).join(" "));
}

function nodeLinks(node: ProseNode): string[] {
  const links = typeof node.attrs?.href === "string" ? [node.attrs.href] : [];
  if (!Array.isArray(node.content)) return links;
  return links.concat(node.content.flatMap(nodeLinks));
}

function blocksFromJson(editorJson: unknown): ContentBlock[] {
  const root = editorJson as ProseNode | null;
  if (!root || !Array.isArray(root.content)) return [];

  return root.content
    .map((node): ContentBlock | null => {
      const text = normalizeSpace(nodeText(node));
      if (!text) return null;

      const base = {
        text,
        wordCount: countWords(text),
        links: nodeLinks(node),
      };

      if (node.type === "heading") {
        return { ...base, type: "heading", level: node.attrs?.level };
      }

      if (node.type === "paragraph") {
        return { ...base, type: "paragraph" };
      }

      if (node.type === "bulletList" || node.type === "orderedList") {
        return { ...base, type: "list" };
      }

      return { ...base, type: "other" };
    })
    .filter((block): block is ContentBlock => Boolean(block));
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'");
}

function linksFromHtml(value: string) {
  return Array.from(value.matchAll(/href\s*=\s*["']([^"']+)["']/gi), (match) => match[1]);
}

function blocksFromHtml(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const pattern = /<(h2|h3|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const text = normalizeSpace(
      decodeBasicEntities(
        match[2]
          .replace(/<li\b[^>]*>/gi, " ")
          .replace(/<[^>]+>/g, " ")
      )
    );
    if (!text) continue;

    const base = {
      text,
      wordCount: countWords(text),
      links: linksFromHtml(match[2]),
    };

    if (tag === "h2" || tag === "h3") {
      blocks.push({ ...base, type: "heading", level: tag === "h2" ? 2 : 3 });
      continue;
    }

    blocks.push({ ...base, type: tag === "p" ? "paragraph" : "list" });
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
      links: [],
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

function isInternalHref(href: string) {
  const normalized = href.trim();
  return (
    normalized.startsWith("/") ||
    normalized.startsWith("#") ||
    normalized.startsWith("./") ||
    normalized.startsWith("../")
  );
}

export function normalizeEntityTargets(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map(normalizeSpace)
        .filter(Boolean)
    )
  ).slice(0, 20);
}

export function normalizeFaqItems(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const question = typeof record.question === "string" ? normalizeSpace(record.question) : "";
      const answer = typeof record.answer === "string" ? normalizeSpace(record.answer) : "";
      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is FaqItem => Boolean(item))
    .slice(0, 12);
}

export function normalizeEvidenceNotes(value: unknown): EvidenceNotes {
  if (!value || typeof value !== "object") {
    return { experience: "", precautions: "" };
  }

  const record = value as Record<string, unknown>;
  return {
    experience:
      typeof record.experience === "string" ? normalizeSpace(record.experience) : "",
    precautions:
      typeof record.precautions === "string"
        ? normalizeSpace(record.precautions)
        : typeof record.limitations === "string"
          ? normalizeSpace(record.limitations)
          : "",
  };
}

export function isTermVisible(term: string, visibleParts: Array<string | null | undefined>) {
  const needle = normalizeForMatch(term);
  if (!needle) return false;
  return normalizeForMatch(visibleParts.filter(Boolean).join(" ")).includes(needle);
}

export function auditGeoContent(input: GeoAuditInput): GeoAuditResult {
  const blocks = getBlocks(input);
  const h2Blocks = blocks.filter((block) => block.type === "heading" && block.level === 2);
  const answerBlocks = h2Blocks
    .map((heading) => followsHeading(blocks, blocks.indexOf(heading)))
    .filter((block): block is ContentBlock => Boolean(block));
  const directAnswerBlocks = answerBlocks.filter(
    (block) => block.wordCount >= 40 && block.wordCount <= 60
  );
  const entityTargets = normalizeEntityTargets(input.entityTargets);
  const faqItems = normalizeFaqItems(input.faqItems);
  const evidenceNotes = normalizeEvidenceNotes(input.evidenceNotes);
  const visibleParts = [
    input.title,
    input.plainText,
    ...blocks.map((block) => block.text),
    ...faqItems.flatMap((item) => [item.question, item.answer]),
    evidenceNotes.experience,
    evidenceNotes.precautions,
    input.authorName,
  ];
  const visibleEntities = entityTargets.filter((entity) => isTermVisible(entity, visibleParts));
  const rawFaqCount = Array.isArray(input.faqItems) ? input.faqItems.length : 0;

  const hasPrimaryQuestion = Boolean(normalizeSpace(input.primaryQuestion ?? ""));
  const hasQuestionHeading = h2Blocks.some((block) => containsQuestion(block.text));
  const hasDirectAnswer = directAnswerBlocks.length > 0;
  const listCount = blocks.filter((block) => block.type === "list").length;
  const hasExtractableList = listCount > 0;
  const faqInBody =
    blocks.some(
      (block) =>
        block.type === "heading" &&
        /faq|questions fréquentes|frequently asked|preguntas frecuentes/i.test(block.text)
    ) || h2Blocks.filter((block) => containsQuestion(block.text)).length >= 2;
  const hasVisibleFaq = faqItems.length > 0 || faqInBody;
  const hasAuthor = Boolean(normalizeSpace(input.authorName ?? ""));
  const articleText = visibleParts.filter(Boolean).join(" ");
  const hasExperience =
    Boolean(evidenceNotes.experience) ||
    /\b(expérience|dans ma pratique|j['’]ai observé|sur le terrain|experience|in my practice|i have observed|experiencia|en mi práctica|he observado)\b/i.test(articleText);
  const hasPrecautions =
    Boolean(evidenceNotes.precautions) ||
    /\b(précaution|limite|contre-indication|ne remplace pas|consultez|precaution|limitation|contraindication|does not replace|consult|precaución|límite|contraindicación|no sustituye|consulte)\b/i.test(articleText);
  const hasEntityCoverage =
    entityTargets.length > 0 && visibleEntities.length === entityTargets.length;
  const internalLinkCount = new Set([
    ...blocks.flatMap((block) => block.links),
    ...(input.html ? linksFromHtml(input.html) : []),
  ].filter(isInternalHref)).size;
  const hasInternalLinks = internalLinkCount > 0;

  const schemaWarnings: string[] = [];
  if (rawFaqCount !== faqItems.length) {
    schemaWarnings.push("Chaque FAQ doit avoir une question et une réponse visibles.");
  }
  if (entityTargets.length > visibleEntities.length) {
    const missing = entityTargets.filter((entity) => !visibleEntities.includes(entity));
    schemaWarnings.push(`Entités absentes du contenu visible : ${missing.join(", ")}.`);
  }
  if (input.focusKeyword && !isTermVisible(input.focusKeyword, visibleParts)) {
    schemaWarnings.push("Le mot-clé principal n'apparaît pas dans le contenu visible.");
  }
  const schemaValid = schemaWarnings.length === 0;
  const contextFields = [
    input.answerIntent,
    input.targetAudience,
    input.geoLocation,
    input.businessGoal,
  ].filter((value) => Boolean(normalizeSpace(value ?? ""))).length;

  const aeoScore = clampScore(
    (hasPrimaryQuestion ? 15 : 0) +
      (hasQuestionHeading ? 20 : 0) +
      (hasDirectAnswer ? 25 : 0) +
      (hasExtractableList ? 15 : 0) +
      (hasVisibleFaq ? 15 : 0) +
      (schemaValid ? 10 : 0)
  );
  const geoScore = clampScore(
    (hasDirectAnswer ? 20 : 0) +
      (hasEntityCoverage ? 25 : 0) +
      (hasInternalLinks ? 15 : 0) +
      (hasVisibleFaq ? 15 : 0) +
      (schemaValid ? 15 : 0) +
      (contextFields >= 3 ? 10 : contextFields >= 1 ? 5 : 0)
  );
  const eeatScore = clampScore(
    (hasAuthor ? 30 : 0) + (hasExperience ? 35 : 0) + (hasPrecautions ? 35 : 0)
  );

  const checklist: GeoChecklistItem[] = [
    {
      id: "primary_question",
      area: "aeo",
      label: "Question principale définie",
      passed: hasPrimaryQuestion,
      detail: hasPrimaryQuestion
        ? input.primaryQuestion!
        : "Définissez la question exacte à laquelle l'article doit répondre.",
    },
    {
      id: "h2_question",
      area: "aeo",
      label: "H2 formulé comme une question",
      passed: hasQuestionHeading,
      detail: hasQuestionHeading
        ? "Une question visible structure la réponse."
        : "Ajoutez un H2 interrogatif proche de la question principale.",
    },
    {
      id: "direct_answer",
      area: "aeo",
      label: "Réponse directe de 40 à 60 mots",
      passed: hasDirectAnswer,
      detail: hasDirectAnswer
        ? `${directAnswerBlocks.length} réponse(s) directe(s) détectée(s).`
        : "Placez une réponse autonome de 40 à 60 mots juste après un H2.",
    },
    {
      id: "extractable_list",
      area: "aeo",
      label: "Liste extractible",
      passed: hasExtractableList,
      detail: hasExtractableList
        ? `${listCount} liste(s) visible(s) détectée(s).`
        : "Ajoutez une liste pour les étapes, critères ou points clés.",
    },
    {
      id: "visible_faq",
      area: "aeo",
      label: "FAQ visible",
      passed: hasVisibleFaq,
      detail: hasVisibleFaq
        ? `${faqItems.length || "Une"} FAQ visible sera rendue dans l'article.`
        : "Ajoutez des questions et réponses réellement affichées sur la page.",
    },
    {
      id: "entity_coverage",
      area: "geo",
      label: "Entités cibles présentes",
      passed: hasEntityCoverage,
      detail:
        entityTargets.length === 0
          ? "Définissez les personnes, méthodes, lieux ou concepts à renforcer."
          : `${visibleEntities.length}/${entityTargets.length} entité(s) présente(s) dans le visible.`,
    },
    {
      id: "internal_links",
      area: "geo",
      label: "Liens internes",
      passed: hasInternalLinks,
      detail: hasInternalLinks
        ? `${internalLinkCount} lien(s) interne(s) détecté(s).`
        : "Reliez l'article à une page service, biographie ou autre story pertinente.",
    },
    {
      id: "schema_consistency",
      area: "geo",
      label: "Cohérence schema / contenu",
      passed: schemaValid,
      detail: schemaValid
        ? "Les données structurées potentielles correspondent au contenu visible."
        : schemaWarnings.join(" "),
    },
    {
      id: "author_signal",
      area: "eeat",
      label: "Auteur identifiable",
      passed: hasAuthor,
      detail: hasAuthor
        ? `${input.authorName} sera identifié comme auteur visible.`
        : "Identifiez clairement l'auteur sur la page.",
    },
    {
      id: "experience_signal",
      area: "eeat",
      label: "Expérience de terrain",
      passed: hasExperience,
      detail: hasExperience
        ? "Un retour d'expérience visible est présent."
        : "Ajoutez un fait observé, une méthode appliquée ou un contexte de pratique.",
    },
    {
      id: "precautions_signal",
      area: "eeat",
      label: "Limites et précautions",
      passed: hasPrecautions,
      detail: hasPrecautions
        ? "Les limites ou précautions sont explicites."
        : "Précisez ce que l'approche ne remplace pas et les situations qui exigent un avis adapté.",
    },
  ];

  return {
    aeoScore,
    geoScore,
    eeatScore,
    llmReadabilityScore: geoScore,
    atomicAnswerPresent: hasDirectAnswer,
    answerCoverageScore: aeoScore,
    schemaValidation: {
      valid: schemaValid,
      warnings: schemaWarnings,
    },
    checklist,
  };
}
