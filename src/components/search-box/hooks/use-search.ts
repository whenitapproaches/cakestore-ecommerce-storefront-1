import { ChangeEvent, useEffect, useRef, useState, useTransition } from "react";

export default function useSearch() {
  const parentRef = useRef();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [_, startTransition] = useTransition();
  const [category, setCategory] = useState("*");
  const [resultList, setResultList] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [categoryTitle, setCategoryTitle] = useState("All Categories");

  // HANDLE CHANGE THE CATEGORY
  const handleCategoryChange = (cat: { title: string; value: string }) => {
    setCategory(cat.value);
    setCategoryTitle(cat.title);
  };

  // FETCH PRODUCTS VIA API (proxy to Vendure customSearch)
  const getProducts = async (text: string) => {
    try {
      const params = new URLSearchParams({ search: text, limit: String(5) });
      const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store", credentials: "include" });
      if (!res.ok) {
        setResultList([]);
        return;
      }
      const data = await res.json();
      setResultList(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setResultList([]);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      const value = e.target?.value || "";
      setSearchText(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!value) {
        setResultList([]);
        return;
      }
      debounceRef.current = setTimeout(() => {
        getProducts(value);
      }, 300);
    });
  };

  const handleDocumentClick = () => setResultList([]);
  const clearSearch = () => {
    setSearchText("");
    setResultList([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  useEffect(() => {
    window.addEventListener("click", handleDocumentClick);
    return () => {
      window.removeEventListener("click", handleDocumentClick);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    category,
    parentRef,
    resultList,
    handleSearch,
    searchText,
    clearSearch,
    categoryTitle,
    handleCategoryChange
  };
}
