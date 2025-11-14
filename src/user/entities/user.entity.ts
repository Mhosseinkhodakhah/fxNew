import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';



export interface IUser {
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email?: string;
  // fatherName?: string;
  password?: string;
  pictureProfile?: string;
  // nationalCode?: string;
  birthDate?: string;

  adresses: {
    id:string
    adress: string;
    postCode: string;
    name: string;
    plate: number;
    unit: number;
    city: string;
    province: string;
  }[];

  authStatus: number;      // 1 init - 2 completeProfile - 3 old service
  identityStatus: number;  // 0 false, 1 true, 2 pending
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  fatherName: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  pictureProfile: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  nationalCode: string;

  @Column({ type: 'varchar', nullable: true })
  birthDate: string;

  @Column({ type: 'jsonb', default: [] })
  adresses: {
    id:string
    adress: string;
    postCode: string;
    name: string;
    plate: number;
    unit: number;
    city: string;
    province: string;
  }[];

  @Column({ type: 'int', default: 1 }) 
  authStatus: number; // 1 init - 2 completeProfile - 3 old service

  @Column({ type: 'int', default: 0 }) 
  identityStatus: number; // 0 false, 1 true, 2 pending

  @Column({ type: 'bool', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
