import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

// export type UserDocument = User & Document;

export interface UserDocument extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  pictureProfile: string;
  nationalCode: string;
  birthDate: string;
  authStatus: number; //? 0 just init - 1 compelteProfile - 2 exist in old service
  isActive: boolean;
  adresses: {
    _id: string;
    adress: string;
    postCode: string;
    name: string;
    plate: number;
    unit: number;
    city: string;
    province: string;
  }[];
  identityStatus: number;
}

@Schema({ timestamps: true })
export class User2 {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ type: mongoose.Schema.Types.String })
  firstName: string;

  @Prop({ type: mongoose.Schema.Types.String })
  lastName: string;

  @Prop({ type: mongoose.Schema.Types.String, required: true , unique : true })
  phoneNumber: string;

  @Prop({ type: mongoose.Schema.Types.String })
  email: string;

  @Prop({ type: mongoose.Schema.Types.String })
  fatherName: string;

  @Prop({ type: mongoose.Schema.Types.String })
  password: string;

  @Prop({ type: mongoose.Schema.Types.String })
  pictureProfile: string;

  @Prop({ type: mongoose.Schema.Types.String , unique : true})
  nationalCode: string;
  
  @Prop({ type: mongoose.Schema.Types.String })
  birthDate: string;

  @Prop({
    type: [
      {
        adress: { type: String },
        postCode: { type: String },
        name: { type: String },
        plate: { type: Number },
        unit: { type: Number },
        province: { type: String },
        city: { type: String },
      },
    ],
  })
  adresses: {
    adress: string;
    postCode: string;
    name: string;
    plate: number;
    unit: number;
    city: string;
    province: string;
  }[];

  @Prop({ type: mongoose.Schema.Types.Number })
  authStatus: number; //? 1 just init - 2 compelteProfile - 3 exist in old service

  @Prop({ type: mongoose.Schema.Types.Number, default: 0 }) //? 0 false   1->true  2-->pending
  identityStatus: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema2 = SchemaFactory.createForClass(User2);
