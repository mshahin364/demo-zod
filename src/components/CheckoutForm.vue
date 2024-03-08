<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import isCreditCard from 'validator/lib/isCreditCard'
import isISBN from 'validator/lib/isISBN'
import isISO31661Alpha3 from 'validator/lib/isISO31661Alpha3'
import FormError from '@/components/FormError.vue'

const checkoutFormSchema = z.object({
  customerInfo: z.object({
    name: z.string().min(20).max(50),
    email: z.string().email(),
    phoneNumber: z.string().regex(/^\d{10}$/)
  }),
  shippingAddress: z.object({
    addressLine1: z.string().min(5).max(100),
    addressLine2: z.string().max(100),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    postalCode: z.string().regex(/^\d{5}$/),
    country: z.string().refine(val => isISO31661Alpha3(val), {
      message: 'Invalid country code'
    })
  }),
  items: z
    .array(
      z.object({
        isbn: z.string().refine(val => isISBN(val), { message: 'Invalid ISBN' }),
        quantity: z.number().int().min(1).max(5)
      })
    )
    .min(1),
  paymentDetails: z.object({
    cardNumber: z.string().refine(val => isCreditCard(val), {
      message: 'Invalid credit card number'
    }),
    expirationDate: z
      .string()
      .regex(/^\d{2}\/\d{2}$/)
      .refine(
        expirationDate => {
          const [currentMonth, currentYear] = new Date()
            .toLocaleDateString('en', { month: '2-digit', year: '2-digit' })
            .split('/')
            .map(i => parseInt(i))
          const [month, year] = expirationDate.split('/').map(i => parseInt(i))
          return year > currentYear || (year === currentYear && month >= currentMonth)
        },
        { message: 'Expiration date cannot be in the past' }
      ),
    cvv: z.string().regex(/^\d{3}$/)
  })
})

type CheckoutFormType = z.infer<typeof checkoutFormSchema>
type FormattedErrors = z.inferFormattedError<typeof checkoutFormSchema>

const form = ref<CheckoutFormType>({
  customerInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890'
  },
  shippingAddress: {
    addressLine1: '123 Main St',
    addressLine2: 'Apt 101',
    city: 'Anytown',
    state: 'California',
    postalCode: '12345',
    country: 'USA'
  },
  items: [
    { isbn: '109815326X', quantity: 2 },
    { isbn: '0786962461', quantity: 1 }
  ],
  paymentDetails: {
    cardNumber: '4503300000000008',
    expirationDate: '03/24',
    cvv: '123'
  }
})

const errors = ref<FormattedErrors>()

/*
const form = ref<CheckoutFormType>({
  customerInfo: { name: '', email: '', phoneNumber: '' },
  shippingAddress: { addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' },
  items: [],
  paymentDetails: { cardNumber: '', expirationDate: '', cvv: '' }
})
*/

function submitForm() {
  const validation = checkoutFormSchema.safeParse(form.value)
  errors.value = validation.success ? undefined : validation.error.format()
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <fieldset class="grid gap-4">
      <legend>Personal Details</legend>
      <label>
        <span>Name:</span>
        <input v-model="form.customerInfo.name" type="text" required />
        <FormError :errors="errors?.customerInfo?.name?._errors" />
      </label>
      <div class="grid grid-cols-2 gap-4">
        <label>
          <span>Email:</span>
          <input v-model="form.customerInfo.email" type="email" required />
          <FormError :errors="errors?.customerInfo?.email?._errors" />
        </label>
        <label>
          <span>Phone Number:</span>
          <input v-model="form.customerInfo.phoneNumber" type="tel" pattern="^\d{10}$" required />
          <FormError :errors="errors?.customerInfo?.phoneNumber?._errors" />
        </label>
      </div>
    </fieldset>

    <fieldset>
      <legend>Address</legend>
      <div class="grid grid-cols-2 gap-4">
        <label>
          <span>Address Line 1:</span>
          <input v-model="form.shippingAddress.addressLine1" type="text" required />
          <FormError :errors="errors?.shippingAddress?.addressLine1?._errors" />
        </label>
        <label>
          <span>Address Line 2:</span>
          <input v-model="form.shippingAddress.addressLine2" type="text" />
          <FormError :errors="errors?.shippingAddress?.addressLine2?._errors" />
        </label>
      </div>
      <div class="grid gap-4 grid-cols-4">
        <label>
          <span>City:</span>
          <input v-model="form.shippingAddress.city" type="text" required />
          <FormError :errors="errors?.shippingAddress?.city?._errors" />
        </label>
        <label>
          <span>State:</span>
          <input v-model="form.shippingAddress.state" type="text" required />
          <FormError :errors="errors?.shippingAddress?.state?._errors" />
        </label>
        <label>
          <span>Postal Code:</span>
          <input v-model="form.shippingAddress.postalCode" type="text" pattern="^\d{5}$" required />
          <FormError :errors="errors?.shippingAddress?.postalCode?._errors" />
        </label>
        <label>
          <span>Country:</span>
          <input v-model="form.shippingAddress.country" type="text" required />
          <FormError :errors="errors?.shippingAddress?.country?._errors" />
        </label>
      </div>
    </fieldset>

    <fieldset class="grid-cols-4 grid gap-4">
      <legend>Payment Details</legend>
      <label class="col-span-2">
        <span>Card Number:</span>
        <input v-model="form.paymentDetails.cardNumber" type="text" required />
        <FormError :errors="errors?.paymentDetails?.cardNumber?._errors" />
      </label>
      <label>
        <span>Expiration Date:</span>
        <input v-model="form.paymentDetails.expirationDate" type="text" pattern="^\d{2}/\d{2}$" required />
        <FormError :errors="errors?.paymentDetails?.expirationDate?._errors" />
      </label>
      <label>
        <span>CVV:</span>
        <input v-model="form.paymentDetails.cvv" type="text" pattern="^\d{3}$" required />
        <FormError :errors="errors?.paymentDetails?.cvv?._errors" />
      </label>
    </fieldset>

    <fieldset class="grid gap-4">
      <legend>Items</legend>
      <div v-for="(item, index) in form.items" :key="index" class="grid grid-cols-2 gap-4">
        <label>
          <span>ISBN:</span>
          <input v-model="item.isbn" type="text" required />
          <FormError :errors="errors?.items?.[index]?.isbn?._errors" />
        </label>
        <label>
          <span>Quantity:</span>
          <input v-model="item.quantity" type="number" required />
          <FormError :errors="errors?.items?.[index]?.quantity?._errors" />
        </label>
      </div>
    </fieldset>

    <button type="submit">Checkout</button>
  </form>
</template>

<style>
form {
  @apply space-y-4;
}

fieldset {
  @apply p-3 border border-gray-300 rounded-lg;
}

label span {
  @apply font-bold text-sm;
}

input {
  @apply w-full border border-gray-300 rounded px-2 py-1;
}

button[type=submit] {
  @apply bg-blue-500 text-white p-2 rounded w-full text-center;
}
</style>
