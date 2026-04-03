"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  getAllYearPrices,
  deleteYearPrice,
  clearSuccess,
  clearError,
} from "@/lib/state/slice/year-price/yearPriceSlice";
import { YearPrice } from "@/lib/state/slice/year-price/yearPriceSlice";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { showAlert } from "@/components/feature/alert/alert";
import { encryptSlug } from "@/lib/slug/slug";
import Swal from "sweetalert2";
import DataTable, { Column } from "@/components/feature/table/data-table";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const YearPriceTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data, loading, error, success, totalPages, totalItems, currentPage } =
    useSelector((state: RootState) => state.yearPrice);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(
    (page: number = 1, search: string = "") => {
      dispatch(getAllYearPrices({ page, perPage: 10, search }));
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
    router.push(`/MasterData/YearPrice/Edit/${encryptedSlug}`);
  };

  const handleDelete = async (id: string, year: number) => {
    const result = await Swal.fire({
      title: "Hapus Year Price?",
      text: `Apakah Anda yakin ingin menghapus harga tahun ${year}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      dispatch(deleteYearPrice(id));
    }
  };

  const columns: Column<YearPrice>[] = [
    {
      key: "year",
      header: "Tahun",
      render: (item: YearPrice) => (
        <span className="font-mono text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
          {item.year}
        </span>
      ),
    },
    {
      key: "variant",
      header: "Variant",
      render: (item: YearPrice) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {(item as any).variant?.variantName || "-"}
          </p>
          <p className="text-xs text-slate-500">
            {(item as any).variant?.model?.brand?.name} {(item as any).variant?.model?.modelName}
          </p>
        </div>
      ),
    },
    {
      key: "basePrice",
      header: "Harga Dasar",
      render: (item: YearPrice) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(Number(item.basePrice))}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (item: YearPrice) => (
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
    {
      key: "updatedAt",
      header: "Terakhir Update",
      render: (item: YearPrice) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
  ];

  const renderActions = (item: YearPrice) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEdit(item.id)}
        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors dark:hover:bg-blue-900"
        title="Edit"
      >
        <FiEdit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(item.id, item.year)}
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
            Year Price
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Kelola harga dasar per variant per tahun
          </p>
        </div>
        <button
          onClick={() => router.push("/MasterData/YearPrice/Add")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
          Tambah Year Price
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari year price..."
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
          emptyMessage="Tidak ada data year price"
        />
      </div>
    </div>
  );
};

export default YearPriceTable;
