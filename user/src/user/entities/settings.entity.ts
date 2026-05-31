import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  publicProfile: boolean;

  @Column({ default: true })
  emailNotification: boolean;

  @Column({ default: true })
  pushNotification: boolean;

  @Column({ default: true })
  showPerformanceStats: boolean;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  accountStatus: AccountStatus;

  @Column({ default: 'en' })
  language: string;
}
