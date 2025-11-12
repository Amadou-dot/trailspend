"use client"

import { useState, useRef } from "react"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { importTransactions, type ImportResult } from "../actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ImportCardProps = {
  userId: string
}

export default function ImportCard({ userId }: ImportCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null) // Clear previous results
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!file) {
      setResult({
        error: "Please select a file to upload.",
      })
      return
    }

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const importResult = await importTransactions(formData)
      setResult(importResult)

      // Clear file input if successful
      if (importResult.success) {
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Upload failed.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Upload Bank Statement</CardTitle>
        <CardDescription>
          Select a CSV file containing your bank transactions. The file should include columns for date, description, and amount.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="grid w-full items-center gap-1.5">
            <label
              htmlFor="csv-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <FileText className="w-12 h-12 mb-4 text-primary" />
                    <p className="mb-2 text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">CSV files only</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* CSV Format Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>CSV Format</AlertTitle>
            <AlertDescription>
              <p className="mb-2">We support two CSV formats:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Checking/Debit Card:</strong> Must include "Posting Date", "Description", and "Amount"</li>
                <li><strong>Credit Card:</strong> Must include "Post Date", "Description", "Amount", and "Category"</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Only expenses (negative amounts) will be imported. Credits and payments are filtered out.
              </p>
            </AlertDescription>
          </Alert>

          {/* Result Message */}
          {result && (
            <Alert variant={result.error ? "destructive" : "default"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.success ? "Import Successful" : "Import Failed"}
              </AlertTitle>
              <AlertDescription>
                {result.success || result.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isUploading || !file}
          >
            Clear
          </Button>
          <Button type="submit" disabled={isUploading || !file}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Transactions
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
