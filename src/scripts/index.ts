import astro from "./astro";

const scripts = [astro()];

const uniqueScriptIdsids = [...new Set(scripts.map((s) => s.id))];

export default scripts.filter((s) => uniqueScriptIdsids.includes(s.id));
