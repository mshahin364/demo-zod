import { z } from 'zod'

// Let's import some handy validators
import isCreditCard from 'validator/lib/isCreditCard'
import isISBN from 'validator/lib/isISBN'
import isISO31661Alpha3 from 'validator/lib/isISO31661Alpha3'
import isPostalCode from 'validator/lib/isPostalCode'

// And define one to check the expiration date of the credit card
function isExpirationDateValid(expirationDate: string): boolean {
  const [currentMonth, currentYear] = new Date()
    .toLocaleDateString('en', { month: '2-digit', year: '2-digit' })
    .split('/')
    .map(i => parseInt(i))
  const [month, year] = expirationDate.split('/').map(i => parseInt(i))
  return year > currentYear || (year === currentYear && month >= currentMonth)
}

// Create a customer info schema
const customerInfoSchema = z.object({
  name: z.string().min(4).max(50),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\d{10}$/)
})

// Create a shipping address schema
const shippingAddressSchema = z.object({
  addressLine1: z.string().min(5).max(100),
  addressLine2: z.string().max(100),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  postalCode: z.string().refine(val => isPostalCode(val, 'US'), {
    message: 'Invalid postal code'
  }),
  country: z.string().refine(val => isISO31661Alpha3(val), {
    message: 'Invalid country code'
  })
})

// Now, a payment details schema
const paymentDetailsSchema = z.object({
  cardNumber: z.string().refine(val => isCreditCard(val), {
    message: 'Invalid credit card number'
  }),
  expirationDate: z
    .string()
    .regex(/^\d{2}\/\d{2}$/)
    .refine(val => isExpirationDateValid(val), {
      message: 'Expiration date cannot be in the past'
    }),
  cvv: z.string().regex(/^\d{3}$/)
})

// And finally an items schema
const itemsSchema = z
  .array(
    z.object({
      isbn: z.string().refine(val => isISBN(val), {
        message: 'Invalid ISBN'
      }),
      quantity: z.number().int().min(1).max(5)
    })
  )
  .min(1)

// Let's bring it all together
export const checkoutSchema = z.object({
  customerInfo: customerInfoSchema,
  shippingAddress: shippingAddressSchema,
  paymentDetails: paymentDetailsSchema,
  items: itemsSchema
})

// Also export the type and the errors type
export type Checkout = z.infer<typeof checkoutSchema>
export type CheckoutErrors = z.inferFormattedError<typeof checkoutSchema>
