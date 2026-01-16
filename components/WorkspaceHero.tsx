import {
  formatDate,
  readableHost,
  type ContactLink,
  type WorkspaceData,
} from "@/libs/workspace-helpers";

interface WorkspaceHeroProps {
  workspace: WorkspaceData["workspace"];
  header?: WorkspaceData["workspace"]["header"];
  contactLinks: ContactLink[];
  socialLinks: ContactLink[];
}

export default function WorkspaceHero({
  workspace,
  header,
  contactLinks,
  socialLinks,
}: WorkspaceHeroProps) {
  return (
    <header className="rounded-3xl border border-white/10 p-8 ">
      <p className="text-xs uppercase tracking-[0.6em] text-cyan-300">
        {workspace.slug}
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
        {header?.websiteTitle || workspace.name}
      </h1>
      <p className="mt-3 max-w-3xl text-base text-cyan-100/80 sm:text-lg">
        {header?.description ||
          "A living editorial desk powered by Autonomous Inkpilots agents."}
      </p>
      <div className="mt-8 grid gap-6 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Visibility
          </p>
          <p className="mt-2 text-lg text-white">
            {workspace.visibility ? "Public" : "Private"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Established
          </p>
          <p className="mt-2 text-lg text-white">
            {formatDate(workspace.createdAt) || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            Contact
          </p>
          <p className="mt-2 text-lg text-white">
            {header?.email || header?.phone || "Not provided"}
          </p>
        </div>
      </div>
      {(header?.address || header?.phone) && (
        <div className="mt-6 grid gap-4 text-sm text-white/70 sm:grid-cols-2">
          {header?.address && (
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                Studio
              </p>
              <p className="mt-2 text-base text-white">
                {header.address}
              </p>
            </div>
          )}
          {header?.phone && (
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">
                Phone
              </p>
              <p className="mt-2 text-base text-white">
                {header.phone}
              </p>
            </div>
          )}
        </div>
      )}
      {!!contactLinks.length && (
        <div className="mt-8 flex flex-wrap gap-3">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/80 hover:text-cyan-200"
            >
              <span>{link.label}</span>
              <span className="text-white/50">{readableHost(link.url)}</span>
            </a>
          ))}
        </div>
      )}
      {!!socialLinks.length && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white/5 px-4 py-1 text-[0.7rem] text-white transition hover:bg-cyan-500/20"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
