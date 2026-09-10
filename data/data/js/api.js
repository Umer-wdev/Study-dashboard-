const TOPICS_URL = "./data/topics.json";
const TIP_URL = "./data/tip.json";


async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
}


export async function loadDashboardData() {
    const [topics, tip] = await Promise.all([
        fetchJson(TOPICS_URL),
        fetchJson(TIP_URL)
    ]);

    return {
        topics,
        tip
    };
}
