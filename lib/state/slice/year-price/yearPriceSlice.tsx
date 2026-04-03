/* eslint-disable @typescript-eslint/no-explicit-any */
import instanceAxios from "@/lib/axiosInstance/instanceAxios";
import { getHeaders } from "@/lib/headers/headers";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

// Types
export interface YearPrice {
  id: string;
  variantId: string;
  year: number;
  basePrice: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface YearPriceByVariant {
  variantId: string;
  variantName: string;
  modelName: string;
  brandName: string;
  prices: YearPrice[];
}

interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface YearPriceResponse {
  data: YearPrice[];
  pagination?: Pagination;
  meta?: {
    arg?: {
      page?: number;
      isInfiniteScroll?: boolean;
    };
  };
}

interface YearPriceState {
  data: YearPrice[];
  yearPricesByVariant: YearPriceByVariant | null;
  loadedPages: number[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  selectedYearPrice: YearPrice | null;
  success: boolean;
}

interface GetYearPricesParams {
  page?: number;
  perPage?: number;
  variantId?: string;
  modelId?: string;
  brandId?: string;
  year?: number;
  isInfiniteScroll?: boolean;
  [key: string]: any;
}

interface UpdateYearPricePayload {
  id: string;
  yearPriceData: any;
}

interface BulkCreateYearPricePayload {
  variantId: string;
  prices: { year: number; basePrice: number }[];
}

interface ErrorResponse {
  message?: string;
  data?: any[];
  [key: string]: any;
}

// GET All Year Prices
export const getAllYearPrices = createAsyncThunk<
  YearPriceResponse,
  GetYearPricesParams,
  { rejectValue: ErrorResponse }
>(
  "yearPrice/getAllYearPrices",
  async ({ page = 1, perPage = 10, isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/year-prices`, {
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

// GET Year Prices by Variant ID
export const getYearPricesByVariantId = createAsyncThunk<
  YearPriceByVariant,
  { variantId: string; yearFrom?: number; yearTo?: number },
  { rejectValue: ErrorResponse }
>(
  "yearPrice/getYearPricesByVariantId",
  async ({ variantId, yearFrom, yearTo }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/variants/${variantId}/year-prices`, {
        params: { yearFrom, yearTo },
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data || { message: "Terjadi kesalahan saat mengambil data" }
      );
    }
  }
);

// GET Year Price by ID
export const getYearPriceById = createAsyncThunk<
  YearPrice,
  string,
  { rejectValue: string }
>("yearPrice/getYearPriceById", async (id, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.get(`/year-prices/${id}`, {
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

// POST Create Year Price
export const createYearPrice = createAsyncThunk<
  { message: string; data: YearPrice },
  any,
  { rejectValue: string }
>("yearPrice/createYearPrice", async (yearPriceData, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.post("/year-prices", yearPriceData, {
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

// POST Bulk Create Year Prices
export const bulkCreateYearPrices = createAsyncThunk<
  any,
  BulkCreateYearPricePayload,
  { rejectValue: string }
>("yearPrice/bulkCreateYearPrices", async (payload, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.post("/year-prices/bulk", payload, {
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

// PUT Update Year Price
export const updateYearPrice = createAsyncThunk<
  { message: string; data: YearPrice },
  UpdateYearPricePayload,
  { rejectValue: string }
>("yearPrice/updateYearPrice", async ({ id, yearPriceData }, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.put(`/year-prices/${id}`, yearPriceData, {
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

// DELETE Year Price
export const deleteYearPrice = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("yearPrice/deleteYearPrice", async (id, { rejectWithValue }) => {
  try {
    await instanceAxios.delete(`/year-prices/${id}`, {
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

const initialState: YearPriceState = {
  data: [],
  yearPricesByVariant: null,
  loadedPages: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  selectedYearPrice: null,
  success: false,
};

const yearPriceSlice = createSlice({
  name: "yearPrice",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedYearPrice: (state) => {
      state.selectedYearPrice = null;
    },
    clearYearPricesByVariant: (state) => {
      state.yearPricesByVariant = null;
    },
    resetDataYearPrice: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET All Year Prices
      .addCase(getAllYearPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllYearPrices.fulfilled, (state, action: PayloadAction<YearPriceResponse>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.totalItems = action.payload.pagination?.totalRecords || 0;
        state.totalPages = action.payload.pagination?.totalPages || 1;
        state.currentPage = action.payload.pagination?.page || 1;
      })
      .addCase(getAllYearPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET Year Prices by Variant ID
      .addCase(getYearPricesByVariantId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getYearPricesByVariantId.fulfilled, (state, action: PayloadAction<YearPriceByVariant>) => {
        state.loading = false;
        state.yearPricesByVariant = action.payload;
      })
      .addCase(getYearPricesByVariantId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET Year Price by ID
      .addCase(getYearPriceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getYearPriceById.fulfilled, (state, action: PayloadAction<YearPrice>) => {
        state.loading = false;
        state.selectedYearPrice = action.payload;
      })
      .addCase(getYearPriceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
      })

      // POST Create Year Price
      .addCase(createYearPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createYearPrice.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload.data);
        state.success = true;
      })
      .addCase(createYearPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // POST Bulk Create Year Prices
      .addCase(bulkCreateYearPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bulkCreateYearPrices.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(bulkCreateYearPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // PUT Update Year Price
      .addCase(updateYearPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateYearPrice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((yp) => yp.id === action.payload.data.id);
        if (index !== -1) {
          state.data[index] = action.payload.data;
        }
        state.success = true;
      })
      .addCase(updateYearPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // DELETE Year Price
      .addCase(deleteYearPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteYearPrice.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
        state.loading = false;
        state.data = state.data.filter((yp) => yp.id !== action.payload.id);
        state.success = true;
      })
      .addCase(deleteYearPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  clearSelectedYearPrice, 
  clearYearPricesByVariant, 
  resetDataYearPrice 
} = yearPriceSlice.actions;
export default yearPriceSlice.reducer;
