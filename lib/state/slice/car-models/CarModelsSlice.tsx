/* eslint-disable @typescript-eslint/no-explicit-any */
import instanceAxios from "@/lib/axiosInstance/instanceAxios";
import { getHeaders } from "@/lib/headers/headers";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

// Types
export interface CarModels {
  id: string;
  brandId: string;
  modelName: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// Updated Pagination interface
interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
interface CarModelsResponse {
  data: CarModels[];
  pagination?: Pagination;
  page?: number;
  meta?: {
    arg?: {
      page?: number;
      isInfiniteScroll?: boolean;
    };
  };
}

interface CarModelstate {
  data: CarModels[];
  loadedPages: number[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  selectedCarModels: CarModels | null;
  success: boolean;
}

interface GetCarModelsParams {
  page?: number;
  perPage?: number;
  isInfiniteScroll?: boolean;
  [key: string]: any;
}

interface UpdateCarModelsPayload {
  id: string | number;
  CarModelsData: any;
}

interface ErrorResponse {
  message?: string;
  data?: any[];
  [key: string]: any;
}

interface RootState {
  CarModels: CarModelstate;
}

// GET CarModels with Filters
export const getCarModelsWithFilters = createAsyncThunk<
  CarModelsResponse,
  GetCarModelsParams,
  { rejectValue: ErrorResponse; state: RootState }
>(
  "CarModels/getCarModelsWithFilters",
  async (
    { page = 1, perPage = 10, isInfiniteScroll = false, ...filters },
    { rejectWithValue }
  ) => {
    try {
      const response = await instanceAxios.get(`/CarModels`, {
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

// GET CarModels for Table (with all filters)
export const getCarModelsForTable = createAsyncThunk<
  CarModelsResponse,
  GetCarModelsParams,
  { rejectValue: ErrorResponse }
>(
  "CarModels/getCarModelsForTable",
  async ({ isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/CarModels`, {
        params: filters,
        headers: getHeaders(),
      });

      console.log("Response API CarModels (Filtered):", response.data);

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

// GET CarModels for Select (dropdown/autocomplete)
export const getCarModelsForSelect = createAsyncThunk<
  CarModelsResponse,
  GetCarModelsParams,
  { rejectValue: ErrorResponse }
>(
  "CarModels/getCarModelsForSelect",
  async ({ isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/CarModels`, {
        params: filters,
        headers: getHeaders(),
      });

      console.log("Response API CarModels for Select:", response.data);

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

// GET CarModels by ID
export const getCarModelsById = createAsyncThunk<
  CarModels,
  string | number,
  { rejectValue: string }
>("CarModels/getCarModelsById", async (id, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.get(`/CarModels/${id}`, {
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

// POST Create CarModels
export const createCarModels = createAsyncThunk<
  CarModels,
  any,
  { rejectValue: string }
>("CarModels/createCarModels", async (CarModelsData, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.post("/CarModels", CarModelsData, {
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

// PUT Update CarModels
export const updateCarModels = createAsyncThunk<
  CarModels,
  UpdateCarModelsPayload,
  { rejectValue: string }
>(
  "CarModels/updateCarModels",
  async ({ id, CarModelsData }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.put(
        `/CarModels/${id}`,
        CarModelsData,
        {
          headers: getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Terjadi kesalahan"
      );
    }
  }
);

// DELETE CarModels
export const deleteCarModels = createAsyncThunk<
  { id: string | number },
  string | number,
  { rejectValue: string }
>("CarModels/deleteCarModels", async (id, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.delete(`/CarModels/${id}`, {
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

const initialState: CarModelstate = {
  data: [],
  loadedPages: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  selectedCarModels: null,
  success: false,
};

const CarModelslice = createSlice({
  name: "CarModels",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedCarModels: (state) => {
      state.selectedCarModels = null;
    },
    resetDataCarModels: (state) => {
      state.data = [];
      state.loading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // GET CarModels with Filters
      .addCase(getCarModelsWithFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCarModelsWithFilters.fulfilled,
        (state, action: PayloadAction<CarModelsResponse>) => {
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
      .addCase(getCarModelsWithFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET CarModels for Select
      .addCase(getCarModelsForSelect.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const isInfiniteScroll = action.meta.arg?.isInfiniteScroll;

        if (!isInfiniteScroll) {
          state.loadedPages = [];
        }
      })
      .addCase(
        getCarModelsForSelect.fulfilled,
        (state, action: PayloadAction<CarModelsResponse>) => {
          state.loading = false;

          const isInfiniteScroll =
            action.payload.meta?.arg?.isInfiniteScroll || false;
          const currentPageFromArg = action.payload.meta?.arg?.page || 1;

          if (!isInfiniteScroll) {
            state.data = action.payload.data || [];
            state.loadedPages = [currentPageFromArg];
          } else {
            const existingIds = new Set(
              state.data.map((item: CarModels) => item.id)
            );
            const newItems = (action.payload.data || []).filter(
              (item: CarModels) => !existingIds.has(item.id)
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
      .addCase(getCarModelsForSelect.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.payload?.message || "Gagal mengambil data";
      })

      // GET CarModels for Table
      .addCase(getCarModelsForTable.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const isInfiniteScroll = action.meta.arg?.isInfiniteScroll;

        if (!isInfiniteScroll) {
          state.loadedPages = [];
        }
      })
      .addCase(
        getCarModelsForTable.fulfilled,
        (state, action: PayloadAction<CarModelsResponse>) => {
          state.loading = false;

          const isInfiniteScroll =
            action.payload.meta?.arg?.isInfiniteScroll || false;
          const currentPageFromArg = action.payload.meta?.arg?.page || 1;

          if (!isInfiniteScroll) {
            state.data = action.payload.data || [];
            state.loadedPages = [currentPageFromArg];
          } else {
            const existingIds = new Set(
              state.data.map((item: CarModels) => item.id)
            );
            const newItems = (action.payload.data || []).filter(
              (item: CarModels) => !existingIds.has(item.id)
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
      .addCase(getCarModelsForTable.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.payload?.message || "Gagal mengambil data";
      })

      // GET CarModels by ID
      .addCase(getCarModelsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getCarModelsById.fulfilled,
        (state, action: PayloadAction<CarModels>) => {
          state.loading = false;
          state.selectedCarModels = action.payload;
        }
      )
      .addCase(getCarModelsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
      })

      // POST Create CarModels
      .addCase(createCarModels.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        createCarModels.fulfilled,
        (state, action: PayloadAction<CarModels>) => {
          state.loading = false;
          state.data.push(action.payload);
          state.success = true;
        }
      )
      .addCase(createCarModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // PUT Update CarModels
      .addCase(updateCarModels.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updateCarModels.fulfilled,
        (state, action: PayloadAction<CarModels>) => {
          state.loading = false;
          const index = state.data.findIndex(
            (CarModels) => CarModels.id === action.payload.id
          );
          if (index !== -1) {
            state.data[index] = action.payload;
          }
          state.success = true;
        }
      )
      .addCase(updateCarModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // DELETE CarModels
      .addCase(deleteCarModels.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        deleteCarModels.fulfilled,
        (state, action: PayloadAction<{ id: string | number }>) => {
          state.loading = false;
          state.data = state.data.filter(
            (CarModels) => CarModels.id !== action.payload.id
          );
          state.success = true;
        }
      )
      .addCase(deleteCarModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  clearSelectedCarModels,
  resetDataCarModels,
} = CarModelslice.actions;
export default CarModelslice.reducer;
