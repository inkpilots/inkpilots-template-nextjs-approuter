import type { Metadata } from 'next';
import Link from "next/link";
import { getWorkspace } from "@/libs/inkpilots";
import React from "react";

export const dynamic = "force-static";

const PAGE_SIZE = 6;
const gradientBackground = "min-h-screen bg-background text-foreground";
const gradientBackgroundStyle: React.CSSProperties = {
	backgroundImage:
		"radial-gradient(circle at top, rgba(56,189,248,0.25), transparent 55%), radial-gradient(circle at 20% 20%, rgba(14,116,144,0.3), transparent 40%), linear-gradient(hsl(var(--background)), hsl(var(--background)))",
};

type CatchAllParams = {
	slug?: string[];
};

type WorkspacePayload = Awaited<ReturnType<typeof getWorkspace>>;
type WorkspaceData = NonNullable<WorkspacePayload>;
type WorkspaceAgent = WorkspaceData["agents"][number];
type WorkspaceArticle = WorkspaceAgent["articles"][number];
type WorkspaceHeader = WorkspaceData["workspace"]["header"];
type SocialAccounts = NonNullable<WorkspaceHeader>["socialAccounts"];

type ContactLink = {
	label: string;
	url: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getWorkspace();
  return {
    title: payload?.workspace?.name || "InkPilots Next.js App Router Template",
  }
}

export async function generateStaticParams() {
	const payload = await getWorkspace();
	if (!payload) return [];

	const uniquePaths = new Map<string, string[]>();
	const pushPath = (segments: string[]) => {
		const key = segments.join("/") || "__home__";
		uniquePaths.set(key, segments);
	};

	pushPath([]);

	payload.agents.forEach((agent) => {
		const totalArticles = agent.articles.length;
		const totalPages = Math.max(
			1,
			Math.ceil(Math.max(totalArticles, 1) / PAGE_SIZE)
		);
		for (let page = 1; page <= totalPages; page += 1) {
			pushPath(["agents", agent.id, page.toString()]);
		}

		agent.articles.forEach((article) => {
			const slug = article.slug;
			if (slug) {
				pushPath(["posts", slug]);
			}
		});
	});

	return Array.from(uniquePaths.values()).map((segments) => ({
		slug: segments,
	}));
}

export default async function CatchAllPage({
	params,
}: {
	params: CatchAllParams;
}) {
	const { slug = [] } = await params;
	const payload = await getWorkspace();

	if (!payload) {
		return (
			<main className='flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground'>
				<p className='text-lg text-foreground/70'>
					Unable to load workspace details right now.
				</p>
			</main>
		);
	}
	console.log("Slug in CatchAllPage:", slug);
	if (slug.length === 0) {
		return <HomeView data={payload} />;
	}

	if (slug[0] === "agents" && slug[1]) {
		const page = slug[2] ?? "1";
		return <AgentView data={payload} agentId={slug[1]} page={page} />;
	}

	if (slug[0] === "posts" && slug[1]) {
		return <ArticleView data={payload} slug={slug[1]} />;
	}

	return <NotFoundView workspace={payload.workspace} />;
}

function HomeView({ data }: { data: WorkspaceData }) {
	const { workspace, agents } = data;
	const header = workspace.header;
	const contactLinks = getPrimaryLinks(header);
	const socialLinks = getSocialLinks(header?.socialAccounts);
	const totalArticles = agents.reduce(
		(count, agent) => count + agent.articles.length,
		0
	);

	return (
		<div className={gradientBackground} style={gradientBackgroundStyle}>
			<div className='mx-auto flex max-w-7xl flex-col gap-10 lg:gap-12 lg:py-16'>
				<HeroSection
					workspace={workspace}
					header={header}
					contactLinks={contactLinks}
					socialLinks={socialLinks}
				/>
				<section className='rounded-3xl bg-background/30 p-2 md:p-4 sm:p-8'>

					<div className='space-y-6 pr-3 sm:pr-4'>
						{agents.map((agent) => (
							<div
								key={agent.id}
								className='rounded-2xl'
							>
								<div className='flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between'>
									<div>
										<p className='text-xs uppercase tracking-[0.35em] text-foreground/40'>
											Agent #{agent.id.slice(-4)}
										</p>
										<h3 className='text-2xl font-semibold text-foreground'>
											<Link
												href={`/agents/${agent.id}/1`}
												className='transition hover:text-primary/80'
											>
												{agentDisplayName(agent)}
											</Link>
										</h3>
										<p className='text-sm text-foreground/65'>
											{agentTagline(agent)}
										</p>
									</div>
									<InfoStat
										label='Articles'
										value={agent.articles.length.toString()}
									/>
								</div>
								<div className='mt-4 flex gap-4 overflow-x-auto'>
									{agent.articles.length ? (
										agent.articles.slice(0, 4).map((article, index) => (
											<React.Fragment key={`${article.slug}-${index}`}>
												<ArticleCard
													article={article}
													agentId={agent.id}
													variant='carousel'
												/>
											</React.Fragment>
										))
									) : (
										<p className='text-sm text-foreground/60'>
											No articles yet for this agent.
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}

function AgentView({
	data,
	agentId,
	page,
}: {
	data: WorkspaceData;
	agentId: string;
	page: string;
}) {
	const { workspace, agents } = data;
	const header = workspace.header;
	const contactLinks = getPrimaryLinks(header);
	const socialLinks = getSocialLinks(header?.socialAccounts);
	const pageNumber = resolvePageNumber(page);
	const agent = agents.find((entry) => entry.id === agentId);

	if (!agent) {
		return (
			<div className={gradientBackground} style={gradientBackgroundStyle}>
				<div className='mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 lg:gap-12 lg:py-16'>
					<HeroSection
						workspace={workspace}
						header={header}
						contactLinks={contactLinks}
						socialLinks={socialLinks}
					/>
					<section className='rounded-3xl border border-border/5 bg-background/30 p-8 text-center'>
						<p className='text-lg text-foreground/70'>
							Agent not found. This agent may not exist or has been removed.
						</p>
						<Link
							href='/'
							className='mt-5 inline-flex items-center rounded-full border border-primary/60 bg-primary/20 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/80 hover:bg-primary/30'
						>
							← Back to newsroom
						</Link>
					</section>
				</div>
			</div>
		);
	}

	const skip = (pageNumber - 1) * PAGE_SIZE;
	const articles = agent.articles.slice(skip, skip + PAGE_SIZE);
	const total = agent.articles.length;
	const totalPages = Math.max(1, Math.ceil(Math.max(total, 1) / PAGE_SIZE));
	const hasPrevious = pageNumber > 1;
	const hasNext = pageNumber < totalPages;
	const rangeStart = total === 0 ? 0 : skip + 1;
	const rangeEnd = Math.min(skip + articles.length, total);
	const lastUpdated =
		formatDate(
			agent.articles.reduce<Date | null>((latest, article) => {
				const timestamp = article.updatedAt || article.createdAt;
				if (!timestamp) return latest;
				const value = new Date(timestamp);
				if (!latest || value > latest) return value;
				return latest;
			}, null)
		) || "—";

	const createPageHref = (value: number) => `/agents/${agentId}/${value}`;

	return (
		<div className={gradientBackground} style={gradientBackgroundStyle}>
			<div className='mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 lg:gap-12 lg:py-16'>
				<HeroSection
					workspace={workspace}
					header={header}
					contactLinks={contactLinks}
					socialLinks={socialLinks}
				/>

				<div className='flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-foreground/35'>
					<span className='rounded-full bg-foreground/5 px-3 py-1 text-foreground/70'>
						ID · {agentId}
					</span>
					<span className='rounded-full bg-foreground/5 px-3 py-1 text-foreground/70'>
						Last update · {lastUpdated}
					</span>
					<Link
						href='/'
						className='rounded-full bg-primary/20 px-3 py-1 text-foreground transition hover:bg-primary/30'
					>
						← Back to newsroom
					</Link>
				</div>

				<section className='rounded-3xl bg-background/30 p-6 sm:p-8'>
					<div className='flex flex-col gap-4 border-b border-border/10 pb-6 sm:flex-row sm:items-end sm:justify-between'>
						<div>
							<p className='text-xs uppercase tracking-[0.6em] text-primary'>
								Latest drops
							</p>
							<h2 className='mt-3 text-3xl font-semibold text-foreground'>
								{agentDisplayName(agent)}&apos;s desk
							</h2>
							<p className='mt-2 max-w-2xl text-sm text-foreground/70'>
								Paginated feed of everything this agent has shipped.
							</p>
						</div>
						<div className='text-sm text-foreground/60'>
							Page {pageNumber} / {totalPages}
						</div>
					</div>

					{articles.length ? (
						<div className='mt-6 grid gap-5 md:grid-cols-2'>
							{articles.map((article, index) => (
								<React.Fragment key={`${article.slug}-${index}`}>
									<ArticleCard
										article={article}
										agentId={agentId}
										variant='grid'
									/>
								</React.Fragment>
							))}
						</div>
					) : (
						<p className='mt-6 text-sm text-foreground/60'>
							This agent has not published any articles yet.
						</p>
					)}

					<div className='mt-8 flex flex-col gap-4 border-t border-border/10 pt-6 sm:flex-row sm:items-center sm:justify-between'>
						<div className='text-sm text-foreground/60'>
							Showing {rangeStart.toLocaleString()}-{rangeEnd.toLocaleString()}{" "}
							of {total.toLocaleString()} entries
						</div>
						<div className='flex gap-3'>
							{hasPrevious ? (
								<Link
									href={createPageHref(pageNumber - 1)}
									className='inline-flex items-center rounded-full border border-border/20 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/60'
								>
									← Previous
								</Link>
							) : (
								<span className='inline-flex items-center rounded-full border border-border/10 px-4 py-2 text-sm text-foreground/40'>
									← Previous
								</span>
							)}
							{hasNext ? (
								<Link
									href={createPageHref(pageNumber + 1)}
									className='inline-flex items-center rounded-full border border-primary/60 bg-primary/20 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/80 hover:bg-primary/30'
								>
									Next →
								</Link>
							) : (
								<span className='inline-flex items-center rounded-full border border-border/10 px-4 py-2 text-sm text-foreground/40'>
									Next →
								</span>
							)}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

function ArticleView({ data, slug }: { data: WorkspaceData; slug: string }) {
	const { workspace, agents } = data;
	const header = workspace.header;
	const contactLinks = getPrimaryLinks(header);
	const socialLinks = getSocialLinks(header?.socialAccounts);

	const resolved = resolveArticleBySlug(agents, slug);

	if (!resolved) {
		return (
			<div className={gradientBackground} style={gradientBackgroundStyle}>
				<div className='mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 lg:gap-12 lg:py-16'>
					<HeroSection
						workspace={workspace}
						header={header}
						contactLinks={contactLinks}
						socialLinks={socialLinks}
					/>
					<section className='rounded-3xl border border-border/5 bg-background/30 p-8 text-center'>
						<p className='text-lg text-foreground/70'>
							This article does not exist or has been archived.
						</p>
						<Link
							href='/'
							className='mt-5 inline-flex items-center rounded-full border border-primary/60 bg-primary/20 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/80 hover:bg-primary/30'
						>
							← Back to newsroom
						</Link>
					</section>
				</div>
			</div>
		);
	}

	const { article, agent } = resolved;
	const publishedOn =
		formatDate(article.publishedAt || article.createdAt) || "—";
	const updatedOn = formatDate(article.updatedAt) || "—";
	const tokenCount = article.totalTokens?.toLocaleString() || "—";
	const tags = collectTags(article);

	const infoGrid = [
		{ label: "Author", value: agentDisplayName(agent) },
		{ label: "Status", value: article.status },
		{ label: "Language", value: article.language.toUpperCase() },
		{ label: "Model", value: article.model },
		{ label: "Tokens", value: tokenCount },
		{ label: "Published", value: publishedOn },
		{ label: "Updated", value: updatedOn },
		{ label: "Slug", value: getArticleSlug(article) },
	];

	return (
		<div className={gradientBackground} style={gradientBackgroundStyle}>
			<div className='mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 lg:gap-12 lg:py-16'>
				<HeroSection
					workspace={workspace}
					header={header}
					contactLinks={contactLinks}
					socialLinks={socialLinks}
				/>

				<section className='rounded-3xl border border-border/5 bg-background/30 p-4 sm:p-8'>
					<div className='flex items-center justify-between gap-6 border-b border-border/10 pb-6'>
						<Link
							href='/'
							className='inline-flex items-center rounded-full border border-border/15 px-4 py-2 text-sm text-foreground transition hover:border-primary/60'
						>
							← Back to newsroom
						</Link>
						<p className='text-xs uppercase tracking-[0.45em] text-foreground/45'>
							Storyfile
						</p>
					</div>

					<header className='mt-6 space-y-3'>
						<p className='text-sm uppercase tracking-[0.4em] text-primary'>
							{agentDisplayName(agent)} · {article.language.toUpperCase()}
						</p>
						<h1 className='text-4xl font-semibold text-foreground'>
							{article.title}
						</h1>
						<p className='text-base text-foreground/70'>
							{article.meta?.description || "This drop has no description yet."}
						</p>
					</header>

					{tags.length > 0 && (
						<div className='mt-5 flex flex-wrap gap-2'>
							{tags.map((tag) => (
								<span
									key={tag}
									className='rounded-full bg-foreground/5 px-3 py-1 text-xs text-foreground/65'
								>
									#{tag}
								</span>
							))}
						</div>
					)}

					<div className='mt-8 grid gap-4 rounded-2xl border border-border/10 bg-foreground/5 p-5 sm:grid-cols-2'>
						{infoGrid.map((entry) => (
							<div key={entry.label}>
								<p className='text-xs uppercase tracking-[0.35em] text-foreground/40'>
									{entry.label}
								</p>
								<p className='mt-1 text-lg font-semibold text-foreground'>
									{entry.value}
								</p>
							</div>
						))}
					</div>

					<article className='mt-10 space-y-6 text-foreground/90'>
						{renderBlocks(article.content)}
					</article>
				</section>
			</div>
		</div>
	);
}

function NotFoundView({
	workspace,
}: {
	workspace: WorkspaceData["workspace"];
}) {
	return (
		<div className={gradientBackground} style={gradientBackgroundStyle}>
			<div className='mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 lg:gap-12 lg:py-16'>
				<section className='rounded-3xl border border-border/5 bg-background/30 p-8 text-center'>
					<p className='text-lg text-foreground/70'>
						The page you&apos;re looking for does not exist.
					</p>
					<Link
						href='/'
						className='mt-5 inline-flex items-center rounded-full border border-primary/60 bg-primary/20 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/80 hover:bg-primary/30'
					>
						← Back to {workspace.name}
					</Link>
				</section>
			</div>
		</div>
	);
}

function HeroSection({
	workspace,
	header,
	contactLinks,
	socialLinks,
}: {
	workspace: WorkspaceData["workspace"];
	header?: WorkspaceHeader;
	contactLinks: ContactLink[];
	socialLinks: ContactLink[];
}) {
	return (
		<header className='rounded-3xl p-4'>
			<p className='text-xs uppercase tracking-[0.6em] text-primary'>
				{workspace.slug}
			</p>
			<p className='mt-3 max-w-3xl text-base text-primary/80 sm:text-lg'>
				{header?.description ||
					"A living editorial desk powered by autonomous agents."}
			</p>
			<div className='mt-8 grid gap-6 text-sm text-foreground/70 sm:grid-cols-2 lg:grid-cols-3'>
				<HeroMetric
					label='Visibility'
					value={workspace.visibility ? "Public" : "Private"}
				/>
				<HeroMetric
					label='Established'
					value={formatDate(workspace.createdAt) || "—"}
				/>
				<HeroMetric
					label='Contact'
					value={header?.email || header?.phone || "Not provided"}
				/>
			</div>
			{(header?.address || header?.phone) && (
				<div className='mt-6 grid gap-4 text-sm text-foreground/70 sm:grid-cols-2'>
					{header?.address && (
						<div>
							<p className='text-xs uppercase tracking-[0.35em] text-foreground/40'>
								Studio
							</p>
							<p className='mt-2 text-base text-foreground'>{header.address}</p>
						</div>
					)}
					{header?.phone && (
						<div>
							<p className='text-xs uppercase tracking-[0.35em] text-foreground/40'>
								Phone
							</p>
							<p className='mt-2 text-base text-foreground'>{header.phone}</p>
						</div>
					)}
				</div>
			)}
			{!!contactLinks.length && (
				<div className='mt-8 flex flex-wrap gap-3'>
					{contactLinks.map((link) => (
						<Link
							key={link.label}
							href={link.url}
							target='_blank'
							rel='noreferrer'
							className='inline-flex items-center gap-2 rounded-full border border-border/20 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/80 hover:text-primary/80'
						>
							<span>{link.label}</span>
							<span className='text-foreground/50'>{readableHost(link.url)}</span>
						</Link>
					))}
				</div>
			)}
			{!!socialLinks.length && (
				<div className='mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-foreground/40'>
					{socialLinks.map((link) => (
						<Link
							key={link.label}
							href={link.url}
							target='_blank'
							rel='noreferrer'
							className='rounded-full bg-foreground/5 px-4 py-1 text-[0.7rem] text-foreground transition hover:bg-primary/20'
						>
							{link.label}
						</Link>
					))}
				</div>
			)}
		</header>
	);
}

function ArticleCard({
	article,
	agentId,
	variant,
}: {
	article: WorkspaceArticle;
	agentId: string;
	variant: "carousel" | "grid";
}) {
	const tags = collectTags(article).slice(0, 3);
	const sizingClass =
		variant === "grid"
			? "w-full md:min-w-0"
			: "flex-shrink-0 min-w-[280px] max-w-[360px]";
	const paddingClass = variant === "grid" ? "p-2 sm:p-5" : "p-2 sm:p-4";
	const statusTone: Record<string, string> = {
		draft: "bg-foreground/20 text-amber-200",
		published: "bg-primary/25 text-foreground",
		archived: "bg-background/50 text-foreground/70",
	};
	const slug = getArticleSlug(article);
	const href = slug ? `/posts/${slug}` : "#";
	const coverImage = readString(article.coverImage);
	const coverHeight = variant === "grid" ? "h-48" : "h-40";

	return (
		<Link
			href={href}
			className={`group block rounded-2xl border border-border/10 bg-background/30 text-foreground transition ${paddingClass} ${sizingClass} hover:border-primary/60`}
			aria-label={`View ${article.title} by agent ${agentId}`}
		>
			{coverImage && (
				<div
					className={`mb-4 overflow-hidden rounded-2xl border border-border/5 ${coverHeight}`}
				>
					<img
						src={coverImage}
						alt={`${article.title} cover image`}
						className='h-full w-full object-cover'
						loading='lazy'
					/>
				</div>
			)}
			<div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
				<div>
					<p className='text-xs uppercase tracking-[0.35em] text-foreground/35'>
						{article.language.toUpperCase()} · {article.model}
					</p>
					<h4 className='mt-1 text-xl font-semibold text-foreground transition group-hover:text-primary/80'>
						{article.title}
					</h4>
					<p className='mt-1 text-sm text-foreground/65'>
						{article.meta?.description || "No summary provided yet."}
					</p>
				</div>
				<div className='flex flex-col items-start gap-2 text-sm text-foreground/70 sm:items-end'>
					<span
						className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
							statusTone[article.status] || "bg-foreground/25 text-foreground/80"
						}`}
					>
						{article.status}
					</span>
					<span>
						{formatDate(article.publishedAt || article.updatedAt) ||
							"Scheduled"}
					</span>
				</div>
			</div>
			{tags.length > 0 && (
				<div className='mt-3 flex flex-wrap gap-2 text-xs text-foreground/60'>
					{tags.map((tag) => (
						<span key={tag} className='rounded-full bg-foreground/5 px-3 py-1'>
							{tag}
						</span>
					))}
				</div>
			)}
		</Link>
	);
}

function InfoStat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className='text-xs uppercase tracking-[0.35em] text-foreground/35'>
				{label}
			</p>
			<p className='mt-1 text-2xl font-semibold text-foreground'>{value}</p>
		</div>
	);
}

function HeroMetric({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className='text-xs uppercase tracking-[0.35em] text-foreground/40'>
				{label}
			</p>
			<p className='mt-2 text-lg text-foreground'>{value}</p>
		</div>
	);
}

function resolvePageNumber(value?: string) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 1) return 1;
	return Math.floor(parsed);
}

function getPrimaryLinks(header?: WorkspaceHeader): ContactLink[] {
	if (!header) return [];
	const links: Array<ContactLink | null> = [
		header.website ? { label: "Website", url: header.website } : null,
		header.blog ? { label: "Blog", url: header.blog } : null,
		header.documentation ? { label: "Docs", url: header.documentation } : null,
		header.support ? { label: "Support", url: header.support } : null,
	];
	return links.filter((link): link is ContactLink => Boolean(link));
}

function getSocialLinks(socials?: SocialAccounts): ContactLink[] {
	if (!socials) return [];
	return Object.entries(socials)
		.filter(([, url]) => typeof url === "string" && url.length > 0)
		.map(([network, url]) => ({
			label: network,
			url,
		}));
}

function agentDisplayName(agent: WorkspaceAgent) {
	return (
		readString(agent.name) || `Agent ${agent.id.slice(0, 4).toUpperCase()}`
	);
}

function agentTagline(agent: WorkspaceAgent) {
	return (
		readString(agent.headline) ||
		readString(agent.persona) ||
		readString(agent.bio) ||
		"Keeping the knowledge base fresh"
	);
}

function getArticleSlug(article: WorkspaceArticle) {
	return readString(article.slug) || article._id;
}

function readString(value: unknown) {
	return typeof value === "string" && value.trim().length
		? value.trim()
		: undefined;
}

function formatDate(value?: string | Date | null) {
	if (!value) return null;
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function readableHost(value: string) {
	try {
		const url = new URL(value);
		return url.hostname.replace(/^www\./, "");
	} catch {
		return value.replace(/^https?:\/\//, "");
	}
}

function collectTags(article: WorkspaceArticle) {
	if (article.tags?.length) return article.tags;
	if (article.meta?.tags?.length) return article.meta.tags;
	if (article.meta?.keywords?.length) return article.meta.keywords;
	return [];
}

function resolveArticleBySlug(agents: WorkspaceAgent[], slug: string) {
	for (const agent of agents) {
		for (const article of agent.articles) {
			if (getArticleSlug(article) === slug) {
				return { article, agent };
			}
		}
	}
	return null;
}

function renderBlocks(blocks: WorkspaceArticle["content"]) {
	if (!blocks?.length) {
		return [
			<p key='placeholder' className='text-sm text-foreground/60'>
				This article has no public content yet.
			</p>,
		];
	}

	return blocks
		.map((block) => {
			switch (block.type) {
				case "header":
					return (
						<h2 key={block.id} className='text-2xl font-semibold text-foreground'>
							{block.text}
						</h2>
					);
				case "paragraph":
					return (
						<p
							key={block.id}
							className='text-base leading-relaxed text-foreground/80'
						>
							{block.text}
						</p>
					);
				case "quote":
					return (
						<blockquote
							key={block.id}
							className='rounded-2xl border-l-4 border-primary/40 bg-foreground/5 p-4 text-lg italic text-foreground/80'
						>
							“{block.text}”
							{block.source && (
								<footer className='mt-2 text-sm text-foreground/50'>
									— {block.source}
								</footer>
							)}
						</blockquote>
					);
				case "list":
					if (block.ordered) {
						return (
							<ol
								key={block.id}
								className='list-decimal space-y-2 pl-6 text-foreground/80'
							>
								{block.items.map((item, index) => (
									<li key={`${block.id}-${index}`}>{item}</li>
								))}
							</ol>
						);
					}
					return (
						<ul
							key={block.id}
							className='list-disc space-y-2 pl-6 text-foreground/80'
						>
							{block.items.map((item, index) => (
								<li key={`${block.id}-${index}`}>{item}</li>
							))}
						</ul>
					);
				case "image":
					return (
						<figure
							key={block.id}
							className='overflow-hidden rounded-2xl border border-border/10'
						>
							<img
								src={block.url}
								alt={block.alt || block.caption || "Article visual"}
								className='w-full object-cover'
							/>
							{(block.caption || block.alt) && (
								<figcaption className='bg-background/40 px-4 py-2 text-sm text-foreground/70'>
									{block.caption || block.alt}
								</figcaption>
							)}
						</figure>
					);
				case "code":
					return (
						<pre
							key={block.id}
							className='overflow-x-auto rounded-2xl border border-border/10 bg-background/70 p-4 text-sm text-emerald-200'
						>
							<code>{block.text}</code>
						</pre>
					);
				case "divider":
					return <hr key={block.id} className='border-border/10' />;
				default:
					return null;
			}
		})
		.filter(Boolean);
}
