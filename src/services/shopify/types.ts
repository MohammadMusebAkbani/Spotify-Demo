export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface PriceRange {
  minVariantPrice: MoneyV2;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: MoneyV2;
  selectedOptions?: SelectedOption[];
  product?: {
    id: string;
    title: string;
    handle: string;
  };
  image?: ShopifyImage | null;
}

export interface ProductListItem {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  priceRange: PriceRange;
  variants?: {
    nodes: Array<{
      id: string;
      title: string;
      availableForSale: boolean;
    }>;
  };
}

export interface ProductDetail {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  images: {
    nodes: ShopifyImage[];
  };
  priceRange: PriceRange;
  variants: {
    nodes: ProductVariant[];
  };
  options?: ProductOption[];
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: MoneyV2;
  };
  merchandise: ProductVariant;
}

export interface CartCost {
  totalAmount: MoneyV2;
  subtotalAmount?: MoneyV2;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: CartCost;
  lines: {
    nodes: CartLine[];
  };
}

export interface UserError {
  field: string[] | null;
  message: string;
}

export interface GraphQLErrorLocation {
  line: number;
  column: number;
}

export interface GraphQLErrorItem {
  message: string;
  locations?: GraphQLErrorLocation[];
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLErrorItem[];
}

