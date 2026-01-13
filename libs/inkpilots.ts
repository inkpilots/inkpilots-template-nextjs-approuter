import {
	InkPilotsClient,
	InkPilotsQuotaExceededError,
	InkPilotsApiError,
} from "@inkpilots/sdk";

const client = new InkPilotsClient(); // reads process.env.INKPILOTS_API_KEY

type GetAgentArticlesParams = {
  agentId: string;
  status?: "draft" | "published" | "archived";
  limit?: number;
  skip?: number;
};

export async function getAgentArticles(options: GetAgentArticlesParams) {
	try {
		const res = await client.getAgentArticles(options.agentId, {
			limit: options.limit,
			skip: options.skip,
			status: options.status,
		});

    return res.articles;

	} catch (err) {
		if (err instanceof InkPilotsQuotaExceededError) {
			// HTTP 402
			console.error("Quota exceeded:", err.message);
			// show upgrade CTA, ask user to wait for next billing period, etc.
		} else if (err instanceof InkPilotsApiError) {
			console.error("InkPilots API error:", err.status, err.code, err.message);
		} else {
			console.error("Unknown error:", err);
		}
	}
}
