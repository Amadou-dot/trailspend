import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { columns } from "./columns"
import { DataTable } from "./DataTable"

const prisma = new PrismaClient()

export default async function SpendingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  // Fetch all transactions for the user
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  })

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Spending</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your transactions.
        </p>
      </div>

      <DataTable columns={columns} data={transactions} />
    </div>
  )
}
