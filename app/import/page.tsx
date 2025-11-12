import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ImportCard from "./_components/ImportCard"

export default async function ImportPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Import Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Upload your bank statement CSV file to import transactions into TrailSpend.
        </p>
      </div>

      <ImportCard userId={session.user.id} />
    </div>
  )
}
