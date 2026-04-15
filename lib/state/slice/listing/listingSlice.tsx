/* eslint-disable @typescript-eslint/no-explicit-any */
import instanceAxios from "@/lib/axiosInstance/instanceAxios";
import { getHeaders } from "@/lib/headers/headers";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ListingStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "SOLD";

export interface VehicleListing {
  id: string;
  vehicleId: string;
  status: ListingStatus;
  listingTitle: string;
  askingPrice: number;
  isNegotiable: boolean;
  description?: string;
  highlights?: string[];
  videoUrl?: string;
  contactName?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  publishedById?: string;
  publishedAt?: string;
  unpublishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: string;
    brandName: string;
    modelName: string;
    year: number;
    color?: string;
    mileage?: number;
    transmission?: string;
    fuelType?: string;
    condition?: string;
    taxStatus?: string;
    locationCity?: string;
    locationProvince?: string;
    images?: string[];
    status: string;
    showroom?: { id: string; name: string; city: string };
  };
}

export interface CreateListingPayload {
  listingTitle: string;
  askingPrice: number;
  isNegotiable?: boolean;
  description?: string;
  highlights?: string[];
  videoUrl?: string;
  contactName?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface ListingState {
  listings: VehicleListing[];
  selectedListing: VehicleListing | null;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

// Admin: Get all listings
export const fetchAllListings = createAsyncThunk<
  { data: VehicleListing[]; pagination: Pagination },
  { page?: number; limit?: number; search?: string },
  { rejectValue: ErrorResponse }
>("listing/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const res = await instanceAxios.get("/warehouse/listings", {
      params,
      headers: getHeaders(),
    });
    return res.data;
  } catch (e) {
    const err = e as AxiosError<ErrorResponse>;
    return rejectWithValue(err.response?.data || { message: "Terjadi kesalahan" });
  }
});

// Admin: Get listing by vehicleId
export const fetchListingByVehicleId = createAsyncThunk<
  VehicleListing,
  string,
  { rejectValue: ErrorResponse }
>("listing/fetchByVehicleId", async (vehicleId, { rejectWithValue }) => {
  try {
    const res = await instanceAxios.get(`/warehouse/listings/vehicle/${vehicleId}`, {
      headers: getHeaders(),
    });
    return res.data;
  } catch (e) {
    const err = e as AxiosError<ErrorResponse>;
    return rejectWithValue(err.response?.data || { message: "Listing tidak ditemukan" });
  }
});

// Admin: Publish kendaraan
export const publishVehicle = createAsyncThunk<
  { message: string; data: VehicleListing },
  { vehicleId: string; payload: CreateListingPayload },
  { rejectValue: ErrorResponse }
>("listing/publish", async ({ vehicleId, payload }, { rejectWithValue }) => {
  try {
    const res = await instanceAxios.post(
      `/warehouse/listings/vehicle/${vehicleId}/publish`,
      payload,
      { headers: getHeaders() },
    );
    return res.data;
  } catch (e) {
    const err = e as AxiosError<ErrorResponse>;
    return rejectWithValue(err.response?.data || { message: "Gagal mempublish kendaraan" });
  }
});

// Admin: Update listing
export const updateListing = createAsyncThunk<
  { message: string; data: VehicleListing },
  { vehicleId: string; payload: Partial<CreateListingPayload> },
  { rejectValue: ErrorResponse }
>("listing/update", async ({ vehicleId, payload }, { rejectWithValue }) => {
  try {
    const res = await instanceAxios.put(
      `/warehouse/listings/vehicle/${vehicleId}`,
      payload,
      { headers: getHeaders() },
    );
    return res.data;
  } catch (e) {
    const err = e as AxiosError<ErrorResponse>;
    return rejectWithValue(err.response?.data || { message: "Gagal mengupdate listing" });
  }
});

// Admin: Unpublish kendaraan
export const unpublishVehicle = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: ErrorResponse }
>("listing/unpublish", async (vehicleId, { rejectWithValue }) => {
  try {
    const res = await instanceAxios.patch(
      `/warehouse/listings/vehicle/${vehicleId}/unpublish`,
      {},
      { headers: getHeaders() },
    );
    return res.data;
  } catch (e) {
    const err = e as AxiosError<ErrorResponse>;
    return rejectWithValue(err.response?.data || { message: "Gagal mengupdate listing" });
  }
});

// Public: Get published listings
export const fetchPublicListings = createAsyncThunk<
  { data: VehicleListing[]; pagination: Pagination },
  {
    page?: number;
    limit?: number;
    showroomId?: string;
    search?: string;
    brandName?: string;
    transmission?: string;
    minPrice?: number;
    maxPrice?: number;
  },
  { rejectValue: ErrorResponse }
>("listing/fetchPublic", async (params, { rejectWithValue }) => {
  try {
    const res = await instanceAxios.get("/public/listings", { params });
    return res.data;
  } catch (e) {
    const err = e as AxiosError<ErrorResponse>;
    return rejectWithValue(err.response?.data || { message: "Terjadi kesalahan" });
  }
});

// Public: Get listing detail
export const fetchPublicListingDetail = createAsyncThunk<
  VehicleListing,
  string,
  { rejectValue: ErrorResponse }
>("listing/fetchPublicDetail", async (id, { rejectWithValue }) => {
  try {
    const res = await instanceAxios.get(`/public/listings/${id}`);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<ErrorResponse>;
    return rejectWithValue(err.response?.data || { message: "Listing tidak ditemukan" });
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState: ListingState = {
  listings: [],
  selectedListing: null,
  pagination: { page: 1, pageSize: 12, totalRecords: 0, totalPages: 1 },
  loading: false,
  error: null,
  success: false,
};

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    clearListingError: (state) => { state.error = null; },
    clearListingSuccess: (state) => { state.success = false; },
    clearSelectedListing: (state) => { state.selectedListing = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllListings
      .addCase(fetchAllListings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Gagal memuat listings";
      })

      // fetchListingByVehicleId
      .addCase(fetchListingByVehicleId.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchListingByVehicleId.fulfilled, (state, action: PayloadAction<VehicleListing>) => {
        state.loading = false;
        state.selectedListing = action.payload;
      })
      .addCase(fetchListingByVehicleId.rejected, (state) => {
        state.loading = false;
        state.selectedListing = null;
      })

      // publishVehicle
      .addCase(publishVehicle.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(publishVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.selectedListing = action.payload.data;
      })
      .addCase(publishVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Gagal mempublish";
        state.success = false;
      })

      // updateListing
      .addCase(updateListing.pending, (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.selectedListing = action.payload.data;
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Gagal mengupdate listing";
        state.success = false;
      })

      // unpublishVehicle
      .addCase(unpublishVehicle.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(unpublishVehicle.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        if (state.selectedListing) {
          state.selectedListing.status = "UNPUBLISHED";
        }
      })
      .addCase(unpublishVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Gagal unpublish";
      })

      // fetchPublicListings
      .addCase(fetchPublicListings.pending, (state) => { state.loading = true; })
      .addCase(fetchPublicListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPublicListings.rejected, (state) => { state.loading = false; })

      // fetchPublicListingDetail
      .addCase(fetchPublicListingDetail.pending, (state) => { state.loading = true; })
      .addCase(fetchPublicListingDetail.fulfilled, (state, action: PayloadAction<VehicleListing>) => {
        state.loading = false;
        state.selectedListing = action.payload;
      })
      .addCase(fetchPublicListingDetail.rejected, (state) => { state.loading = false; });
  },
});

export const { clearListingError, clearListingSuccess, clearSelectedListing } = listingSlice.actions;
export default listingSlice.reducer;
