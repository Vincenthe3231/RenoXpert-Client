import BackendConfig from "@/config/backend";
import { ApiClient } from "../client";
import { BaseUser } from "@/lib/types/user.types";

export class UserApiService {
    private static readonly basePath = BackendConfig.endpoints.users;

    static async getAll(): Promise<BaseUser[]> {
        return ApiClient.get<BaseUser[]>(this.basePath);
    }

    static async getById(id: string): Promise<BaseUser> {
        return ApiClient.get<BaseUser>(`${this.basePath}/${id}`);
    }

    static async create(user: BaseUser): Promise<BaseUser> {
        return ApiClient.post<BaseUser>(this.basePath, user);
    }

    static async update(id: string, user: BaseUser): Promise<BaseUser> {
        return ApiClient.put<BaseUser>(`${this.basePath}/${id}`, user);
    }

    static async delete(id: string): Promise<void> {
        return ApiClient.delete<void>(`${this.basePath}/${id}`);
    }
}