import { Document, Schema, model } from "mongoose"

export interface IUser extends Document {
  id: string,
  birthday?: {
    month?: string, 
    day?: number, 
    year?: number 
  }
}

export const BirthdaySchema = new Schema({
  month: String,
  day: Number,
  year: Number,
})

export const UserSchema: Schema = new Schema(
  {
      id: { type: String, required: true },
      birthday: { type: BirthdaySchema, required: false }
  },
  {
      timestamps: true
  }
)

export const UserModel = model<IUser>('User', UserSchema)