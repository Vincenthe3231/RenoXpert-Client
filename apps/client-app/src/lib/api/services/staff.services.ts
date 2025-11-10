import BackendConfig from "@/config/backend";
import { ApiClient } from "../client";
import { Staff } from "@/lib/types/user.types";

export class StaffApiService {
    private static readonly basePath = BackendConfig.endpoints.users;

    static async getAll(): Promise<Staff[]> {
        return ApiClient.get<Staff[]>(this.basePath);
    }

    static async getById(id: string): Promise<Staff> {
        return ApiClient.get<Staff>(`${this.basePath}/${id}`);
    }

    static async create(user: Staff): Promise<Staff> {
        return ApiClient.post<Staff>(this.basePath, user);
    }

    static async update(id: string, user: Staff): Promise<Staff> {
        return ApiClient.put<Staff>(`${this.basePath}/${id}`, user);
    }

    static async delete(id: string): Promise<void> {
        return ApiClient.delete<void>(`${this.basePath}/${id}`);
    }
}