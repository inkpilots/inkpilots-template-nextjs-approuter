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
  slug?: string;
};

export const getWorkspace = async () => {
  try {
    const res = await client.getWorkspace("6947344488431e9d91420af4");
    return res;
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

export async function getAgentArticles(options: GetAgentArticlesParams) {
	try {
		const res = await client.getAgentArticles(options.agentId, {
			limit: options.limit,
			skip: options.skip,
			status: options.status,
      slug: options.slug,
		});

    return res;

	} catch (err) {
    console.log("Error fetching agent articles:");
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
