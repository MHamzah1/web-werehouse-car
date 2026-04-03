"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  getCarModelsForSelect,
  deleteCarModels,
  clearSuccess,
  clearError,
} from "@/lib/state/slice/car-models/CarModelsSlice";
import { CarModels } from "@/lib/state/slice/car-models/CarModelsSlice";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { showAlert } from "@/components/feature/alert/alert";
import { encryptSlug } from "@/lib/slug/slug";
import Swal from "sweetalert2";
import DataTable, { Column } from "@/components/feature/table/data-table";

const CarModelsTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data, loading, error, success, totalPages, totalItems, currentPage } =
    useSelector((state: RootState) => state.CarModels);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(
    (page: number = 1, search: string = "") => {
      dispatch(getCarModelsForSelect({ page, perPage: 10, search }));
    },
    [dispatch]
  );

  useEffect(() => {
    fetchData(1, searchQuery);
  }, [fetchData, searchQuery]);

  useEffect(() => {
    if (success) {
      showAlert({
        icon: "success",
        title: "Berhasil",
        text: "Operasi berhasil dilakukan",
      });
      dispatch(clearSuccess());
      fetchData(currentPage, searchQuery);
    }
    if (error) {
      showAlert({ icon: "error", title: "Error", text: error });
      dispatch(clearError());
    }
  }, [success, error, dispatch, fetchData, currentPage, searchQuery]);

  const handleEdit = (id: string) => {
    const encryptedSlug = encryptSlug(id);
    router.push(`/MasterData/CarModel/Edit/${encryptedSlug}`);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Hapus Car Model?",
      text: `Apakah Anda yakin ingin menghapus model "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      dispatch(deleteCarModels(id));
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return "-";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const columns: Column<CarModels>[] = [
    {
      key: "modelName",
      header: "Model",
      render: (item: CarModels) => (
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.modelName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
              N/A
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{item.modelName}</p>
            <p className="text-xs text-slate-500">{item.brand?.name || "-"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Deskripsi",
      render: (item: CarModels) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {item.description || "-"}
        </span>
      ),
    },
    {
      key: "basePrice",
      header: "Harga Dasar",
      render: (item: CarModels) => (
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {formatCurrency(item.basePrice)}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (item: CarModels) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {item.isActive ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
  ];

  const renderActions = (item: CarModels) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEdit(item.id)}
        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors dark:hover:bg-blue-900"
        title="Edit"
      >
        <FiEdit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(item.id, item.modelName)}
        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors dark:hover:bg-red-900"
        title="Hapus"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Data Car Model
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Kelola semua model mobil yang tersedia
          </p>
        </div>
        <button
          onClick={() => router.push("/MasterData/CarModel/Add")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
          Tambah Model
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems || data.length}
          pageSize={10}
          onPageChange={(page) => fetchData(page, searchQuery)}
          actions={renderActions}
          emptyMessage="Tidak ada data car model"
        />
      </div>
    </div>
  );
};

export default CarModelsTable;
