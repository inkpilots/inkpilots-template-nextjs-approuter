import { getAgentArticles } from "@/libs/inkpilots";

export default async function Home() {
  const articles = await getAgentArticles({
		agentId: "69667d0f6ea472d36dfc5c2c",
		status: "published",
	});

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start py-12 px-6 bg-white dark:bg-black gap-6">
        <h1 className="text-4xl font-bold mb-8 dark:text-white">Articles</h1>

        {articles && articles.length > 0 ? (
          <div className="grid w-full gap-6">
            {articles.map((article) => (
              <article
                key={article._id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 dark:bg-zinc-900"
              >
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-2 dark:text-white">
                    {article.title}
                  </h2>
                  {article.meta.description && (
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                      {article.meta.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-500">
                    <span>{article.status}</span>
                    {article.createdAt && (
                      <span>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">No articles found.</p>
        )}
      </main>
    </div>
  );
}
