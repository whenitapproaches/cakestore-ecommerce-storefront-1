export const revalidate = 300
export const dynamic = "force-dynamic"

import { ProductSearchPageView } from "pages-sections/product-details/page-view"
import { productsApi, handleApiError } from "lib/api"
import { get } from "lodash"

export default async function ShopPage({ params, searchParams }: { 
  params: any; 
  searchParams: {
    page?: string;
    limit?: string;
    sortBy?: string;
    view?: string;
    brand?: string;
    color?: string;
    sales?: string;
    price?: string;
    rating?: string;
    search?: string;
  }
}) {
  let products = []
  let total = 0
  
  try {
    // Parse URL parameters
    const page = searchParams.page ? parseInt(searchParams.page) : 1
    const limit = searchParams.limit ? parseInt(searchParams.limit) : 12
    const sortBy = searchParams.sortBy || 'date'
    const view = searchParams.view || 'grid'
    const search = searchParams.search || ''
    
    // Parse filters
    const filters = {
      brand: searchParams.brand ? searchParams.brand.split(',') : [],
      color: searchParams.color ? searchParams.color.split(',') : [],
      sales: searchParams.sales ? searchParams.sales.split(',') : [],
      price: searchParams.price ? searchParams.price.split(',').map(p => parseFloat(p)) : [0, 300],
      rating: searchParams.rating ? parseInt(searchParams.rating) : 0,
    }
    
    // Use the reusable API helper to fetch products with filters
    const response = await productsApi.getAll({
      page,
      limit,
      sortBy,
      view,
      filters,
      search,
    })
    
    products = get(response, 'data.items', [])
    total = get(response, 'data.total', 0)
  } catch (error) {
    console.error("API fetch failed:", handleApiError(error))
    
    // Fallback to empty array if API fails
    products = []
    total = 0
  }

  return (
    <ProductSearchPageView 
      products={products} 
      total={total}
      initialFilters={{
        page: searchParams.page ? parseInt(searchParams.page) : 1,
        limit: searchParams.limit ? parseInt(searchParams.limit) : 12,
        sortBy: searchParams.sortBy || 'date',
        view: searchParams.view || 'grid',
        filters: {
          brand: searchParams.brand ? searchParams.brand.split(',') : [],
          color: searchParams.color ? searchParams.color.split(',') : [],
          sales: searchParams.sales ? searchParams.sales.split(',') : [],
          price: searchParams.price ? searchParams.price.split(',').map(p => parseFloat(p)) : [0, 300],
          rating: searchParams.rating ? parseInt(searchParams.rating) : 0,
        },
        search: searchParams.search || '',
      }}
    />
  )
}
