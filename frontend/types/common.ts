export type EntityId = string;

/** ISO 8601 timestamp returned by the API. */
export type IsoDateString = string;

export type SortOrder = "asc" | "desc";

/** Query fields supported by paginated API endpoints. */
export interface ListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}
