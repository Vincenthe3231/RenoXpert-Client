import BackendConfig from "@/config/backend";
import { ApiClient } from "../client";
import { Staff } from "@/lib/schemas";

export class StaffApiService {
    private static readonly basePath = BackendConfig.endpoints.staff;

    static async getAll(params?: Record<string, any>, token?: string | null): Promise<Staff[]> {
        return ApiClient.get<Staff[]>(this.basePath, params, token);
    }

    static async getById(id: string, token?: string | null): Promise<Staff> {
        return ApiClient.get<Staff>(`${this.basePath}/${id}`, undefined, token);
    }

    static async create(user: Staff, token?: string | null): Promise<Staff> {
        return ApiClient.post<Staff>(this.basePath, user, token);
    }

    static async update(id: string, user: Staff, token?: string | null): Promise<Staff> {
        return ApiClient.put<Staff>(`${this.basePath}/${id}`, user, token);
    }

    static async delete(id: string, token?: string | null): Promise<void> {
        return ApiClient.delete<void>(`${this.basePath}/${id}`, token);
    }
}