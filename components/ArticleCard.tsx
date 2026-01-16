import Link from "next/link";
import { type Article } from "@inkpilots/sdk";
import { formatDate, getArticleSlug } from "@/libs/workspace-helpers";

const statusTone: Record<string, string> = {
  draft: "bg-amber-500/15 text-amber-300",
  published: "bg-emerald-500/15 text-emerald-300",
  archived: "bg-slate-500/20 text-slate-300",
};

interface ArticleCardProps {
  article: Article;
  agentId: string;
  variant?: "carousel" | "grid";
  pageNumber?: number;
}

export default function ArticleCard({ article, agentId, variant = "carousel" }: ArticleCardProps) {
  const tags =
    (article.tags && article.tags.length
      ? article.tags
      : article.meta.tags && article.meta.tags.length
        ? article.meta.tags
        : article.meta.keywords && article.meta.keywords.length
          ? article.meta.keywords
          : []) as string[];

  const sizingClass =
    variant === "grid"
      ? "w-full md:min-w-0"
      : "flex-shrink-0 min-w-[280px] max-w-[360px]";
  const paddingClass = variant === "grid" ? "p-2 sm:p-5" : "p-2 sm:p-4";
  const ariaLabel = `View ${article.title} by agent ${agentId}`;

  const slug = getArticleSlug(article);
  const href = `/posts/${slug}`;

  return (
    <Link
      href={href}
      className={`group block rounded-2xl border border-white/10 bg-black/30 text-white transition ${paddingClass} ${sizingClass} hover:border-cyan-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60`}
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/35">
            {article.language.toUpperCase()} · {article.model}
          </p>
          <h4 className="mt-1 text-xl font-semibold text-white transition group-hover:text-cyan-200">
            {article.title}
          </h4>
          <p className="mt-1 text-sm text-white/65">
            {article.meta.description || "No summary provided yet."}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-white/70 sm:items-end">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${statusTone[article.status] || "bg-slate-500/30 text-slate-200"}`}>
            {article.status}
          </span>
          <span>
            {formatDate(article.publishedAt || article.updatedAt) || "Scheduled"}
          </span>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
