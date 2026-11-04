import { shopifyFetch } from './client';
import {
  GET_PRODUCTS_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from './queries';
import {
  Cart,
  ProductDetail,
  ProductListItem,
  ShopifyCollection,
  UserError,
} from './types';

export class ShopifyUserError extends Error {
  constructor(public readonly errors: UserError[]) {
    super(errors.map((e) => e.message).join(' | '));
    this.name = 'ShopifyUserError';
  }
}

export async function fetchProducts(first = 20, query?: string): Promise<ProductListItem[]> {
  interface ProductsData {
    products: {
      nodes: ProductListItem[];
    };
  }
  const data = await shopifyFetch<ProductsData>(GET_PRODUCTS_QUERY, { first, query });
  return data.products?.nodes ?? [];
}

export async function fetchCollections(first = 20): Promise<ShopifyCollection[]> {
  interface CollectionsData {
    collections: {
      nodes: ShopifyCollection[];
    };
  }
  const data = await shopifyFetch<CollectionsData>(GET_COLLECTIONS_QUERY, { first });
  return data.collections?.nodes ?? [];
}

export async function fetchCollectionProducts(handle: string, first = 20): Promise<ProductListItem[]> {
  interface CollectionProductsData {
    collection: {
      id: string;
      title: string;
      handle: string;
      products: {
        nodes: ProductListItem[];
      };
    } | null;
  }
  const data = await shopifyFetch<CollectionProductsData>(GET_COLLECTION_PRODUCTS_QUERY, {
    handle,
    first,
  });
  return data.collection?.products?.nodes ?? [];
}

export async function fetchProductByHandle(handle: string): Promise<ProductDetail | null> {
  interface ProductData {
    product: ProductDetail | null;
  }
  const data = await shopifyFetch<ProductData>(GET_PRODUCT_BY_HANDLE_QUERY, { handle });
  return data.product;
}

export async function fetchCart(id: string): Promise<Cart | null> {
  interface CartData {
    cart: Cart | null;
  }
  try {
    const data = await shopifyFetch<CartData>(GET_CART_QUERY, { id });
    return data.cart;
  } catch (error) {
    // If the cart doesn't exist or is invalid, return null to allow caller to recreate
    return null;
  }
}

export async function createCart(lines: Array<{ merchandiseId: string; quantity: number }> = []): Promise<Cart> {
  interface CartCreateData {
    cartCreate: {
      cart: Cart | null;
      userErrors: UserError[];
    };
  }
  const data = await shopifyFetch<CartCreateData>(CART_CREATE_MUTATION, { lines });
  if (data.cartCreate.userErrors && data.cartCreate.userErrors.length > 0) {
    throw new ShopifyUserError(data.cartCreate.userErrors);
  }
  if (!data.cartCreate.cart) {
    throw new Error('Failed to create cart on Shopify');
  }
  return data.cartCreate.cart;
}

export async function addLinesToCart(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<Cart> {
  interface CartLinesAddData {
    cartLinesAdd: {
      cart: Cart | null;
      userErrors: UserError[];
    };
  }
  const data = await shopifyFetch<CartLinesAddData>(CART_LINES_ADD_MUTATION, { cartId, lines });
  if (data.cartLinesAdd.userErrors && data.cartLinesAdd.userErrors.length > 0) {
    throw new ShopifyUserError(data.cartLinesAdd.userErrors);
  }
  if (!data.cartLinesAdd.cart) {
    throw new Error('Failed to add lines to cart');
  }
  return data.cartLinesAdd.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<Cart> {
  interface CartLinesUpdateData {
    cartLinesUpdate: {
      cart: Cart | null;
      userErrors: UserError[];
    };
  }
  const data = await shopifyFetch<CartLinesUpdateData>(CART_LINES_UPDATE_MUTATION, { cartId, lines });
  if (data.cartLinesUpdate.userErrors && data.cartLinesUpdate.userErrors.length > 0) {
    throw new ShopifyUserError(data.cartLinesUpdate.userErrors);
  }
  if (!data.cartLinesUpdate.cart) {
    throw new Error('Failed to update cart lines');
  }
  return data.cartLinesUpdate.cart;
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  interface CartLinesRemoveData {
    cartLinesRemove: {
      cart: Cart | null;
      userErrors: UserError[];
    };
  }
  const data = await shopifyFetch<CartLinesRemoveData>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds });
  if (data.cartLinesRemove.userErrors && data.cartLinesRemove.userErrors.length > 0) {
    throw new ShopifyUserError(data.cartLinesRemove.userErrors);
  }
  if (!data.cartLinesRemove.cart) {
    throw new Error('Failed to remove cart lines');
  }
  return data.cartLinesRemove.cart;
}

