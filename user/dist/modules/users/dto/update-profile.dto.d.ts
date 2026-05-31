export declare enum TradingExperience {
    BEGINNER = "Beginner",
    INTERMEDIATE = "Intermediate",
    EXPERT = "Expert"
}
export declare class UpdateProfileDto {
    avatar?: string;
    bio?: string;
    tradingExperience?: TradingExperience;
    specialization?: string[];
    tags?: string[];
    achievements?: string[];
    tradingStyle?: string[];
}
