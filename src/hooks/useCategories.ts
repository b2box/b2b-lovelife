import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};

export const useCategoriesWithProductCount = () => {
  const [categories, setCategories] = useState<(Category & { productCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoriesWithCount = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all categories first
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) throw categoriesError;

      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        return;
      }

      // Get product counts for all categories in a single query
      const { data: productCounts, error: countError } = await supabase
        .from('product_categories')
        .select('category_id')
        .in('category_id', categoriesData.map(c => c.id));

      if (countError) {
        console.error('Error getting product counts:', countError);
        // Fallback: set all categories with 0 count
        setCategories(categoriesData.map(cat => ({ ...cat, productCount: 0 })));
        return;
      }

      // Count products per category
      const countMap = new Map<string, number>();
      (productCounts || []).forEach(pc => {
        const count = countMap.get(pc.category_id) || 0;
        countMap.set(pc.category_id, count + 1);
      });

      // Combine categories with their counts
      const categoriesWithCount = categoriesData.map(category => ({
        ...category,
        productCount: countMap.get(category.id) || 0
      }));

      // Filter out categories with no products
      const activeCategories = categoriesWithCount.filter(cat => cat.productCount > 0);

      setCategories(activeCategories);
    } catch (err) {
      console.error('Error fetching categories with count:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithCount();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategoriesWithCount
  };
};