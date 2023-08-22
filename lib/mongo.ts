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
  scheduleData?: {
    schedule: any[], // TDOO - make this an actual type
    open: boolean
  }
}

export const UserSchema: Schema = new Schema(
  {
    ...BaseSchema,
    netid: { type: String, required: false },
    verified: { type: Boolean, required: false },
    scheduleData: {
      schedule: { type: Array, required: false },
      open: { type: Boolean, required: false }
    }
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
export interface IReminder extends IBase {
  title: string, // Title of the reminder
  content: string,
  channel: string,
  mentions: string[],
  dateTime: string,
  authorID: string
}

export const ReminderSchema = new Schema({
  ...BaseSchema,
  title: String,
  content: String,
  channel: String,
  mentions: [String],
  dateTime: String,
  authorID: String
})

export const ReminderModel = model<IReminder>('Reminder', ReminderSchema)
//#endregion