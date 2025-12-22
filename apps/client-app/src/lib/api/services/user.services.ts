import BackendConfig from "@/config/backend";
import { ApiClient } from "../client";
import { BaseUser } from "@/lib/types/user.types";
import { EditOwnerInput, EditStaffInput } from "@/lib/schemas";

export class UserApiService {
    private static readonly basePath = BackendConfig.endpoints.users;

    static async getAll(params?: Record<string, any>, token?: string | null): Promise<BaseUser[]> {
        return ApiClient.get<BaseUser[]>(this.basePath, params, token);
    }

    // http://lcoalhost:8000/api/v1/users/5
    static async getById(id: string, token?: string | null): Promise<BaseUser> {
        return ApiClient.get<BaseUser>(`${this.basePath}/${id}`, undefined, token);
    }


    static async create(user: BaseUser, token?: string | null): Promise<BaseUser> {
        return ApiClient.post<BaseUser>(this.basePath, user, token);
    }

    static async update(id: string, user: EditStaffInput | EditOwnerInput, token?: string | null): Promise<BaseUser> {
        return ApiClient.put<BaseUser>(`${this.basePath}/${id}`, user, token);
    }

    static async delete(id: string, token?: string | null): Promise<void> {
        return ApiClient.delete<void>(`${this.basePath}/${id}`, token);
    }
}