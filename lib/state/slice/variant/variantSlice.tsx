/* eslint-disable @typescript-eslint/no-explicit-any */
import instanceAxios from "@/lib/axiosInstance/instanceAxios";
import { getHeaders } from "@/lib/headers/headers";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

// Types
export interface Variant {
  id: string;
  modelId: string;
  modelName?: string;
  brandName?: string;
  variantName: string;
  variantCode: string;
  description?: string;
  transmissionType: 'matic' | 'manual' | 'both';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface VariantResponse {
  data: Variant[];
  pagination?: Pagination;
  meta?: {
    arg?: {
      page?: number;
      isInfiniteScroll?: boolean;
    };
  };
}

interface VariantState {
  data: Variant[];
  loadedPages: number[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  selectedVariant: Variant | null;
  success: boolean;
}

interface GetVariantsParams {
  page?: number;
  perPage?: number;
  modelId?: string;
  search?: string;
  isActive?: boolean;
  isInfiniteScroll?: boolean;
  [key: string]: any;
}

interface UpdateVariantPayload {
  id: string;
  variantData: any;
}

interface ErrorResponse {
  message?: string;
  data?: any[];
  [key: string]: any;
}

interface RootState {
  variant: VariantState;
}

// GET All Variants
export const getAllVariants = createAsyncThunk<
  VariantResponse,
  GetVariantsParams,
  { rejectValue: ErrorResponse }
>(
  "variant/getAllVariants",
  async ({ page = 1, perPage = 10, isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/variants`, {
        params: { page, perPage, ...filters },
        headers: getHeaders(),
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
        meta: { arg: { page, isInfiniteScroll } },
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Terjadi kesalahan saat mengambil data" }
      );
    }
  }
);

// GET Variants by Model ID
export const getVariantsByModelId = createAsyncThunk<
  VariantResponse,
  { modelId: string } & GetVariantsParams,
  { rejectValue: ErrorResponse }
>(
  "variant/getVariantsByModelId",
  async ({ modelId, page = 1, perPage = 100, isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/car-models/${modelId}/variants`, {
        params: { page, perPage, ...filters },
        headers: getHeaders(),
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
        meta: { arg: { page, isInfiniteScroll } },
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Terjadi kesalahan saat mengambil data" }
      );
    }
  }
);

// GET Variant by ID
export const getVariantById = createAsyncThunk<
  Variant,
  string,
  { rejectValue: string }
>("variant/getVariantById", async (id, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.get(`/variants/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Terjadi kesalahan"
    );
  }
});

// POST Create Variant
export const createVariant = createAsyncThunk<
  { message: string; data: Variant },
  any,
  { rejectValue: string }
>("variant/createVariant", async (variantData, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.post("/variants", variantData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Terjadi kesalahan"
    );
  }
});

// PUT Update Variant
export const updateVariant = createAsyncThunk<
  { message: string; data: Variant },
  UpdateVariantPayload,
  { rejectValue: string }
>("variant/updateVariant", async ({ id, variantData }, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.put(`/variants/${id}`, variantData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Terjadi kesalahan"
    );
  }
});

// DELETE Variant
export const deleteVariant = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("variant/deleteVariant", async (id, { rejectWithValue }) => {
  try {
    await instanceAxios.delete(`/variants/${id}`, {
      headers: getHeaders(),
    });
    return { id };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(
      axiosError.response?.data?.message || "Terjadi kesalahan"
    );
  }
});

const initialState: VariantState = {
  data: [],
  loadedPages: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  selectedVariant: null,
  success: false,
};

const variantSlice = createSlice({
  name: "variant",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedVariant: (state) => {
      state.selectedVariant = null;
    },
    resetDataVariant: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET All Variants
      .addCase(getAllVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllVariants.fulfilled, (state, action: PayloadAction<VariantResponse>) => {
        state.loading = false;
        const isInfiniteScroll = action.payload.meta?.arg?.isInfiniteScroll || false;
        if (!isInfiniteScroll) {
          state.data = action.payload.data || [];
        } else {
          const existingIds = new Set(state.data.map((item) => item.id));
          const newItems = (action.payload.data || []).filter((item) => !existingIds.has(item.id));
          state.data = [...state.data, ...newItems];
        }
        state.totalItems = action.payload.pagination?.totalRecords || 0;
        state.totalPages = action.payload.pagination?.totalPages || 1;
        state.currentPage = action.payload.pagination?.page || 1;
      })
      .addCase(getAllVariants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET Variants by Model ID
      .addCase(getVariantsByModelId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVariantsByModelId.fulfilled, (state, action: PayloadAction<VariantResponse>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalItems = action.payload.pagination?.totalRecords || 0;
        state.totalPages = action.payload.pagination?.totalPages || 1;
      })
      .addCase(getVariantsByModelId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET Variant by ID
      .addCase(getVariantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVariantById.fulfilled, (state, action: PayloadAction<Variant>) => {
        state.loading = false;
        state.selectedVariant = action.payload;
      })
      .addCase(getVariantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
      })

      // POST Create Variant
      .addCase(createVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createVariant.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload.data);
        state.success = true;
      })
      .addCase(createVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // PUT Update Variant
      .addCase(updateVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVariant.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((v) => v.id === action.payload.data.id);
        if (index !== -1) {
          state.data[index] = action.payload.data;
        }
        state.success = true;
      })
      .addCase(updateVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // DELETE Variant
      .addCase(deleteVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteVariant.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
        state.loading = false;
        state.data = state.data.filter((v) => v.id !== action.payload.id);
        state.success = true;
      })
      .addCase(deleteVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedVariant, resetDataVariant } = variantSlice.actions;
export default variantSlice.reducer;
