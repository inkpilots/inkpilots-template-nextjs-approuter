import type { MetadataRoute } from "next";

import { getWorkspace } from "@/libs/inkpilots";

const PAGE_SIZE = 6;
const FALLBACK_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

type WorkspacePayload = Awaited<ReturnType<typeof getWorkspace>>;
type WorkspaceAgent = NonNullable<WorkspacePayload>["agents"][number];
type WorkspaceArticle = WorkspaceAgent["articles"][number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const payload = await getWorkspace();
	const baseUrl = sanitizeBaseUrl(
		payload?.workspace?.header?.website || FALLBACK_SITE_URL,
	);

	if (!payload) {
		return [createEntry(baseUrl, "/", new Date())];
	}

	const entries = new Map<string, MetadataRoute.Sitemap[number]>();
	const register = (path: string, lastModified?: string | Date | null) => {
		const normalizedPath = normalizePath(path);
		const timestamp = normalizeDate(lastModified) || new Date();
		const existing = entries.get(normalizedPath);

		if (existing) {
			if (
				!existing.lastModified ||
				(timestamp instanceof Date && existing.lastModified < timestamp)
			) {
				existing.lastModified = timestamp;
			}
			return;
		}

		entries.set(normalizedPath, createEntry(baseUrl, normalizedPath, timestamp));
	};

	register("/", payload.workspace.updatedAt || payload.workspace.createdAt);

	for (const agent of payload.agents) {
		const agentLastModified = resolveAgentLastModified(agent);
		const totalArticles = agent.articles.length;
		const totalPages = Math.max(1, Math.ceil(Math.max(totalArticles, 1) / PAGE_SIZE));

		for (let page = 1; page <= totalPages; page += 1) {
			register(`/agents/${agent.id}/${page}`, agentLastModified);
		}

		for (const article of agent.articles) {
			const slug = getArticleSlug(article);
			if (!slug) continue;
			register(
				`/posts/${slug}`,
				article.updatedAt || article.publishedAt || article.createdAt,
			);
		}
	}

	return Array.from(entries.values());
}

function createEntry(
	baseUrl: string,
	path: string,
	lastModified: Date,
): MetadataRoute.Sitemap[number] {
	const normalized = normalizePath(path);
	const url = normalized === "/" ? baseUrl : `${baseUrl}${normalized}`;
	return {
		url,
		lastModified,
	};
}

function normalizePath(path: string) {
	if (!path) return "/";
	const withLeading = path.startsWith("/") ? path : `/${path}`;
	const collapsed = withLeading.replace(/\/+/g, "/");
	if (collapsed.length > 1 && collapsed.endsWith("/")) {
		return collapsed.slice(0, -1);
	}
	return collapsed || "/";
}

function normalizeDate(value?: string | Date | null) {
	if (!value) return undefined;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

function sanitizeBaseUrl(value: string) {
	return value.replace(/\/+$/, "");
}

function resolveAgentLastModified(agent: WorkspaceAgent) {
	return (
		agent.articles.reduce<Date | undefined>((latest, article) => {
			const timestamp =
				article.updatedAt || article.publishedAt || article.createdAt;
			const candidate = timestamp ? new Date(timestamp) : undefined;
			if (!candidate || Number.isNaN(candidate.getTime())) return latest;
			if (!latest || candidate > latest) return candidate;
			return latest;
		}, undefined) || new Date()
	);
}

function getArticleSlug(article: WorkspaceArticle) {
	const slug = typeof article.slug === "string" ? article.slug.trim() : "";
	return slug || article._id;
}
