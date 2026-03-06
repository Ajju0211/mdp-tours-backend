export interface FindAllPackagesDto {
  page: number;
  limit: number;
  category?: string;
  isActive?: boolean;
  isPublic?: boolean;
}
