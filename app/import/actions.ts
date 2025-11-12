"use server"

import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import Papa from "papaparse"
import { z } from "zod"

const prisma = new PrismaClient()

export type ImportResult = {
  success?: string
  error?: string
}

// --- Zod Schemas for BOTH CSV types ---

// Base properties
const baseTransactionSchema = z.object({
  Description: z.string(),
  Amount: z.string().transform(Number),
})

// Checking: "Posting Date"
const checkingTransactionSchema = baseTransactionSchema.extend({
  "Posting Date": z.string(),
})

// Credit Card: "Post Date" and "Category"
const creditCardTransactionSchema = baseTransactionSchema.extend({
  "Post Date": z.string(),
  Category: z.string(),
})

export async function importTransactions(
  formData: FormData
): Promise<ImportResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Not authorized" }
  }
  const userId = session.user.id

  const file = formData.get("file") as File
  if (!file) {
    return { error: "No file uploaded" }
  }

  const fileText = await file.text()

  // 1. Parse the CSV
  const parseResult = Papa.parse(fileText, {
    header: true,
    skipEmptyLines: true,
  })

  if (parseResult.errors.length > 0 || !parseResult.data.length) {
    return { error: "Error parsing CSV file." }
  }

  // 2. Auto-detect the schema
  const headers = parseResult.meta.fields || []
  const isCreditCard =
    headers.includes("Post Date") && headers.includes("Category")
  const isChecking = headers.includes("Posting Date")

  if (!isCreditCard && !isChecking) {
    return { error: "Unknown CSV format. Headers do not match." }
  }

  // 3. Process rows one-by-one (smarter, not faster)
  let importedCount = 0
  let skippedCount = 0

  for (const row of parseResult.data) {
    try {
      // --- a. Normalize Data ---
      let normalized = {
        date: new Date(),
        description: "",
        amount: 0,
        categoryName: null as string | null,
      }

      if (isCreditCard) {
        const tx = creditCardTransactionSchema.parse(row)
        normalized.date = new Date(tx["Post Date"])
        normalized.description = tx.Description
        normalized.amount = tx.Amount // Will be negative for sales
        normalized.categoryName = tx.Category
      } else {
        // isChecking
        const tx = checkingTransactionSchema.parse(row)
        normalized.date = new Date(tx["Posting Date"])
        normalized.description = tx.Description
        normalized.amount = tx.Amount // Will be negative for debits
      }

      // --- b. Filter Out Noise ---
      // We only care about SPENDING. Credits/payments are not "spending".
      if (normalized.amount >= 0) {
        continue
      }

      const spendingAmount = Math.abs(normalized.amount)

      // --- c. Find or Create Category (if it exists) ---
      let categoryId: string | null = null
      if (normalized.categoryName) {
        const category = await prisma.category.upsert({
          where: {
            // This relies on the unique constraint we defined in schema.prisma
            userId_name: {
              userId: userId,
              name: normalized.categoryName,
            },
          },
          update: {}, // If found, do nothing
          create: {
            userId: userId,
            name: normalized.categoryName,
          },
        })
        categoryId = category.id
      }

      // --- d. Create or Update Transaction ---
      // We use `upsert` to prevent duplicates if you re-upload a file.
      // This relies on the `@@unique([userId, date, description, amount])`
      // constraint in your Transaction model.
      await prisma.transaction.upsert({
        where: {
          userId_date_description_amount: {
            userId: userId,
            date: normalized.date,
            description: normalized.description,
            amount: spendingAmount, // Use the absolute value
          },
        },
        update: {
          // If duplicate is found, update the category if we have one
          // (e.g., if you imported checking first, then credit card)
          categoryId: categoryId,
        },
        create: {
          userId: userId,
          date: normalized.date,
          description: normalized.description,
          amount: spendingAmount,
          categoryId: categoryId,
          // `isSubscription` is false by default, AI will fix this later
        },
      })

      importedCount++
    } catch (error) {
      // Log the error but continue processing other rows
      console.error("Failed to process row:", row, error)
      skippedCount++
    }
  }

  return {
    success: `Import complete. ${importedCount} transactions imported. ${skippedCount} rows skipped.`,
  }
}
