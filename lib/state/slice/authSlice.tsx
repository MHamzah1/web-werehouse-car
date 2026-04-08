import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance/instanceAxios";
import { getHeaders } from "@/lib/headers/headers";
import Cookies from "js-cookie";
import { AxiosError } from "axios";

// Types
interface RolePositionInfo {
  id: string;
  name: string; // e.g., "Kepala Inspeksi"
  roleUser: {
    id: string;
    name: string; // e.g., "inspector"
  };
}

interface UserInfo {
  id: string | null;
  email: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  location: string | null;
  role: string | null; // = rolePosition.roleUser.name (atau legacy role string)
  rolePosition: RolePositionInfo | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  userInfo: UserInfo;
  isLoggedIn: boolean;
}

interface LoginPayload {
  email: string;
  password: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface ProfileResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  whatsappNumber: string | null;
  location: string | null;
  role: string | null;
  rolePosition: RolePositionInfo | null;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  message?: string;
  data?: {
    message?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Helper cookie functions
const setToken = (accessToken: string, refreshToken: string | null): void => {
  if (typeof window === "undefined") return;
  Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 hari
  if (refreshToken) {
    Cookies.set("refreshToken", refreshToken, { expires: 365 }); // 1 tahun
  }
};

const removeToken = (): void => {
  if (typeof window === "undefined") return;
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
};

const setUserInfo = (userInfo: UserInfo): void => {
  if (typeof window === "undefined") return;
  Cookies.set("userId", userInfo.id || "");
  Cookies.set("email", userInfo.email || "");
  Cookies.set("fullName", userInfo.fullName || "");
  Cookies.set("phoneNumber", userInfo.phoneNumber || "");
  Cookies.set("whatsappNumber", userInfo.whatsappNumber || "");
  Cookies.set("location", userInfo.location || "");
  Cookies.set("role", userInfo.role || "");
  Cookies.set("rolePositionName", userInfo.rolePosition?.name || "");
  Cookies.set("roleUserName", userInfo.rolePosition?.roleUser?.name || userInfo.role || "");
  Cookies.set("createdAt", userInfo.createdAt || "");
  Cookies.set("updatedAt", userInfo.updatedAt || "");
};

const removeUserInfo = (): void => {
  if (typeof window === "undefined") return;
  Cookies.remove("userId");
  Cookies.remove("email");
  Cookies.remove("fullName");
  Cookies.remove("phoneNumber");
  Cookies.remove("whatsappNumber");
  Cookies.remove("location");
  Cookies.remove("role");
  Cookies.remove("rolePositionName");
  Cookies.remove("roleUserName");
  Cookies.remove("createdAt");
  Cookies.remove("updatedAt");
};

// Fetch User Profile
export const fetchUserProfile = createAsyncThunk<
  UserInfo,
  void,
  { rejectValue: string }
>("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/auth/profile", {
      headers: getHeaders(),
    });

    const data: ProfileResponse = response.data;

    const userInfo: UserInfo = {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      whatsappNumber: data.whatsappNumber,
      location: data.location,
      role: data.rolePosition?.roleUser?.name ?? data.role ?? null,
      rolePosition: data.rolePosition ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    // Simpan ke cookies
    setUserInfo(userInfo);

    return userInfo;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Gagal mengambil profil user";
    return rejectWithValue(message);
  }
});

// Login User
export const LoginUser = createAsyncThunk<
  { accessToken: string; refreshToken: string },
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (data, { rejectWithValue, dispatch }) => {
  try {
    const response = await axiosInstance.post("/auth/login", data);
    const payload = response.data?.data ?? response.data;

    const accessToken = payload?.accessToken || payload?.access_token || null;
    const refreshToken =
      payload?.refreshToken || payload?.refresh_token || null;

    if (!accessToken) {
      return rejectWithValue("Server tidak mengembalikan access token.");
    }

    // Simpan token dulu
    setToken(accessToken, refreshToken);

    // Setelah token tersimpan, fetch user profile
    await dispatch(fetchUserProfile());

    return { accessToken, refreshToken };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const message =
      axiosError.response?.data?.message || axiosError.message || "Login gagal";
    return rejectWithValue(message);
  }
});

// Logout User
export const LogoutUser = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // Kalau ada endpoint logout:
    // await axiosInstance.post("/auth/logout", {}, { headers: getHeaders() });
    removeToken();
    removeUserInfo();
    return true;
  } catch (error) {
    removeToken();
    removeUserInfo();
    const axiosError = error as AxiosError<ErrorResponse>;
    return rejectWithValue(axiosError.message || "Logout gagal");
  }
});

const initialState: AuthState = {
  accessToken:
    typeof window !== "undefined" ? Cookies.get("accessToken") || null : null,
  refreshToken:
    typeof window !== "undefined" ? Cookies.get("refreshToken") || null : null,
  loading: false,
  error: null,
  userInfo: {
    id: typeof window !== "undefined" ? Cookies.get("userId") || null : null,
    email: typeof window !== "undefined" ? Cookies.get("email") || null : null,
    fullName:
      typeof window !== "undefined" ? Cookies.get("fullName") || null : null,
    phoneNumber:
      typeof window !== "undefined" ? Cookies.get("phoneNumber") || null : null,
    whatsappNumber:
      typeof window !== "undefined"
        ? Cookies.get("whatsappNumber") || null
        : null,
    location:
      typeof window !== "undefined" ? Cookies.get("location") || null : null,
    role:
      typeof window !== "undefined" ? Cookies.get("role") || null : null,
    rolePosition: (() => {
      if (typeof window === "undefined") return null;
      const rolePositionName = Cookies.get("rolePositionName");
      const roleUserName = Cookies.get("roleUserName");
      if (!rolePositionName || !roleUserName) return null;
      return {
        id: "",
        name: rolePositionName,
        roleUser: { id: "", name: roleUserName },
      };
    })(),
    createdAt:
      typeof window !== "undefined" ? Cookies.get("createdAt") || null : null,
    updatedAt:
      typeof window !== "undefined" ? Cookies.get("updatedAt") || null : null,
  },
  isLoggedIn:
    typeof window !== "undefined" ? !!Cookies.get("accessToken") : false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userInfo = {
        id: null,
        email: null,
        fullName: null,
        phoneNumber: null,
        whatsappNumber: null,
        location: null,
        role: null,
        rolePosition: null,
        createdAt: null,
        updatedAt: null,
      };
      state.isLoggedIn = false;
      removeToken();
      removeUserInfo();
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(LoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(LoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isLoggedIn = true;
        state.error = null;
        // userInfo akan di-set oleh fetchUserProfile
      })
      .addCase(LoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login gagal";
        state.isLoggedIn = false;
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal mengambil profil";
        // Jika gagal fetch profile, logout user
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoggedIn = false;
        removeToken();
        removeUserInfo();
      })

      // Logout User
      .addCase(LogoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(LogoutUser.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.userInfo = {
          id: null,
          email: null,
          fullName: null,
          phoneNumber: null,
          whatsappNumber: null,
          location: null,
          role: null,
          createdAt: null,
          updatedAt: null,
        };
        state.isLoggedIn = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(LogoutUser.rejected, (state, action) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.userInfo = {
          id: null,
          email: null,
          fullName: null,
          phoneNumber: null,
          whatsappNumber: null,
          location: null,
          role: null,
          createdAt: null,
          updatedAt: null,
        };
        state.isLoggedIn = false;
        state.loading = false;
        state.error = action.payload || "Logout gagal";
      });
  },
});

export const { clearAuth, setAuthError, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
