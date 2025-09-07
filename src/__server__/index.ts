import MockAdapter from "axios-mock-adapter";

import { RelatedProductsEndpoints } from "./__db__/related-products";
import { ShopEndpoints } from "./__db__/shop";
import { UsersEndpoints } from "./__db__/users";
import { UserOrders1Endpoints } from "./__db__/orders";
import { UserAddressEndpoints } from "./__db__/address";
import { ProductsEndpoints } from "./__db__/products";

export const MockEndPoints = (Mock: MockAdapter) => {
  ShopEndpoints(Mock);
  UsersEndpoints(Mock);
  ProductsEndpoints(Mock);
  UserAddressEndpoints(Mock);
  UserOrders1Endpoints(Mock);
  RelatedProductsEndpoints(Mock);

  Mock.onAny().passThrough();
};
