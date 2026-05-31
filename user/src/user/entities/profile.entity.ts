import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TradingExperience {
  YEARS_1_2 = '1-2',
  YEARS_2_5 = '2-5',
  YEARS_5_8 = '5-8',
  YEARS_8_PLUS = '8+',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'enum', enum: TradingExperience, nullable: true })
  tradingExperience: TradingExperience;

  @Column({ type: 'simple-array', nullable: true })
  specialization: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  achievements: string[];

  @Column({ type: 'simple-array', nullable: true })
  tradingStyle: string[];
}
