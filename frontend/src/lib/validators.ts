import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  user_type: z.enum(['individual','company']),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  id_card_number: z.string().optional(),
  company_name: z.string().optional(),
  tax_id: z.string().optional(),
  branch_name: z.string().optional(),
  address: z.string().min(3),
  phone_number: z.string().min(6)
}).refine(v => (
  v.user_type === 'individual' ? v.first_name && v.last_name && v.id_card_number : v.company_name && v.tax_id
), { message: 'กรอกข้อมูลตามประเภทผู้ใช้ให้ครบถ้วน' })

export const verifySlipSchema = z.object({
  slipRef: z.string().min(4),
  amount: z.coerce.number().positive(),
  date: z.string().min(8)
})

export const qrSchema = z.object({
  merchantId: z.string().min(8),
  amount: z.coerce.number().positive(),
})