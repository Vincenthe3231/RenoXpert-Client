import BackendConfig from "@/config/backend";
import { ApiClient } from "../client";
import { Onboarding } from "@/lib/schemas/onboarding.schemas";

export class OnboardingService {
    private static readonly basePath = BackendConfig.endpoints.onboarding;

    static async getAll(params?: Record<string, any>, token?: string | null): Promise<Onboarding[]> {
        return ApiClient.get<Onboarding[]>(this.basePath, params, token);
    }

    static async approve(id: string, body: { userType: string }, token?: string | null): Promise<Onboarding> {
        return ApiClient.post<Onboarding>(`${this.basePath}/${id}/approve`, body, token);
    }

    static async reject(id: string, body: { rejectionReason: string }, token?: string | null): Promise<Onboarding> {
        return ApiClient.post<Onboarding>(`${this.basePath}/${id}/reject`, body, token);
    }
}
