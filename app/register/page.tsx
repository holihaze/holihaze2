"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ref, push, get } from "firebase/database"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"

// Firebase configuration
import { db } from "./firebaseConfig"

export default function Register() {
  const router = useRouter()
  
  // State to manage global error message
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [passType, setPassType] = useState<string | null>(null)

  // Fetch search params only on client-side
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const pass = searchParams.get("pass")
    setPassType(pass)
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
    },
  })

  const gender = watch("gender")
  const price = gender === "male" ? 599 : gender === "female" ? 499 : 0

  const handleSelectChange = (value: string) => {
    setValue("gender", value, { shouldValidate: true })
  }

  const generatePassNumber = async () => {
    const passRef = ref(db, "registrations")
    const snapshot = await get(passRef)
    const data = snapshot.val()
    const nextPassNumber = data ? Object.keys(data).length + 1 : 1
    return "HOLI-2025" + nextPassNumber
  }

  const saveToFirebase = async (data: any) => {
    try {
      const newRef = ref(db, "registrations")
      const docRef = await push(newRef, data)
      return docRef.key
    } catch (error) {
      console.error("Error adding document:", error)
      throw error
    }
  }

  // Check if email or phone exists in the database
  const isEmailOrPhoneUnique = async (email: string, phone: string) => {
    const passRef = ref(db, "registrations")
    const snapshot = await get(passRef)
    const data = snapshot.val()

    for (const key in data) {
      const user = data[key]
      if (user.email === email) {
        return "email"
      }
      if (user.phone === phone) {
        return "phone"
      }
    }
    return null
  }

  const onSubmit = async (data: any) => {
    // Clear previous errors
    clearErrors("email")
    clearErrors("phone")
    setGlobalError(null)  // Clear any previous global errors

    // Validate phone number length
    if (data.phone.length !== 10) {
      setError("phone", { type: "manual", message: "Phone number must be exactly 10 digits." })
      return
    }

    // Check if email or phone number is unique
    const uniqueField = await isEmailOrPhoneUnique(data.email, data.phone)
    if (uniqueField) {
      setError(uniqueField, { type: "manual", message: `${uniqueField.charAt(0).toUpperCase() + uniqueField.slice(1)} already exists. Please use a different ${uniqueField}.` })
      return
    }

    const passNumber = await generatePassNumber()
    const registrationData = {
      ...data,
      price,
      passNumber,
      paymentStatus: "unpaid",
      registrationDate: new Date().toISOString(),
    }

    try {
      const docId = await saveToFirebase(registrationData)

      // Removed the payment functionality, everything else stays the same

    } catch (error) {
      console.error("Error during registration:", error)
      setGlobalError("Error: Something went wrong. Please try again.") // Set global error message
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Register for Holi 2025</CardTitle>
          <CardDescription>
            {price > 0 ? `Pass Price - ₹${price}` : "Select gender to see price"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName", { required: "First name is required" })} />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={handleSelectChange} value={gender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                  })}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/, 
                      message: "Phone number must be exactly 10 digits."
                    },
                  })}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

            </div>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Return to Home
                </Button>
              </Link>
              <Button type="submit" className="w-full sm:w-auto">
                Proceed to Payment
              </Button>
            </CardFooter>

          </form>
        </CardContent>
        {/* Global error message */}
        {globalError && (
          <div className="text-red-500 text-center mt-1">
            <p>{globalError}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
