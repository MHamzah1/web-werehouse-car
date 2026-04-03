"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchShowrooms,
  deleteShowroom,
  searchShowrooms,
  joinShowroom,
  leaveShowroom,
  fetchShowroomMembers,
  addShowroomMember,
  removeShowroomMember,
  clearSuccess,
  clearError,
  Showroom,
  ShowroomMember,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import { getAllUsers } from "@/lib/state/slice/user/userSlice";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiUserPlus,
  FiLogOut,
  FiX,
  FiUsers,
  FiUserMinus,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { useTheme } from "@/context/ThemeContext";
import { encryptSlug } from "@/lib/slug/slug";

const ShowroomList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { showrooms, showroomMembers, loading, error, successMessage } =
    useSelector((state: RootState) => state.warehouse);
  const { userInfo } = useSelector((state: RootState) => state.auth);

  // Resolve role
  const userRole =
    userInfo?.rolePosition?.roleUser?.name ?? userInfo?.role ?? "";
  const canManageMembers = userRole === "admin" || userRole === "showroom_owner";

  // Join modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Showroom[]>([]);
  const [searching, setSearching] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Member modal state
  const [memberModalShowroom, setMemberModalShowroom] =
    useState<Showroom | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [userSearching, setUserSearching] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchShowrooms());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      dispatch(fetchShowrooms());
      // Refresh member list if modal is open
      if (memberModalShowroom) {
        dispatch(fetchShowroomMembers(memberModalShowroom.id));
      }
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, memberModalShowroom]);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Hapus Showroom?",
      text: `Apakah Anda yakin ingin menghapus "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      background: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#1e293b",
    });
    if (result.isConfirmed) dispatch(deleteShowroom(id));
  };

  const handleLeave = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Keluar dari Showroom?",
      text: `Apakah Anda yakin ingin keluar dari "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Keluar",
      cancelButtonText: "Batal",
      background: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#1e293b",
    });
    if (result.isConfirmed) dispatch(leaveShowroom(id));
  };

  const handleSearch = useCallback(
    async (q: string) => {
      setSearchQuery(q);
      if (!q.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await dispatch(searchShowrooms(q)).unwrap();
        setSearchResults(res);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [dispatch],
  );

  const handleJoin = async (showroom: Showroom) => {
    setJoiningId(showroom.id);
    try {
      await dispatch(joinShowroom(showroom.id)).unwrap();
      setShowJoinModal(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch {
      // error handled via redux state
    } finally {
      setJoiningId(null);
    }
  };

  // ---- Member Management ----

  const openMemberModal = (showroom: Showroom) => {
    setMemberModalShowroom(showroom);
    setUserSearchQuery("");
    setUserSearchResults([]);
    dispatch(fetchShowroomMembers(showroom.id));
  };

  const closeMemberModal = () => {
    setMemberModalShowroom(null);
    setUserSearchQuery("");
    setUserSearchResults([]);
  };

  const handleUserSearch = useCallback(
    async (q: string) => {
      setUserSearchQuery(q);
      if (!q.trim()) {
        setUserSearchResults([]);
        return;
      }
      setUserSearching(true);
      try {
        const res = await dispatch(
          getAllUsers({ page: 1, perPage: 10, search: q }),
        ).unwrap();
        setUserSearchResults(res?.data ?? []);
      } catch {
        setUserSearchResults([]);
      } finally {
        setUserSearching(false);
      }
    },
    [dispatch],
  );

  const handleAddMember = async (userId: string) => {
    if (!memberModalShowroom) return;
    setAddingUserId(userId);
    try {
      await dispatch(
        addShowroomMember({ showroomId: memberModalShowroom.id, userId }),
      ).unwrap();
      dispatch(fetchShowroomMembers(memberModalShowroom.id));
      setUserSearchQuery("");
      setUserSearchResults([]);
    } catch {
      // error handled via redux
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!memberModalShowroom) return;
    const result = await Swal.fire({
      title: "Keluarkan Anggota?",
      text: `Apakah Anda yakin ingin mengeluarkan "${memberName}" dari showroom?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Keluarkan",
      cancelButtonText: "Batal",
      background: isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#1e293b",
    });
    if (!result.isConfirmed) return;
    setRemovingMemberId(memberId);
    try {
      await dispatch(
        removeShowroomMember({
          showroomId: memberModalShowroom.id,
          memberId,
        }),
      ).unwrap();
    } catch {
      // error handled via redux
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Showroom
          </h1>
          <p
            className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Kelola data showroom Anda
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
              isDark
                ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <FiUserPlus /> Bergabung
          </button>
          <Link
            href="/warehouse/showrooms/create"
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            <FiPlus /> <span className="hidden sm:inline">Tambah</span> Showroom
          </Link>
        </div>
      </div>

      {loading && !memberModalShowroom ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        </div>
      ) : showrooms.length === 0 ? (
        <div
          className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} rounded-2xl p-12 text-center border`}
        >
          <p
            className={`${isDark ? "text-slate-400" : "text-slate-500"} mb-4`}
          >
            Belum ada showroom. Buat showroom pertama Anda atau bergabung
            dengan yang sudah ada!
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <FiUserPlus /> Bergabung ke Showroom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showrooms.map((s) => {
            const isOwner =
              (s as Showroom & { isOwner?: boolean }).isOwner !== false;
            return (
              <div
                key={s.id}
                className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-5 hover:border-emerald-500/30 transition-all`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3
                      className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                      {s.name}
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {s.code}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {s.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                    {!isOwner && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                        Anggota
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`space-y-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  <div className="flex items-start gap-2">
                    <FiMapPin className="mt-0.5 shrink-0" />
                    <span>
                      {s.address}, {s.city}, {s.province}
                    </span>
                  </div>
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                </div>
                <div
                  className={`flex flex-wrap gap-2 mt-4 pt-4 border-t ${isDark ? "border-slate-700/50" : "border-slate-200"}`}
                >
                  {isOwner ? (
                    <>
                      {canManageMembers && (
                        <button
                          onClick={() => openMemberModal(s)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                            isDark
                              ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                          }`}
                          title="Kelola Anggota"
                        >
                          <FiUsers className="text-base" />
                        </button>
                      )}
                      <Link
                        href={`/warehouse/showrooms/edit/${encryptSlug(s.id)}`}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? "bg-slate-700/50 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
                      >
                        <FiEdit className="text-base" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleLeave(s.id, s.name)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm font-medium transition-colors w-full"
                    >
                      <FiLogOut className="text-base" /> Keluar dari Showroom
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 ${
              isDark ? "bg-slate-800 border border-slate-700" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2
                className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Bergabung ke Showroom
              </h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <FiX />
              </button>
            </div>

            <div className="relative">
              <FiSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari nama atau kode showroom..."
                className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
                autoFocus
              />
            </div>

            <div className="min-h-[120px] max-h-72 overflow-y-auto space-y-2">
              {searching ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <p
                  className={`text-sm text-center py-8 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Showroom tidak ditemukan
                </p>
              ) : searchResults.length === 0 ? (
                <p
                  className={`text-sm text-center py-8 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Ketik nama atau kode showroom untuk mencari
                </p>
              ) : (
                searchResults.map((s) => {
                  const alreadyJoined = showrooms.some((x) => x.id === s.id);
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        isDark
                          ? "border-slate-700 hover:border-slate-600"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <p
                          className={`font-medium text-sm ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {s.name}
                        </p>
                        <p
                          className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {s.code} · {s.city}
                        </p>
                      </div>
                      {alreadyJoined ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                          Bergabung
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoin(s)}
                          disabled={joiningId === s.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {joiningId === s.id ? (
                            <span className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                          ) : (
                            <FiUserPlus />
                          )}
                          Bergabung
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      {memberModalShowroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-5 ${
              isDark ? "bg-slate-800 border border-slate-700" : "bg-white"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Anggota Showroom
                </h2>
                <p
                  className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {memberModalShowroom.name}
                </p>
              </div>
              <button
                onClick={closeMemberModal}
                className={`p-1.5 rounded-lg ${isDark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <FiX />
              </button>
            </div>

            {/* Add Member Section */}
            <div className="space-y-2">
              <label
                className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Tambah Anggota
              </label>
              <div className="relative">
                <FiSearch
                  className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  placeholder="Cari user berdasarkan nama atau email..."
                  className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              {/* User Search Results */}
              {userSearchQuery && (
                <div
                  className={`max-h-40 overflow-y-auto rounded-xl border ${
                    isDark ? "border-slate-700" : "border-slate-200"
                  }`}
                >
                  {userSearching ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" />
                    </div>
                  ) : userSearchResults.length === 0 ? (
                    <p
                      className={`text-xs text-center py-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      User tidak ditemukan
                    </p>
                  ) : (
                    userSearchResults.map((u: any) => {
                      const isMember = showroomMembers.some(
                        (m) => m.user.id === u.id,
                      );
                      const isOwner =
                        u.id === memberModalShowroom.ownerId;
                      return (
                        <div
                          key={u.id}
                          className={`flex items-center justify-between px-3 py-2.5 border-b last:border-b-0 ${
                            isDark
                              ? "border-slate-700 hover:bg-slate-700/50"
                              : "border-slate-100 hover:bg-slate-50"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}
                            >
                              {u.fullName}
                            </p>
                            <p
                              className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              {u.email}
                              {u.rolePosition?.name
                                ? ` · ${u.rolePosition.name}`
                                : ""}
                            </p>
                          </div>
                          {isOwner ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium shrink-0">
                              Owner
                            </span>
                          ) : isMember ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium shrink-0">
                              Anggota
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddMember(u.id)}
                              disabled={addingUserId === u.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                            >
                              {addingUserId === u.id ? (
                                <span className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                              ) : (
                                <FiUserPlus className="text-xs" />
                              )}
                              Tambah
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Member List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Daftar Anggota
                </label>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                >
                  {showroomMembers.length} anggota
                </span>
              </div>
              <div
                className={`max-h-60 overflow-y-auto rounded-xl border ${
                  isDark ? "border-slate-700" : "border-slate-200"
                }`}
              >
                {showroomMembers.length === 0 ? (
                  <p
                    className={`text-sm text-center py-8 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Belum ada anggota
                  </p>
                ) : (
                  showroomMembers.map((m: ShowroomMember) => (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between px-3 py-2.5 border-b last:border-b-0 ${
                        isDark
                          ? "border-slate-700"
                          : "border-slate-100"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {m.user.fullName}
                        </p>
                        <p
                          className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {m.user.email}
                          {m.user.rolePosition?.name
                            ? ` · ${m.user.rolePosition.name}`
                            : ""}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRemoveMember(m.id, m.user.fullName)
                        }
                        disabled={removingMemberId === m.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
                        title="Keluarkan anggota"
                      >
                        {removingMemberId === m.id ? (
                          <span className="animate-spin h-3 w-3 border border-red-400 border-t-transparent rounded-full" />
                        ) : (
                          <FiUserMinus className="text-sm" />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowroomList;
