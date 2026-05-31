export declare enum AccountStatus {
    ACTIVE = "Active",
    DEACTIVE = "Deactive",
    SUSPENDED = "Suspended"
}
export declare class UpdateSettingsDto {
    publicProfile?: boolean;
    emailNotification?: boolean;
    pushNotification?: boolean;
    showPerformanceStats?: boolean;
    accountStatus?: AccountStatus;
    language?: string;
}
