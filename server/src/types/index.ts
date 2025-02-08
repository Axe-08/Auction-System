// server/src/types/index.ts
export interface ConnectedClient {
    productionHouseId?: number;
    connectionTime: Date;
    lastActivity: Date;
}

export interface ProductionHouse {
    id: number;
    name: string;
    budget?: number;
    access_code?: string;
}

export interface ProductionHouseWithBudget {
    id: number;
    name: string;
    budget: number;
}

export interface CrewMember {
    id: number;
    name: string;
    status: string;
}

export interface VerifyResponse {
    success: boolean;
    error?: string;
}

export interface SaleRequest {
    crewMemberId: number;
    productionHouseId: number;
    purchasePrice: number;
}

export interface SaleResult {
    success: boolean;
    error?: string;
    data?: {
        crewMemberId: number;
        productionHouseId: number;
        purchasePrice: number;
    };
}

export interface AdminAuthRequest {
    accessCode: string;
}