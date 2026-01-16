type InkpilotsModule = typeof import("@/libs/inkpilots");

type WorkspacePayload = Awaited<ReturnType<InkpilotsModule["getWorkspace"]>>;
export type WorkspaceData = NonNullable<WorkspacePayload>;
export type WorkspaceAgent = WorkspaceData["agents"][number];
export type WorkspaceArticle = WorkspaceAgent["articles"][number];
export type WorkspaceHeader = WorkspaceData["workspace"]["header"];
export type SocialAccounts = NonNullable<WorkspaceHeader>["socialAccounts"];

export type ContactLink = {
  label: string;
  url: string;
};

export const formatDate = (value?: string | Date | null, locale: string = "en") => {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;

  // Map app locales to IETF language tags
  const localeMap: Record<string, string> = {
    en: "en-US",
    tr: "tr-TR",
    de: "de-DE",
  };

  const dateLocale = localeMap[locale] || "en-US";

  return date.toLocaleDateString(dateLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const readableHost = (value: string) => {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return value.replace(/^https?:\/\//, "");
  }
};

export const readString = (value: unknown) =>
  typeof value === "string" && value.trim().length ? value.trim() : undefined;

export const getPrimaryLinks = (header?: WorkspaceHeader): ContactLink[] => {
  if (!header) return [];
  const links: Array<ContactLink | null> = [
    header.website ? { label: "Website", url: header.website } : null,
    header.blog ? { label: "Blog", url: header.blog } : null,
    header.documentation ? { label: "Docs", url: header.documentation } : null,
    header.support ? { label: "Support", url: header.support } : null,
  ];

  return links.filter((link): link is ContactLink => Boolean(link));
};

export const getSocialLinks = (socials?: SocialAccounts): ContactLink[] => {
  if (!socials) return [];
  return Object.entries(socials)
    .filter(([, url]) => typeof url === "string" && url.length > 0)
    .map(([network, url]) => ({
      label: network,
      url,
    }));
};

export const agentDisplayName = (agent: WorkspaceAgent) => {
  const rawName = readString(agent["name"]);
  if (rawName) return rawName;
  return `Agent ${agent.id.slice(0, 4).toUpperCase()}`;
};

export const agentTagline = (agent: WorkspaceAgent) => {
  return (
    readString(agent["headline"]) ||
    readString(agent["persona"]) ||
    readString(agent["bio"]) ||
    "Keeping the knowledge base fresh"
  );
};

export const getArticleSlug = (article: WorkspaceArticle) => {
  return readString(article.slug) || article._id;
};
