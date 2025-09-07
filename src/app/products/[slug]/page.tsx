import { Metadata } from "next";
import { notFound } from "next/navigation";
// PAGE VIEW COMPONENT
import { ProductDetailsPageView } from "pages-sections/product-details/page-view";
// API FUNCTIONS
import { productsApi, handleApiError } from "lib/api";
import { get } from "lodash";

// Generate metadata for the product page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const response = await productsApi.getBySlug(params.slug);
    const product = get(response, 'data.product');
    
    if (!product) {
      return {
        title: "Product Not Found - Bazaar",
        description: "The requested product could not be found.",
      };
    }

    return {
      title: `${product.name} - Bazaar`,
      description: product.description || `Buy ${product.name} online at Bazaar.`,
      openGraph: {
        title: product.name,
        description: product.description || `Buy ${product.name} online at Bazaar.`,
        images: product.featuredAsset ? [product.featuredAsset.preview] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Buy ${product.name} online at Bazaar.`,
        images: product.featuredAsset ? [product.featuredAsset.preview] : [],
      },
    };
  } catch (error) {
    return {
      title: "Product Details - Bazaar",
      description: "Product details page",
    };
  }
}

export default async function ProductDetails({ params }: { params: { slug: string } }) {
  try {
    // Fetch product using the new API
    const response = await productsApi.getBySlug(params.slug);
    const product = get(response, 'data.product');
    
    if (!product) {
      notFound();
    }

    return (
      <ProductDetailsPageView
        product={product}
      />
    );
  } catch (error) {
    console.error("Product fetch failed:", handleApiError(error));
    notFound();
  }
}
