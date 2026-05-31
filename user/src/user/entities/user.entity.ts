import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Settings } from './settings.entity';
import { UserRole } from 'src/common/types/enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: false })
  isSuspend: boolean;

  @Column({ type: 'boolean', default: false })
  isVerify: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  location: string;

  @Column({ default: 0 })
  followersCount: number;

  @Column({ default: 0 })
  followingCount: number;

  @Column({ default: false })
  isUpdated: boolean;

  // رابطه با جدول پروفایل
  @OneToOne(() => Profile, { cascade: true })
  @JoinColumn()
  profile: Profile;

  // رابطه با جدول تنظیمات
  @OneToOne(() => Settings, { cascade: true })
  @JoinColumn()
  settings: Settings;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
