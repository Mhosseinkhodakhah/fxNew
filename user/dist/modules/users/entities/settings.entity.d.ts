export declare enum AccountStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class Settings {
    id: string;
    publicProfile: boolean;
    emailNotification: boolean;
    pushNotification: boolean;
    showPerformanceStats: boolean;
    accountStatus: AccountStatus;
    language: string;
}
