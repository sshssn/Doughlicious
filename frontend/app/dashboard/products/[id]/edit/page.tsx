"use client"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../../../../../lib/servercomms"
import { useRouter, useParams } from "next/navigation"
import { Label } from "../../../../../components/ui/label"
import { Input } from "../../../../../components/ui/input"
import { Button } from "../../../../../components/ui/button"
import { Textarea } from "../../../../../components/ui/textarea"
import { Checkbox } from "../../../../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "../../../../../hooks/use-toast"
import Image from "next/image"

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    price: 0, 
    category: "Donuts", 
    imageUrl: "", 
    stock: 0, 
    isActive: true, 
    packSize: 1 
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      try {
        const token = await getToken()
        if (!token) {
          toast({
            title: "Error",
            description: "Please sign in",
            variant: "destructive",
          })
          router.push("/dashboard/products")
          return
        }
        
        // Try direct product fetch first
        let res = await serverComms(`admin/products/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        
        // If 404, try fetching from products list as fallback
        if (res.error && res.status === 404) {
          const listRes = await serverComms(`admin/products`, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
          if (listRes.data && Array.isArray(listRes.data)) {
            const product = listRes.data.find((p: any) => p.id === id)
            if (product) {
              res = { data: product, error: null }
            }
          }
        }
        
        if (res.error) {
          const isDatabaseError = res.error.includes("database") || 
                                  res.error.includes("Can't reach") ||
                                  res.error.includes("prisma") ||
                                  res.error.includes("pooler.supabase")
          const errorMsg = res.status === 404 
            ? "Product not found. It may have been deleted."
            : isDatabaseError
            ? "Database connection error. Please check backend server and database connection."
            : res.error || "Failed to load product"
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          })
          router.push("/dashboard/products")
          return
        }
        if (res.data) {
          setForm({
            name: res.data.name || "",
            description: res.data.description || "",
            price: res.data.price || 0,
            category: res.data.category || "Donuts",
            imageUrl: res.data.imageUrl || "",
            stock: res.data.stock || 0,
            isActive: res.data.isActive ?? true,
            packSize: res.data.packSize || 1,
          })
          // Set preview if imageUrl exists and is a data URL
          if (res.data.imageUrl && res.data.imageUrl.startsWith('data:')) {
            setImagePreview(res.data.imageUrl)
          } else if (res.data.imageUrl) {
            setImagePreview(res.data.imageUrl)
          }
        } else {
          toast({
            title: "Error",
            description: "Product data not available",
            variant: "destructive",
          })
          router.push("/dashboard/products")
        }
      } catch (error: any) {
        const isDatabaseError = error?.message?.includes("database") || 
                                error?.message?.includes("Can't reach") ||
                                error?.message?.includes("prisma") ||
                                error?.message?.includes("pooler.supabase")
        if (!isDatabaseError) {
          console.error("Failed to fetch product", error)
        }
        const errorMsg = error?.message?.includes("404") || error?.status === 404
          ? "Product not found. It may have been deleted."
          : isDatabaseError
          ? "Database connection error. Please check backend server and database connection."
          : "Failed to load product. Please try again."
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
        router.push("/dashboard/products")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, getToken, router])

  const handleImageUpload = async (file: File) => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setForm({ ...form, imageUrl: base64String })
        setUploadingImage(false)
        toast({
          title: "Image uploaded",
          description: "Image ready to save",
        })
      }
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read image file",
          variant: "destructive",
        })
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      })
      setUploadingImage(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    setForm({ ...form, imageUrl: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function submit() {
    setSaving(true)
    const token = await getToken()
    if (!token) {
      toast({
        title: "Error",
        description: "Please sign in",
        variant: "destructive",
      })
      setSaving(false)
      return
    }
    try {
      // Prepare form data - use base64 image if uploaded, otherwise use URL, or null if empty
      const imageUrlValue = imagePreview || (form.imageUrl && form.imageUrl.trim() !== '' ? form.imageUrl : null)
      const submitData = {
        ...form,
        imageUrl: imageUrlValue || null,
      }
      
      const res = await serverComms(`admin/products/${id}`, { 
        method: "PATCH", 
        data: submitData, 
        headers: { Authorization: `Bearer ${token}` } 
      })
      if (res.error) {
        // Parse validation errors
        let errorMsg = res.error
        try {
          const errorData = JSON.parse(res.error)
          if (Array.isArray(errorData)) {
            const validationErrors = errorData.map((err: any) => {
              const field = err.path?.[0] || 'field'
              return `${field}: ${err.message || 'Invalid value'}`
            }).join(', ')
            errorMsg = `Validation error: ${validationErrors}`
          }
        } catch {
          // Not JSON, use as is
        }
        
        const isDatabaseError = errorMsg.includes("database") || 
                                errorMsg.includes("Can't reach") ||
                                errorMsg.includes("prisma") ||
                                errorMsg.includes("pooler.supabase") ||
                                errorMsg.includes("findUnique")
        const finalErrorMsg = isDatabaseError
          ? "Database connection error. The backend cannot connect to the database. Please check your Supabase database connection settings in the backend."
          : errorMsg || "Failed to update product"
        toast({
          title: "Error",
          description: finalErrorMsg,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
        router.push("/dashboard/products")
      }
    } catch (error: any) {
      const isDatabaseError = error?.message?.includes("database") || 
                              error?.message?.includes("Can't reach") ||
                              error?.message?.includes("prisma") ||
                              error?.message?.includes("pooler.supabase")
      if (!isDatabaseError) {
        console.error("Failed to update product", error)
      }
      const errorMsg = isDatabaseError
        ? "Database connection error. Please check backend server and database connection."
        : "Failed to update product. Please try again."
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function input<K extends keyof typeof form>(k: K) {
    return (e: any) => setForm({ 
      ...form, 
      [k]: k === "price" || k === "stock" || k === "packSize" ? Number(e.target.value) : e.target.value 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update product information and settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Product name, description, and category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name"
                placeholder="e.g., Apple Fritter" 
                value={form.name} 
                onChange={input("name")} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Describe your product..." 
                value={form.description} 
                onChange={input("description")}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category"
                placeholder="e.g., Specialty, Classic, Seasonal" 
                value={form.category} 
                onChange={input("category")} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Set price, pack size, and stock levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (GBP)</Label>
                <Input 
                  id="price"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={form.price} 
                  onChange={input("price")} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packSize">Pack Size</Label>
                <Select value={String(form.packSize)} onValueChange={(value) => setForm({ ...form, packSize: Number(value) })}>
                  <SelectTrigger id="packSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Single (1)</SelectItem>
                    <SelectItem value="6">Pack of 6</SelectItem>
                    <SelectItem value="12">Pack of 12</SelectItem>
                    <SelectItem value="24">Pack of 24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input 
                id="stock"
                type="number" 
                placeholder="0" 
                value={form.stock} 
                onChange={input("stock")} 
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isActive"
                checked={form.isActive} 
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked as boolean })} 
              />
              <Label 
                htmlFor="isActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Active (visible in store)
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Image</CardTitle>
          <CardDescription>Upload an image or provide an image URL (max 5MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full max-w-md mx-auto">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted">
                <Image
                  src={imagePreview}
                  alt="Product preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="image-upload">Upload Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full sm:w-auto"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground sm:inline">
                    Max 5MB • JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input 
                id="imageUrl"
                placeholder="https://example.com/image.jpg" 
                value={form.imageUrl && !form.imageUrl.startsWith('data:') ? form.imageUrl : ''} 
                onChange={input("imageUrl")} 
                type="url"
                disabled={!!imagePreview}
              />
              <p className="text-xs text-muted-foreground">
                {imagePreview ? "Remove uploaded image to use URL instead" : "Provide a valid image URL starting with http:// or https://"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard/products")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          onClick={submit} 
          disabled={saving || uploadingImage}
          className="min-w-[140px]"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}

