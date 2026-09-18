import { ApiClient, type ApiClientConfig } from "./client";
import { login, logout, me } from "./resources/auth";
import { getCustomer, listCustomers } from "./resources/customers";
import { getDashboardSummary } from "./resources/dashboard";
import { getHealth } from "./resources/health";
import { createOrder, getOrder, listOrders, updateOrder } from "./resources/orders";
import { listOrderPayments, recordManualPayment } from "./resources/payments";
import {
  createProduct,
  deleteProduct,
  getAdminProduct,
  listAdminProducts,
  updateProduct,
} from "./resources/products";
import { getSettings, updateSettings } from "./resources/settings";
import { getStorefrontInfo, listPublicProducts } from "./resources/storefront";
import type { OrderCreate, OrderStatus, OrderUpdate } from "./types/order";
import type { ManualPaymentRequest } from "./types/payment";
import type { ProductCreate, ProductUpdate } from "./types/product";
import type { TenantSettingsUpdate } from "./types/settings";

export { ApiClient } from "./client";
export type { ApiClientConfig, RequestOptions } from "./client";
export { ApiError } from "./errors";
export type { AdminUserRead, LoginRequest, MeResponse, TokenResponse } from "./types/auth";
export type { CustomerDetail, CustomerOrderSummary, CustomerRead } from "./types/customer";
export type { DashboardSummary, LowStockProduct } from "./types/dashboard";
export type { HealthResponse } from "./types/health";
export {
  ALLOWED_ORDER_TRANSITIONS,
} from "./types/order";
export type {
  DeliveryMethod,
  OrderCreate,
  OrderRead,
  OrderStatus,
  OrderUpdate,
} from "./types/order";
export type { Page } from "./types/pagination";
export type {
  ManualPaymentProvider,
  ManualPaymentRequest,
  PaymentRead,
  PaymentStatus,
} from "./types/payment";
export type {
  OptionDefinition,
  OptionType,
  ProductCreate,
  ProductPublic,
  ProductRead,
  ProductUpdate,
} from "./types/product";
export type {
  TenantCategory,
  TenantSettingsRead,
  TenantSettingsUpdate,
  ThemeConfig,
} from "./types/settings";
export type { TenantStorefrontInfo } from "./types/storefront";

/**
 * Facade used by app code: `new StorePulseApiClient({ baseUrl, getAuthToken })`,
 * then `client.health.get()`. Add a `resource: { ... }` group here as each
 * resource in `resources/` comes online, per FE-03's grouping pattern.
 */
export class StorePulseApiClient {
  private readonly client: ApiClient;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);
  }

  readonly health = {
    get: () => getHealth(this.client),
  };

  readonly auth = {
    login: (body: { email: string; password: string }) => login(this.client, body),
    logout: () => logout(this.client),
    me: () => me(this.client),
  };

  readonly dashboard = {
    summary: () => getDashboardSummary(this.client),
  };

  readonly orders = {
    list: (params?: { status?: OrderStatus; limit?: number; offset?: number }) =>
      listOrders(this.client, params),
    get: (orderId: string) => getOrder(this.client, orderId),
    create: (body: OrderCreate) => createOrder(this.client, body),
    update: (orderId: string, body: OrderUpdate) => updateOrder(this.client, orderId, body),
  };

  readonly payments = {
    recordManual: (body: ManualPaymentRequest) => recordManualPayment(this.client, body),
    listForOrder: (orderId: string) => listOrderPayments(this.client, orderId),
  };

  readonly customers = {
    list: (params?: { q?: string; limit?: number; offset?: number }) =>
      listCustomers(this.client, params),
    get: (customerId: string) => getCustomer(this.client, customerId),
  };

  readonly products = {
    list: (params?: { is_active?: boolean; limit?: number; offset?: number }) =>
      listAdminProducts(this.client, params),
    get: (productId: string) => getAdminProduct(this.client, productId),
    create: (body: ProductCreate) => createProduct(this.client, body),
    update: (productId: string, body: ProductUpdate) =>
      updateProduct(this.client, productId, body),
    delete: (productId: string) => deleteProduct(this.client, productId),
  };

  readonly settings = {
    get: () => getSettings(this.client),
    update: (body: TenantSettingsUpdate) => updateSettings(this.client, body),
  };

  readonly storefront = {
    listProducts: (tenantId: string, params?: { limit?: number; offset?: number }) =>
      listPublicProducts(this.client, tenantId, params),
    getInfo: (tenantId: string) => getStorefrontInfo(this.client, tenantId),
  };
}
