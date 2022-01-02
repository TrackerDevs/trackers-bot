import { Document, Schema, model } from "mongoose"

/*  Commented out due to switching models. We now have a collection 
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
*/

export interface IBase extends Document {
  id: string
}

export const BaseSchema = {
  id: { type: String, required: true }
}

//#region Birthday
export interface IBirthday extends IBase {
  month: string, 
  day: number, 
  year: number 
}

export const BirthdaySchema = new Schema({
  ...BaseSchema,
  month: String, 
  day: Number, 
  year: Number, 
})

export const BirthdayModel = model<IBirthday>('Birthday', BirthdaySchema)
//#endregion 

//#region 
export interface ITodo extends IBase {
  title: string, 
  description?: string,
  dueDate?: number
}

//#endregion