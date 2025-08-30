import ShopLayout1 from "components/layouts/shop-layout-1";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShopLayout1>{children}</ShopLayout1>;
}
