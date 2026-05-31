export declare enum TradingExperience {
    YEARS_1_2 = "1-2",
    YEARS_2_5 = "2-5",
    YEARS_5_8 = "5-8",
    YEARS_8_PLUS = "8+"
}
export declare class Profile {
    id: string;
    avatar: string;
    bio: string;
    tradingExperience: TradingExperience;
    specialization: string[];
    tags: string[];
    achievements: string[];
    tradingStyle: string[];
}
