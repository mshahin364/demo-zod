<script setup lang="ts">
import { ref } from 'vue'
import { checkoutSchema, type Checkout, type CheckoutErrors } from '@/checkout'
import FormError from '@/components/FormError.vue'

const errors = ref<CheckoutErrors>()

const form = ref<Checkout>({
  customerInfo: {
    name: '',
    email: '',
    phoneNumber: ''
  },
  shippingAddress: {
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  },
  items: [],
  paymentDetails: {
    cardNumber: '',
    expirationDate: '',
    cvv: ''
  }
})

function submit() {
  const result = checkoutSchema.safeParse(form.value)

  if (!result.success) {
    errors.value = result.error.format()
    console.log(errors.value)
    return
  }

  errors.value = undefined
  alert('Success!')
  console.log(result.data)
}
</script>

<template>
  <form @submit.prevent="submit">
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
          <span>Phone Number (10 digits):</span>
          <input v-model="form.customerInfo.phoneNumber" type="tel" required />
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
          <input v-model="form.shippingAddress.postalCode" type="text" required />
          <FormError :errors="errors?.shippingAddress?.postalCode?._errors" />
        </label>
        <label>
          <span>Country Code:</span>
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
        <span>Expiration (MM/YY):</span>
        <input v-model="form.paymentDetails.expirationDate" type="text" required />
        <FormError :errors="errors?.paymentDetails?.expirationDate?._errors" />
      </label>
      <label>
        <span>CVV:</span>
        <input v-model="form.paymentDetails.cvv" type="text" required />
        <FormError :errors="errors?.paymentDetails?.cvv?._errors" />
      </label>
    </fieldset>

    <fieldset class="grid gap-4">
      <legend>Books</legend>
      <div v-for="(item, index) in form.items" :key="index" class="flex gap-4 items-start">
        <label class="flex-1">
          <span>ISBN:</span>
          <input v-model="item.isbn" type="text" required />
          <FormError :errors="errors?.items?.[index]?.isbn?._errors" />
        </label>
        <label class="flex-1">
          <span>Quantity:</span>
          <input v-model="item.quantity" type="number" required />
          <FormError :errors="errors?.items?.[index]?.quantity?._errors" />
        </label>
        <button class="text-red-500 pt-8" @click="form.items.splice(index, 1)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="h-4 fill-current">
            <path
              d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
          </svg>
        </button>
      </div>
      <button type="button" class="text-blue-500 flex items-center gap-2" @click="form.items.push({ isbn: '', quantity: 0 })">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="h-4 fill-current">
          <path
            d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
        </svg>
        <span>Add Book</span>
      </button>
      <FormError :errors="errors?.items?._errors" />
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

button[type='button'] {
  @apply text-blue-500;
}

button[type='submit'] {
  @apply bg-blue-500 text-white p-2 rounded w-full text-center;
}
</style>
