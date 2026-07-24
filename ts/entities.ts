import type { UserModel } from '@models'

export interface UserFormModel extends Omit<UserModel, 'id'> {
  repeatPassword: string
}
