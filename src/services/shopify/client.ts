import { getActiveMerchantConfig } from '../../config/merchant';
import { GraphQLErrorItem, GraphQLResponse } from './types';

export class ShopifyNetworkError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'ShopifyNetworkError';
  }
}

export class ShopifyTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Shopify API request timed out after ${timeoutMs}ms.`);
    this.name = 'ShopifyTimeoutError';
  }
}

export class ShopifyHttpError extends Error {
  constructor(public readonly status: number, public readonly statusText: string, public readonly body?: string) {
    super(`Shopify HTTP Error: ${status} ${statusText}`);
    this.name = 'ShopifyHttpError';
  }
}

export class ShopifyGraphQLError extends Error {
  constructor(public readonly errors: GraphQLErrorItem[]) {
    const errorMessages = errors.map((e) => e.message).join(' | ');
    super(`Shopify GraphQL Error: ${errorMessages}`);
    this.name = 'ShopifyGraphQLError';
  }
}

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  timeoutMs = 15000
): Promise<T> {
  const config = getActiveMerchantConfig();
  const endpoint = `https://${config.shopDomain}/api/${config.apiVersion}/graphql.json`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.storefrontToken && config.storefrontToken.trim() !== '') {
    headers['X-Shopify-Storefront-Access-Token'] = config.storefrontToken;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ShopifyTimeoutError(timeoutMs);
    }
    throw new ShopifyNetworkError(
      err instanceof Error ? err.message : 'Failed to connect to Shopify store',
      err
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let json: GraphQLResponse<T>;
  const text = await response.text();

  if (!response.ok) {
    throw new ShopifyHttpError(response.status, response.statusText, text);
  }

  try {
    json = JSON.parse(text) as GraphQLResponse<T>;
  } catch (parseError) {
    throw new ShopifyNetworkError('Failed to parse JSON response from Shopify', parseError);
  }

  if (json.errors && json.errors.length > 0) {
    throw new ShopifyGraphQLError(json.errors);
  }

  if (!json.data) {
    throw new ShopifyNetworkError('Shopify response missing data field');
  }

  return json.data;
}

