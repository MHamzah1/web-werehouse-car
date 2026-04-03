import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slice/authSlice";
import brandSlice from "./slice/brand/brandSlice";
import userSlice from "./slice/user/userSlice";
import CarModelsSlice from "./slice/car-models/CarModelsSlice";
import variantSlice from "./slice/variant/variantSlice";
import yearPriceSlice from "./slice/year-price/yearPriceSlice";
import warehouseSlice from "./slice/warehouse/warehouseSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    Users: userSlice,
    brand: brandSlice,
    CarModels: CarModelsSlice,
    variant: variantSlice,
    yearPrice: yearPriceSlice,
    warehouse: warehouseSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
