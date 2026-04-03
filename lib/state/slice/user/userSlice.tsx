import instanceAxios from "@/lib/axiosInstance/instanceAxios";
import { getHeaders } from "@/lib/headers/headers";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

// Types
export interface Users {
  id: string | number;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  whatsappNumber?: string | null;
  location?: string | null;
  bio?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
  role?: string | null;
  rolePositionId?: string | null;
  rolePosition?: {
    id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    roleUserId?: string;
    roleUser?: {
      id: string;
      name: string;
    };
  } | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface Pagination {
  totalRecords?: number;
  totalPages?: number;
  currentPage?: number;
}

interface UsersResponse {
  data: Users[];
  pagination?: Pagination;
  page?: number;
  meta?: {
    arg?: {
      page?: number;
      isInfiniteScroll?: boolean;
    };
  };
}

interface Userstate {
  data: Users[];
  loadedPages: number[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  selectedUsers: Users | null;
  success: boolean;
}

interface GetUsersParams {
  page?: number;
  perPage?: number;
  isInfiniteScroll?: boolean;
  [key: string]: any;
}

interface UpdateUsersPayload {
  id: string | number;
  UsersData: any;
}

interface ErrorResponse {
  message?: string;
  data?: any[];
  [key: string]: any;
}

interface RootState {
  Users: Userstate;
}

// GET All Users (basic)
export const getAllUsers = createAsyncThunk<
  UsersResponse | null,
  GetUsersParams,
  { rejectValue: ErrorResponse; state: RootState }
>(
  "Users/getAllUsers",
  async (
    { page = 1, perPage = 10, search, isInfiniteScroll = false },
    { rejectWithValue }
  ) => {
    try {
      const params: any = { page, perPage };
      if (search) params.search = search;

      const response = await instanceAxios.get(`/users`, {
        params,
        headers: getHeaders(),
      });

      const res = response.data;
      return {
        data: res.data,
        pagination: {
          totalRecords: res.total,
          totalPages: res.lastPage,
          currentPage: res.page,
        },
        page: res.page,
        meta: { arg: { page: res.page, isInfiniteScroll } },
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

// GET Users with Filters
export const getUsersWithFilters = createAsyncThunk<
  UsersResponse,
  GetUsersParams,
  { rejectValue: ErrorResponse; state: RootState }
>(
  "Users/getUsersWithFilters",
  async (
    { page = 1, perPage = 10, isInfiniteScroll = false, ...filters },
    { rejectWithValue }
  ) => {
    try {
      const response = await instanceAxios.get(`/users/paged`, {
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

// GET Users for Table (with all filters)
export const getUsersForTable = createAsyncThunk<
  UsersResponse,
  GetUsersParams,
  { rejectValue: ErrorResponse }
>(
  "Users/getUsersForTable",
  async ({ isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/users/paged`, {
        params: filters,
        headers: getHeaders(),
      });

      console.log("Response API Users (Filtered):", response.data);

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

// GET Users for Select (dropdown/autocomplete)
export const getUsersForSelect = createAsyncThunk<
  UsersResponse,
  GetUsersParams,
  { rejectValue: ErrorResponse }
>(
  "Users/getUsersForSelect",
  async ({ isInfiniteScroll = false, ...filters }, { rejectWithValue }) => {
    try {
      const response = await instanceAxios.get(`/users/paged`, {
        params: filters,
        headers: getHeaders(),
      });

      console.log("Response API Users for Select:", response.data);

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

// GET Users by ID
export const getUsersById = createAsyncThunk<
  Users,
  string | number,
  { rejectValue: string }
>("Users/getUsersById", async (id, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.get(`/users/${id}`, {
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

// POST Create Users
export const createUsers = createAsyncThunk<
  Users,
  any,
  { rejectValue: string }
>("Users/createUsers", async (UsersData, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.post("/users/register", UsersData, {
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

// PUT Update Users
export const updateUsers = createAsyncThunk<
  Users,
  UpdateUsersPayload,
  { rejectValue: string }
>("Users/updateUsers", async ({ id, UsersData }, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.put(`/users/${id}`, UsersData, {
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

// DELETE Users
export const deleteUsers = createAsyncThunk<
  { id: string | number },
  string | number,
  { rejectValue: string }
>("Users/deleteUsers", async (id, { rejectWithValue }) => {
  try {
    const response = await instanceAxios.delete(`/users/${id}`, {
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

const initialState: Userstate = {
  data: [],
  loadedPages: [],
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  selectedUsers: null,
  success: false,
};

const Userslice = createSlice({
  name: "Users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearSelectedUsers: (state) => {
      state.selectedUsers = null;
    },
    resetDataUsers: (state) => {
      state.data = [];
      state.loading = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllUsers.fulfilled,
        (state, action: PayloadAction<UsersResponse | null>) => {
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
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET Users with Filters
      .addCase(getUsersWithFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUsersWithFilters.fulfilled,
        (state, action: PayloadAction<UsersResponse>) => {
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
      .addCase(getUsersWithFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Terjadi kesalahan";
      })

      // GET Users for Select
      .addCase(getUsersForSelect.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const isInfiniteScroll = action.meta.arg?.isInfiniteScroll;

        if (!isInfiniteScroll) {
          state.loadedPages = [];
        }
      })
      .addCase(
        getUsersForSelect.fulfilled,
        (state, action: PayloadAction<UsersResponse>) => {
          state.loading = false;

          const isInfiniteScroll =
            action.payload.meta?.arg?.isInfiniteScroll || false;
          const currentPageFromArg = action.payload.meta?.arg?.page || 1;

          if (!isInfiniteScroll) {
            state.data = action.payload.data || [];
            state.loadedPages = [currentPageFromArg];
          } else {
            const existingIds = new Set(
              state.data.map((item: Users) => item.id)
            );
            const newItems = (action.payload.data || []).filter(
              (item: Users) => !existingIds.has(item.id)
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
      .addCase(getUsersForSelect.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.payload?.message || "Gagal mengambil data";
      })

      // GET Users for Table
      .addCase(getUsersForTable.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const isInfiniteScroll = action.meta.arg?.isInfiniteScroll;

        if (!isInfiniteScroll) {
          state.loadedPages = [];
        }
      })
      .addCase(
        getUsersForTable.fulfilled,
        (state, action: PayloadAction<UsersResponse>) => {
          state.loading = false;

          const isInfiniteScroll =
            action.payload.meta?.arg?.isInfiniteScroll || false;
          const currentPageFromArg = action.payload.meta?.arg?.page || 1;

          if (!isInfiniteScroll) {
            state.data = action.payload.data || [];
            state.loadedPages = [currentPageFromArg];
          } else {
            const existingIds = new Set(
              state.data.map((item: Users) => item.id)
            );
            const newItems = (action.payload.data || []).filter(
              (item: Users) => !existingIds.has(item.id)
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
      .addCase(getUsersForTable.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.payload?.message || "Gagal mengambil data";
      })

      // GET Users by ID
      .addCase(getUsersById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUsersById.fulfilled,
        (state, action: PayloadAction<Users>) => {
          state.loading = false;
          state.selectedUsers = action.payload;
        }
      )
      .addCase(getUsersById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
      })

      // POST Create Users
      .addCase(createUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUsers.fulfilled, (state, action: PayloadAction<Users>) => {
        state.loading = false;
        state.data.push(action.payload);
        state.success = true;
      })
      .addCase(createUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // PUT Update Users
      .addCase(updateUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUsers.fulfilled, (state, action: PayloadAction<Users>) => {
        state.loading = false;
        const index = state.data.findIndex(
          (Users) => Users.id === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      })

      // DELETE Users
      .addCase(deleteUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        deleteUsers.fulfilled,
        (state, action: PayloadAction<{ id: string | number }>) => {
          state.loading = false;
          state.data = state.data.filter(
            (Users) => Users.id !== action.payload.id
          );
          state.success = true;
        }
      )
      .addCase(deleteUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Terjadi kesalahan";
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, clearSelectedUsers, resetDataUsers } =
  Userslice.actions;
export default Userslice.reducer;
