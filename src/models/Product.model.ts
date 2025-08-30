import Shop from "./Shop.model";
import Review from "./Review.model";

interface ProductVariant {
  id: string;
  name: string;
  currencyCode: string;
  priceWithTax: number;
  stockLevel: string;
  sku: string;
  options: {
    id: string;
    groupId: string;
    code: string;
    name: string;
  }[];
}

interface ProductOption {
  name: string;
  id: string;
  code: string;
}

interface ProductOptionGroup {
  name: string;
  id: string;
  code: string;
  options: ProductOption[];
}

interface ProductAsset {
  source: string;
  preview: string;
}

interface ProductCollection {
  slug: string;
  name: string;
  parent?: {
    slug: string;
  };
}

interface ProductFacetValue {
  name: string;
  id: string;
  translations: {
    name: string;
    languageCode: string;
    id: string;
  }[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: {
    source: string;
    preview: string;
  };
  assets: ProductAsset[];
  variants: ProductVariant[];
  optionGroups: ProductOptionGroup[];
  collections: ProductCollection[];
  facetValues: ProductFacetValue[];
  // Legacy properties for backward compatibility
  asset?: {
    preview: string;
  };
  price?: number;
  listPrice?: number;
}

export default Product;
