import { getThemeForCategory } from "@/lib/theme-registry";
import { loadStorefrontData } from "@/lib/storefront-data";

export default async function Home() {
  const { info, product, isDemo } = await loadStorefrontData();
  // Called directly rather than rendered as `<Theme .../>` — the theme is
  // resolved dynamically by category, and assigning a resolver's return
  // value to a capitalized variable used as JSX reads to static analysis
  // (react-hooks/static-components) as "a component created during render."
  // It isn't: `getThemeForCategory` returns one of a fixed set of module-level
  // component references, never a freshly created one.
  return getThemeForCategory(info.category)({ info, product, isDemo });
}
