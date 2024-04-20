import astro from "./astro";
import depBash from "./dep-bash";

const scripts = [depBash(), astro()];

const uniqueScriptIdsids = [...new Set(scripts.map((s) => s.id))];

export default scripts.filter((s) => uniqueScriptIdsids.includes(s.id));
