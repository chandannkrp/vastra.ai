import { api } from "./api";

export type StageStatus = "pending" | "running" | "done" | "failed";

export interface StageState {
  key: string;
  label: string;
  status: StageStatus;
  detail: string;
}

export interface PipelineProgress {
  stages: StageState[];
  current: string | null;
  percent: number;
  done: boolean;
  failed: boolean;
  error: string | null;
  tokens: number;
}

export interface SubmissionListItem {
  id: string;
  title: string | null;
  fabric_type: string | null;
  status: string;
  created_at: string;
  stage: string | null;
  percent: number;
  thumbnail_url: string | null;
}

export interface ImageOut {
  id: string;
  kind: string;
  shot_type: string | null;
  url: string;
}

export interface SubmissionDetail {
  submission: {
    id: string;
    title: string | null;
    fabric_type: string | null;
    status: string;
    created_at: string;
  };
  customization: Record<string, unknown> | null;
  progress: PipelineProgress;
  attributes: Record<string, unknown> | null;
  listing: Record<string, unknown> | null;
  marketing: Record<string, unknown> | null;
  images: ImageOut[];
  shopify_status: string | null;
}

export interface ProductCard {
  submission_id: string;
  title: string;
  fabric_type: string | null;
  status: string;
  shopify_status: string | null;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
}

export interface AnalyticsSummary {
  total_submissions: number;
  processing: number;
  ready: number;
  failed: number;
  images_generated: number;
  tokens_used: number;
  by_status: Record<string, number>;
}

export interface ConnectorStatus {
  connected: boolean;
  store_domain: string | null;
  shop_name: string | null;
  detail: string | null;
}

export interface Customization {
  image_shots: string[];
  tone: string;
  audience: string;
  length: string;
}

// --- API calls ---------------------------------------------------------

export async function createSubmission(
  files: File[],
  fields: {
    title?: string;
    fabric_type?: string;
    color?: string;
    price_per_meter?: string;
    width_inches?: string;
    notes?: string;
  },
  customization: Customization,
): Promise<{ id: string }> {
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  Object.entries(fields).forEach(([k, v]) => {
    if (v) form.append(k, v);
  });
  form.append("customization", JSON.stringify(customization));
  const { data } = await api.post("/submissions", form);
  return data;
}

export async function listSubmissions(): Promise<SubmissionListItem[]> {
  const { data } = await api.get("/submissions");
  return data;
}

export async function getSubmission(id: string): Promise<SubmissionDetail> {
  const { data } = await api.get(`/submissions/${id}`);
  return data;
}

export async function listProducts(): Promise<ProductCard[]> {
  const { data } = await api.get("/products");
  return data;
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const { data } = await api.get("/analytics/summary");
  return data;
}

export async function getShopifyStatus(): Promise<ConnectorStatus> {
  const { data } = await api.get("/connectors/shopify");
  return data;
}
