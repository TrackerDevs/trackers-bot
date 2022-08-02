import { Document, Schema, model } from "mongoose"

export interface IBase extends Document {
  id: string
}

export const BaseSchema = {
  id: { type: String, required: true }
}
export interface IUser extends IBase {
  netid?: string,
  verified?: boolean,
}

export const UserSchema: Schema = new Schema(
  {
    ...BaseSchema,
    netid: { type: String, required: false },
    verified: { type: Boolean, required: false }
  },
  {
    timestamps: true
  }
)
  
export const UserModel = model<IUser>('User', UserSchema)


//#region Birthday
export interface IBirthday extends IBase {
  month: string, 
  day: number, 
  year?: number 
}

export const BirthdaySchema = new Schema({
  ...BaseSchema,
  month: String, 
  day: Number, 
  year: {
    type: Number, 
    required: false
  }, 
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