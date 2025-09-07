import currencyJs from "currency.js";
import { formatDistanceStrict } from "date-fns";

/**
 * GET THE DIFFERENCE DATE FORMAT
 * @param  DATE | NUMBER | STRING
 * @returns FORMATTED DATE STRING
 */

function getDateDifference(date: string | number | Date) {
  const distance = formatDistanceStrict(new Date(), new Date(date));
  return distance + " ago";
}

/**
 * RENDER THE PRODUCT PAGINATION INFO
 * @param page - CURRENT PAGE NUMBER
 * @param perPageProduct - PER PAGE PRODUCT LIST
 * @param totalProduct - TOTAL PRODUCT NUMBER
 * @returns
 */

function renderProductCount(page: number, perPageProduct: number, totalProduct: number) {
  let startNumber = (page - 1) * perPageProduct;
  let endNumber = page * perPageProduct;

  if (endNumber > totalProduct) {
    endNumber = totalProduct;
  }
  return `Showing ${startNumber - 1}-${endNumber} of ${totalProduct} products`;
}

/**
 * CALCULATE PRICE WITH PRODUCT DISCOUNT THEN RETURN NEW PRODUCT PRICES
 * @param  price - PRODUCT PRICE
 * @param  discount - DISCOUNT PERCENT
 * @returns - RETURN NEW PRICE
 */

function calculateDiscount(price: number, discount: number) {
  const afterDiscount = Number((price - price * (discount / 100)).toFixed(2));
  return currency(afterDiscount);
}

/**
 * CHANGE THE CURRENCY FORMAT
 * @param  price - PRODUCT PRICE
 * @param  fraction - HOW MANY FRACTION WANT TO SHOW
 * @returns - RETURN PRICE WITH CURRENCY
 */

function currency(price: number, fraction: number = 2) {
  const formatCurrency = currencyJs(price).format({ precision: fraction });
  return formatCurrency;
}

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
export const formatCurrency = (price: number, fractionNotIncluded = false) => formatter.format(price / Math.pow(10, fractionNotIncluded ? 0 : 2));

// Export all API utilities (excluding useApi to avoid conflicts)
export { 
  api, 
  ApiClient, 
  productsApi, 
  categoriesApi, 
  ordersApi, 
  authApi, 
  handleApiError,
  shippingApi,
  couponApi,
  cartApi,
  paymentMethodsApi,
  type ApiResponse,
  type ApiError,
  type HttpMethod,
  type RequestOptions
} from './api'

// Export React hooks for client-side API calls
export { 
  useApi,
  useProducts,
  useCategories,
  useOrders,
  useAuth,
  useCustomApi
} from './useApiClient'

export { currency, getDateDifference, calculateDiscount, renderProductCount };
