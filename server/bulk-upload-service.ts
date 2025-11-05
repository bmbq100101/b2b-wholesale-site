import { InsertProduct } from "../drizzle/schema";

export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data?: Record<string, unknown>;
  }>;
  products: Array<{
    id: number;
    name: string;
    sku: string;
  }>;
}

export interface ProductUploadData {
  name: string;
  sku: string;
  category?: string;
  description?: string;
  specifications?: string;
  condition?: string; // A, B, C
  stock?: number;
  basePrice?: number;
  images?: string; // comma-separated URLs
  certifications?: string; // comma-separated
}

/**
 * Parse CSV content and extract product data
 */
export function parseCSVContent(csvContent: string): ProductUploadData[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV file must contain at least a header row and one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const requiredFields = ["name", "sku"];
  const missingFields = requiredFields.filter((f) => !headers.includes(f));

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const products: ProductUploadData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (values.length < headers.length) {
      continue; // Skip incomplete rows
    }

    const product: ProductUploadData = {
      name: "",
      sku: "",
      category: "",
    };

    headers.forEach((header, index) => {
      const value = values[index];
      if (header === "name") product.name = value;
      else if (header === "sku") product.sku = value;
      else if (header === "category") product.category = value;
      else if (header === "description") product.description = value;
      else if (header === "specifications") product.specifications = value;
      else if (header === "condition") product.condition = value;
      else if (header === "stock") product.stock = parseInt(value) || 0;
      else if (header === "baseprice" || header === "price") product.basePrice = parseFloat(value) || 0;
      else if (header === "images") product.images = value;
      else if (header === "certifications") product.certifications = value;
    });

    if (product.name && product.sku) {
      products.push(product);
    }
  }

  return products;
}

/**
 * Validate product data before upload
 */
export function validateProductData(product: ProductUploadData, rowNumber: number): string | null {
  if (!product.name || product.name.trim().length === 0) {
    return `Row ${rowNumber}: Product name is required`;
  }

  if (!product.sku || product.sku.trim().length === 0) {
    return `Row ${rowNumber}: Product SKU is required`;
  }

  if (product.name.length > 255) {
    return `Row ${rowNumber}: Product name must not exceed 255 characters`;
  }

  if (product.sku.length > 100) {
    return `Row ${rowNumber}: Product SKU must not exceed 100 characters`;
  }

  if (product.condition && !["A", "B", "C"].includes(product.condition.toUpperCase())) {
    return `Row ${rowNumber}: Product condition must be A, B, or C`;
  }

  if (product.basePrice !== undefined && product.basePrice < 0) {
    return `Row ${rowNumber}: Product price cannot be negative`;
  }

  if (product.stock !== undefined && product.stock < 0) {
    return `Row ${rowNumber}: Product stock cannot be negative`;
  }

  return null;
}

/**
 * Convert upload data to database insert format
 */
export function convertToInsertProduct(
  data: ProductUploadData,
  categoryId: number,
  conditionGrade: string
): InsertProduct {
  const imageUrls = data.images ? data.images.split(",").map((url) => url.trim()) : [];
  const certList = data.certifications ? data.certifications.split(",").map((c) => c.trim()) : [];
  
  const slug = data.name
    .toLowerCase()
    .replace(/[^\\w\\s-]/g, "")
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() + "-" + Date.now();

  return {
    name: data.name,
    sku: data.sku,
    slug,
    categoryId,
    description: data.description || null,
    specifications: data.specifications || null,
    conditionGrade,
    stock: data.stock || 0,
    basePrice: Math.round((data.basePrice || 0) * 100), // Store in cents
    images: JSON.stringify(imageUrls),
    active: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // Note: Certifications are stored separately in productCertifications table
  // certList can be used to create records in that table
}

/**
 * Generate CSV template for bulk upload
 */
export function generateCSVTemplate(): string {
  const headers = [
    "name",
    "sku",
    "category",
    "description",
    "specifications",
    "condition",
    "stock",
    "basePrice",
    "images",
    "certifications",
  ];

  const exampleRow = [
    "Wireless Bluetooth Speaker",
    "WBS-001",
    "Electronics",
    "High-quality portable speaker",
    "Power: 10W, Battery: 8 hours",
    "A",
    "100",
    "25.50",
    "https://example.com/image1.jpg,https://example.com/image2.jpg",
    "CE,FCC",
  ];

  return [headers.join(","), exampleRow.join(",")].join("\n");
}

/**
 * Validate CSV file size and format
 */
export function validateCSVFile(file: File): string | null {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedMimeTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (file.size > maxSize) {
    return `File size exceeds maximum limit of 10MB`;
  }

  if (!allowedMimeTypes.includes(file.type) && !file.name.endsWith(".csv")) {
    return `Invalid file format. Please upload a CSV or Excel file`;
  }

  return null;
}
