import BackendConfig from "@/config/backend";
import { ApiClient } from "../client";
import { Owner, CreateOwnerInput } from "@/lib/schemas";

export class OwnerApiService {
    private static readonly basePath = BackendConfig.endpoints.owners;

    static async getAll(params?: Record<string, any>, token?: string | null): Promise<Owner[]> {
        return ApiClient.get<Owner[]>(this.basePath, params, token);
    }

    static async getById(id: string, token?: string | null): Promise<Owner> {
        return ApiClient.get<Owner>(`${this.basePath}/${id}`, undefined, token);
    }

    static async create(user: CreateOwnerInput, token?: string | null): Promise<Owner> {
        return ApiClient.post<Owner>(this.basePath, user, token);
    }

    static async update(id: string, user: Owner, token?: string | null): Promise<Owner> {
        return ApiClient.put<Owner>(`${this.basePath}/${id}`, user, token);
    }

    static async delete(id: string, token?: string | null): Promise<void> {
        return ApiClient.delete<void>(`${this.basePath}/${id}`, token);
    }
}