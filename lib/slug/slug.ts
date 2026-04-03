// ============================================
// Slug Encryption Utility
// ============================================
// File ini digunakan untuk mengenkripsi dan mendekripsi ID
// yang digunakan pada URL slug untuk keamanan
//
// Contoh penggunaan:
// - Enkripsi: encryptSlug("user-id-123") => "dXNlci1pZC0xMjM="
// - Dekripsi: decryptSlug("dXNlci1pZC0xMjM=") => "user-id-123"
//
// Implementasi di Next.js:
// - Route: /User/Edit/[slug]/page.tsx
// - URL: /User/Edit/dXNlci1pZC0xMjM=
// ============================================

// Secret key untuk enkripsi (bisa disesuaikan)
const SECRET_KEY = "MEDIATOR_SECRET_2024";

/**
 * Encode string ke Base64
 */
const toBase64 = (str: string): string => {
  if (typeof window !== "undefined") {
    return btoa(str);
  }
  return Buffer.from(str).toString("base64");
};

/**
 * Decode Base64 ke string
 */
const fromBase64 = (str: string): string => {
  if (typeof window !== "undefined") {
    return atob(str);
  }
  return Buffer.from(str, "base64").toString("utf-8");
};

/**
 * Simple XOR encryption dengan secret key
 */
const xorEncrypt = (text: string, key: string): string => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return result;
};

/**
 * Enkripsi ID menjadi slug yang aman untuk URL
 * @param id - ID yang akan dienkripsi (string atau number)
 * @returns Encrypted slug string
 */
export const encryptSlug = (id: string | number): string => {
  try {
    const idString = String(id);
    // Tambahkan timestamp untuk variasi
    const payload = `${idString}|${Date.now()}`;
    // XOR encrypt
    const encrypted = xorEncrypt(payload, SECRET_KEY);
    // Convert ke Base64 dan buat URL-safe
    const base64 = toBase64(encrypted);
    // Replace karakter yang tidak URL-safe
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch (error) {
    console.error("Error encrypting slug:", error);
    return "";
  }
};

/**
 * Dekripsi slug kembali menjadi ID asli
 * @param slug - Encrypted slug dari URL
 * @returns Original ID string
 */
export const decryptSlug = (slug: string): string => {
  try {
    // Restore Base64 characters
    let base64 = slug.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }
    // Decode Base64
    const encrypted = fromBase64(base64);
    // XOR decrypt
    const decrypted = xorEncrypt(encrypted, SECRET_KEY);
    // Extract ID (remove timestamp)
    const [id] = decrypted.split("|");
    return id;
  } catch (error) {
    console.error("Error decrypting slug:", error);
    return "";
  }
};

/**
 * Validasi apakah slug valid
 * @param slug - Slug yang akan divalidasi
 * @returns boolean
 */
export const isValidSlug = (slug: string): boolean => {
  try {
    const decrypted = decryptSlug(slug);
    return decrypted !== "" && decrypted.length > 0;
  } catch {
    return false;
  }
};

/**
 * Generate URL untuk edit page
 * @param basePath - Base path (contoh: "/User/Edit")
 * @param id - ID yang akan dienkripsi
 * @returns Full URL path
 */
export const generateEditUrl = (
  basePath: string,
  id: string | number,
): string => {
  const encryptedSlug = encryptSlug(id);
  return `${basePath}/${encryptedSlug}`;
};

/**
 * Generate URL dengan query params yang terenkripsi
 * @param basePath - Base path (contoh: "/warehouse/inspections/create")
 * @param params - Object query params { key: value }
 * @returns Full URL path dengan encrypted query params
 */
export const generateUrlWithEncryptedParams = (
  basePath: string,
  params: Record<string, string | number>,
): string => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, encryptSlug(value));
  }
  return `${basePath}?${searchParams.toString()}`;
};

/**
 * Dekripsi query param dari searchParams
 * @param value - Encrypted value dari searchParams
 * @returns Decrypted value
 */
export const decryptQueryParam = (value: string | null): string => {
  if (!value) return "";
  return decryptSlug(value);
};

// ============================================
// Contoh Penggunaan:
// ============================================
//
// Di halaman Table (redirect ke edit):
// import { generateEditUrl } from "@/lib/slug/slug";
//
// const handleEdit = (user: Users) => {
//   const editUrl = generateEditUrl("/User/Edit", user.id);
//   router.push(editUrl);
// };
//
// Di halaman Edit (ambil ID dari slug):
// import { decryptSlug } from "@/lib/slug/slug";
//
// const EditUser = ({ params }: { params: { slug: string } }) => {
//   const userId = decryptSlug(params.slug);
//   // Gunakan userId untuk fetch data
// };
//
// Untuk URL dengan query params:
// import { generateUrlWithEncryptedParams, decryptQueryParam } from "@/lib/slug/slug";
//
// // Generate URL
// const url = generateUrlWithEncryptedParams("/warehouse/inspections/create", { vehicleId: "123" });
// // Result: /warehouse/inspections/create?vehicleId=xyz...
//
// // Read params
// const vehicleId = decryptQueryParam(searchParams.get("vehicleId"));
// ============================================
