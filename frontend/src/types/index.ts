export type Role = 'user' | 'admin'

export interface LoginResponse {
  token: string
  user: {
    _id: string
    email: string
    role: Role
    apiKey: string
    credits: number
    user_type: 'individual' | 'company'
    first_name?: string
    last_name?: string
    id_card_number?: string
    company_name?: string
    tax_id?: string
    branch_name?: string
    address?: string
    phone_number?: string
  }
}

export interface VerificationLog {
  _id: string
  userId: string
  ref: string
  amount: number
  status: 'success' | 'failed'
  bankResponse: any
  createdAt: string
}