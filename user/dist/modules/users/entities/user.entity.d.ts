import { Profile } from './profile.entity';
import { Settings } from './settings.entity';
import { UserRole } from "../../../common/types/enum";
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    isSuspend: boolean;
    isVerify: boolean;
    role: UserRole;
    location: string;
    followersCount: number;
    followingCount: number;
    isUpdated: boolean;
    profile: Profile;
    settings: Settings;
    createdAt: Date;
    updatedAt: Date;
}
