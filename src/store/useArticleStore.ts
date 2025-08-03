import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_CONFIG, apiRequest } from "@/lib/api";

// Article interfaces based on the API response
interface SEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

interface Author {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  id: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string; // Only available when fetching single article
  image: string;
  author: string;
  authorId: Author;
  readTime: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  featured: boolean;
  views: number;
  likes: string[];
  comments: any[];
  shares?: number; // Optional shares count
  lastModified: string;
  createdAt: string;
  updatedAt: string;
  totalLikes: number;
  totalComments: number;
  seo: SEO;
  id: string;
}

interface ArticlesResponse {
  success: boolean;
  message: string;
  data: Article[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  author?: string;
  sortBy?: "publishedAt" | "title" | "views" | "likes";
  sortOrder?: "asc" | "desc";
}

interface ArticleState {
  articles: Article[];
  featuredArticles: Article[];
  currentArticle: Article | null;
  categories: string[];
  isLoading: boolean;
  error: string | null;
  filters: ArticleFilters;

  // Public actions (no auth required)
  fetchArticles: (filters?: ArticleFilters) => Promise<ArticlesResponse>;
  fetchFeaturedArticles: (limit?: number) => Promise<void>;
  fetchArticleById: (id: string) => Promise<Article>;
  fetchArticleBySlug: (slug: string) => Promise<Article>;
  fetchArticleCategories: () => Promise<string[]>;
  fetchArticlesByCategory: (
    category: string,
    filters?: Omit<ArticleFilters, "category">
  ) => Promise<void>;
  searchArticles: (
    query: string,
    filters?: Omit<ArticleFilters, "search">
  ) => Promise<void>;

  // User actions (require auth)
  likeArticle: (articleId: string) => Promise<void>;
  addComment: (articleId: string, content: string) => Promise<void>;

  // State management
  setFilters: (filters: Partial<ArticleFilters>) => void;
  clearFilters: () => void;
  setCurrentArticle: (article: Article | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useArticleStore = create<ArticleState>()(
  persist(
    (set, get) => ({
      articles: [],
      featuredArticles: [],
      currentArticle: null,
      categories: [],
      isLoading: false,
      error: null,
      filters: {
        page: 1,
        limit: 10,
        sortBy: "publishedAt",
        sortOrder: "desc",
      },

      fetchArticles: async (filters?: ArticleFilters) => {
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          const currentFilters = { ...get().filters, ...filters };

          Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value.toString());
            }
          });

          const data: ArticlesResponse = await apiRequest(
            `${
              API_CONFIG.ENDPOINTS.ARTICLES.GET_ALL
            }?${queryParams.toString()}`,
            {
              method: "GET",
            }
          );

          set({
            articles: data.data,
            filters: currentFilters,
            isLoading: false,
            error: null,
          });

          return data;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch articles";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchFeaturedArticles: async (limit = 6) => {
        set({ isLoading: true, error: null });

        try {
          const data: ArticlesResponse = await apiRequest(
            `${API_CONFIG.ENDPOINTS.ARTICLES.GET_FEATURED}?limit=${limit}`,
            {
              method: "GET",
            }
          );

          set({
            featuredArticles: data.data,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch featured articles";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchArticleById: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            `${API_CONFIG.ENDPOINTS.ARTICLES.GET_BY_ID}/${id}`,
            {
              method: "GET",
            }
          );

          const article: Article = data.data;
          set({
            currentArticle: article,
            isLoading: false,
            error: null,
          });

          return article;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch article";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchArticleBySlug: async (slug: string) => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            `${API_CONFIG.ENDPOINTS.ARTICLES.GET_BY_SLUG}/${slug}`,
            {
              method: "GET",
            }
          );

          const article: Article = data.data;
          set({
            currentArticle: article,
            isLoading: false,
            error: null,
          });

          return article;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch article";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchArticleCategories: async () => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            API_CONFIG.ENDPOINTS.ARTICLES.GET_CATEGORIES,
            {
              method: "GET",
            }
          );

          const categories: string[] = data.data || [];
          set({
            categories,
            isLoading: false,
            error: null,
          });

          return categories;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch categories";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchArticlesByCategory: async (
        category: string,
        filters?: Omit<ArticleFilters, "category">
      ) => {
        const categoryFilters = { ...filters, category };
        await get().fetchArticles(categoryFilters);
      },

      searchArticles: async (
        query: string,
        filters?: Omit<ArticleFilters, "search">
      ) => {
        const searchFilters = { ...filters, search: query };
        await get().fetchArticles(searchFilters);
      },

      likeArticle: async (articleId: string) => {
        set({ isLoading: true, error: null });

        try {
          await apiRequest(
            `${API_CONFIG.ENDPOINTS.ARTICLES.LIKE}/${articleId}/like`,
            {
              method: "POST",
            }
          );

          // Update the article in local state
          set((state) => ({
            articles: state.articles.map((article) =>
              article._id === articleId
                ? {
                    ...article,
                    totalLikes: article.totalLikes + 1,
                    likes: [...article.likes, "current-user-id"], // This would be the actual user ID
                  }
                : article
            ),
            featuredArticles: state.featuredArticles.map((article) =>
              article._id === articleId
                ? {
                    ...article,
                    totalLikes: article.totalLikes + 1,
                    likes: [...article.likes, "current-user-id"],
                  }
                : article
            ),
            currentArticle:
              state.currentArticle?._id === articleId
                ? {
                    ...state.currentArticle,
                    totalLikes: state.currentArticle.totalLikes + 1,
                    likes: [...state.currentArticle.likes, "current-user-id"],
                  }
                : state.currentArticle,
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to like article";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      addComment: async (articleId: string, content: string) => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiRequest(
            `${API_CONFIG.ENDPOINTS.ARTICLES.ADD_COMMENT}/${articleId}/comments`,
            {
              method: "POST",
              body: JSON.stringify({ content }),
            }
          );

          // Update the article in local state
          set((state) => ({
            articles: state.articles.map((article) =>
              article._id === articleId
                ? {
                    ...article,
                    totalComments: article.totalComments + 1,
                    comments: [...article.comments, data.data],
                  }
                : article
            ),
            currentArticle:
              state.currentArticle?._id === articleId
                ? {
                    ...state.currentArticle,
                    totalComments: state.currentArticle.totalComments + 1,
                    comments: [...state.currentArticle.comments, data.data],
                  }
                : state.currentArticle,
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to add comment";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      setFilters: (filters: Partial<ArticleFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({
          filters: {
            page: 1,
            limit: 10,
            sortBy: "publishedAt",
            sortOrder: "desc",
          },
        });
      },

      setCurrentArticle: (article: Article | null) => {
        set({ currentArticle: article });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: "article-storage",
      partialize: (state) => ({
        articles: state.articles,
        featuredArticles: state.featuredArticles,
        categories: state.categories,
        currentArticle: state.currentArticle,
        filters: state.filters,
      }),
    }
  )
);
