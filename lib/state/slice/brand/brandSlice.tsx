/* eslint-disable @typescript-eslint/no-explicit-any */
import instanceAxios from "@/lib/axiosInstance/instanceAxios";
import { getHeaders } from "@/lib/headers/headers";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

// Types
export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
interface Pagination {
  totalRecords?: number;
  totalPages?: number;
  currentPage?: number;
}

interface BrandResponse {
  data: Brand[];
  pagination?: Pagination;
  page?: number;
  meta?: {
    arg?: {
      page?: number;
      isInfiniteScroll?: boolean;
    };
  };
}

interface BrandState {
  data: Brand[];
  loadedPages: number[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  selectedBrand: Brand | null;
  success: boolean;
}

interface GetBrandsParams {
  page?: number;
  perPage?: number;
  isInfiniteScroll?: boolean;
  [key: string]: any;
}

interface UpdateBrandPayload {
  id: string | number;
  brandData: any;
}

interface ErrorResponse {
  message?: string;
  data?: any[];
  [key: string]: any;
}

interface RootState {
  brand: BrandState;
}

// GET All Brands (basic)
export const getAllBrands = createAsyncThunk<
  BrandResponse | null,
  GetBrandsParams,
  { rejectValue: ErrorResponse; state: RootState }
>(
  "brand/getAllBrands",
  async (
    { page = 1, perPage = 10, isInfiniteScroll = false },
    { rejectWithValue, getState }
  ) => {
    try {
      const currentState = getState().brand;
      if (currentState.loadedPages.includes(page)) {
        console.log("data already loaded for page brand", page);
        return null;
      }
      const response = await instanceAxios.get(`/brand`, {
        params: { page, perPage },
        headers: getHeaders(),
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
        page,
        meta: { arg: { page, isInfiniteScroll } },
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.log("error fetching data", error);
      return rejectWithValue(
        axiosError.response?.data || {
          message: "Terjadi kesalahan saat mengambil data",
        }
      );
    }
  }
);

// GET Brands with Filters
export const getBrandsWithFilters = createAsyncThunk<
  BrandResponse,
  GetBrandsParams,
  { rejectValue: ErrorResponse; state: RootState }
>(
  "brand/getBrandsWithFilters",
  async (
    { page = 1, perPage = 10, isInfiniteScroll = false, ...filters },
    { rejectWithValue }
  ) => {
    try {
      const response = await instanceAxios.get(`/brand/paged`, {
        params: { page, perPage, ...filters },
        headers: getHeaders(),
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
        page,
        meta: { arg: { page, isInfiniteScroll } },
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.log("error fetching data", error);
      return rejectWithValue(
        axiosError.response?.data || {
          message: "Terjadi kesalahan saat mengambil data",
        }
      );
    }
  }
);

// GET Brands for Table (with all filters)
export const getBrandsForTable = createAsyncThunk<
  BrandResponse,
  GetBrandsParams,
  { rejectValue: ErrorResponse }
>(
  "brand/getBrandsForTable",
  async ({ isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/brand/paged`, {
        params: filters,
        headers: getHeaders(),
      });

      console.log("Response API Brand (Filtered):", response.data);

      return {
        ...response.data,
        meta: {
          arg: {
            page: filters.page,
            isInfiniteScroll,
          },
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 404) {
        return rejectWithValue({
          message: "Tidak ada data yang tersedia",
          data: [],
        });
      }
      return rejectWithValue(
        axiosError.response?.data || {
          message: "Terjadi kesalahan saat mengambil data",
        }
      );
    }
  }
);

// GET Brands for Select (dropdown/autocomplete)
export const getBrandsForSelect = createAsyncThunk<
  BrandResponse,
  GetBrandsParams,
  { rejectValue: ErrorResponse }
>(
  "brand/getBrandsForSelect",
  async ({ isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/brand/paged`, {
        params: filters,
        headers: getHeaders(),
      });

      console.log("Response API Brand for Select:", response.data);

      return {
        ...response.data,
        meta: {
          arg: {
            page: filters.page,
            isInfiniteScroll,
          },
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.status === 404) {
        return rejectWithValue({
          message: "Tidak ada data yang tersedia",
          data: [],
        });
      }
      return rejectWithValue(
        axiosError.response?.data || {
          message: "Terjadi kesalahan saat mengambil data",
        }
      );
    }
  }
);

// GET Brand by ID
export const getBrandById = createAsyncThunk<
  Brand,
  string | number,
  { rejectValue: string }
>("brand/getBrandById", async (id, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.get(`/brand/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Terjadi kesalahan"
    );
  }
});

// POST Create Brand
export const createBrand = createAsyncThunk<
  Brand,
  any,
  { rejectValue: string }
>("brand/createBrand", async (brandData, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.post("/brand", brandData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Terjadi kesalahan"
    );
  }
});

// PUT Update Brand
export const updateBrand = createAsyncThunk<
  Brand,
  UpdateBrandPayload,
  { rejectValue: string }
>("brand/updateBrand", async ({ id, brandData }, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.put(`/brand/${id}`, brandData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Terjadi kesalahan"
    );
  }
});

// DELETE Brand
export const deleteBrand = createAsyncThunk<
  { id: string | number },
  string | number,
  { rejectValue: string }
>("brand/deleteBrand", async (id, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.delete(`/brand/${id}`, {
      headers: getHeaders(),
    });
    return { id, ...response.data };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Terjadi kesalahan"
    );
  }
});

const initialState: BrandState = {
  data: [],
  loadedPages: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  selectedBrand: null,
  success: false,
};

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedBrand: (state) => {
      state.selectedBrand = null;
    },
    resetDataBrand: (state) => {
      state.data = [];
      state.loading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET All Brands
      .addCase(getAllBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllBrands.fulfilled,
        (state, action: PayloadAction<BrandResponse | null>) => {
          if (action.payload === null) return;
          state.loading = false;
          state.data = action.payload.data;
          state.totalItems = action.payload.pagination?.totalRecords || 0;
          state.totalPages = action.payload.pagination?.totalPages || 1;
          state.currentPage = action.payload.page || 1;
          state.loadedPages = action.payload.meta?.arg?.isInfiniteScroll
            ? state.loadedPages.concat(action.payload.page || 1)
            : [action.payload.page || 1];
          state.error = null;
        }
      )
      .addCase(getAllBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET Brands with Filters
      .addCase(getBrandsWithFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getBrandsWithFilters.fulfilled,
        (state, action: PayloadAction<BrandResponse>) => {
          state.loading = false;
          state.data = action.payload.data;
          state.totalItems = action.payload.pagination?.totalRecords || 0;
          state.totalPages = action.payload.pagination?.totalPages || 1;
          state.currentPage = action.payload.page || 1;
          state.loadedPages = action.payload.meta?.arg?.isInfiniteScroll
            ? state.loadedPages.concat(action.payload.page || 1)
            : [action.payload.page || 1];
          state.error = null;
        }
      )
      .addCase(getBrandsWithFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET Brands for Select
      .addCase(getBrandsForSelect.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const isInfiniteScroll = action.meta.arg?.isInfiniteScroll;

        if (!isInfiniteScroll) {
          state.loadedPages = [];
        }
      })
      .addCase(
        getBrandsForSelect.fulfilled,
        (state, action: PayloadAction<BrandResponse>) => {
          state.loading = false;

          const isInfiniteScroll =
            action.payload.meta?.arg?.isInfiniteScroll || false;
          const currentPageFromArg = action.payload.meta?.arg?.page || 1;

          if (!isInfiniteScroll) {
            state.data = action.payload.data || [];
            state.loadedPages = [currentPageFromArg];
          } else {
            const existingIds = new Set(
              state.data.map((item: Brand) => item.id)
            );
            const newItems = (action.payload.data || []).filter(
              (item: Brand) => !existingIds.has(item.id)
            );

            state.data = [...state.data, ...newItems];

            if (!state.loadedPages.includes(currentPageFromArg)) {
              state.loadedPages.push(currentPageFromArg);
            }
          }

          state.totalItems = action.payload.pagination?.totalRecords || 0;
          state.totalPages = action.payload.pagination?.totalPages || 1;
          state.currentPage = currentPageFromArg;
        }
      )
      .addCase(getBrandsForSelect.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.payload?.message || "Gagal mengambil data";
      })

      // GET Brands for Table
      .addCase(getBrandsForTable.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const isInfiniteScroll = action.meta.arg?.isInfiniteScroll;

        if (!isInfiniteScroll) {
          state.loadedPages = [];
        }
      })
      .addCase(
        getBrandsForTable.fulfilled,
        (state, action: PayloadAction<BrandResponse>) => {
          state.loading = false;

          const isInfiniteScroll =
            action.payload.meta?.arg?.isInfiniteScroll || false;
          const currentPageFromArg = action.payload.meta?.arg?.page || 1;

          if (!isInfiniteScroll) {
            state.data = action.payload.data || [];
            state.loadedPages = [currentPageFromArg];
          } else {
            const existingIds = new Set(
              state.data.map((item: Brand) => item.id)
            );
            const newItems = (action.payload.data || []).filter(
              (item: Brand) => !existingIds.has(item.id)
            );

            state.data = [...state.data, ...newItems];

            if (!state.loadedPages.includes(currentPageFromArg)) {
              state.loadedPages.push(currentPageFromArg);
            }
          }

          state.totalItems = action.payload.pagination?.totalRecords || 0;
          state.totalPages = action.payload.pagination?.totalPages || 1;
          state.currentPage = currentPageFromArg;
        }
      )
      .addCase(getBrandsForTable.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.payload?.message || "Gagal mengambil data";
      })

      // GET Brand by ID
      .addCase(getBrandById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getBrandById.fulfilled,
        (state, action: PayloadAction<Brand>) => {
          state.loading = false;
          state.selectedBrand = action.payload;
        }
      )
      .addCase(getBrandById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
      })

      // POST Create Brand
      .addCase(createBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
        state.loading = false;
        state.data.push(action.payload);
        state.success = true;
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // PUT Update Brand
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
        state.loading = false;
        const index = state.data.findIndex(
          (brand) => brand.id === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // DELETE Brand
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        deleteBrand.fulfilled,
        (state, action: PayloadAction<{ id: string | number }>) => {
          state.loading = false;
          state.data = state.data.filter(
            (brand) => brand.id !== action.payload.id
          );
          state.success = true;
        }
      )
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedBrand, resetDataBrand } =
  brandSlice.actions;
export default brandSlice.reducer;
