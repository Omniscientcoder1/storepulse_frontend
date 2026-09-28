import "server-only";

import type { FC } from "react";

import type { TenantCategory } from "@storepulse/api-client";
import { HomePage as BeautyHomePage } from "@storepulse/theme-beauty";
import { HomePage as ElectronicsHomePage } from "@storepulse/theme-electronics";
import type { StorefrontHomeProps } from "@storepulse/theme-electronics";
import { HomePage as FashionHomePage } from "@storepulse/theme-fashion";
import { HomePage as FoodHomePage } from "@storepulse/theme-food";
import { HomePage as HomeKitchenHomePage } from "@storepulse/theme-home-kitchen";

/**
 * FE-13: one `packages/themes/<category>` package per storefront category,
 * each exporting the same `HomePage(props: StorefrontHomeProps)` shape (see
 * `@storepulse/theme-electronics`'s docstring) — this registry is the only
 * place that picks one by `tenant.category`, so `apps/storefront`'s own
 * routes hold no category-specific markup themselves.
 *
 * `other` falls back to Electronics — a generic single-product layout is a
 * reasonable default for the one category deliberately left themeless.
 *
 * Typed as `FC` (function component), not the broader `ComponentType`, so
 * `app/page.tsx` can call the resolved theme directly as a plain function —
 * every theme's `HomePage` is a function component and `FC` alone has a call
 * signature, unlike `ComponentType`'s class-component branch.
 */
const THEME_REGISTRY: Partial<Record<TenantCategory, FC<StorefrontHomeProps>>> = {
  electronics: ElectronicsHomePage,
  fashion: FashionHomePage,
  beauty: BeautyHomePage,
  home_kitchen: HomeKitchenHomePage,
  food: FoodHomePage,
};

const DEFAULT_THEME = ElectronicsHomePage;

export function getThemeForCategory(category: TenantCategory): FC<StorefrontHomeProps> {
  return THEME_REGISTRY[category] ?? DEFAULT_THEME;
}
