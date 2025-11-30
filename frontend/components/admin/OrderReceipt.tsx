"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { formatPrice } from "../../lib/utils"
import { formatCurrency } from "../../lib/frontend-utils"
import Image from "next/image"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Download } from "lucide-react"
import { useRef } from "react"

type OrderItem = {
  id: string
  product: {
    id: string
    name: string
    imageUrl?: string | null
  }
  quantity: number
  unitPrice: number
}

type OrderDetail = {
  id: string
  orderNumber?: string | null
  status: string
  totalAmount: number
  pointsRedeemed?: number
  stripeId?: string | null
  createdAt: string
  user?: {
    firstName?: string | null
    lastName?: string | null
    email: string
  } | null
  items: OrderItem[]
}

type OrderReceiptProps = {
  order: OrderDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderReceipt({ order, open, onOpenChange }: OrderReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  
  if (!order) return null

  const customerName = order.user 
    ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email
    : 'Customer'

  const orderDate = new Date(order.createdAt)
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const handleDownloadPDF = () => {
    if (!receiptRef.current) return
    
    // Create a new window with the receipt content
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const receiptHTML = receiptRef.current.innerHTML
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${order.orderNumber || order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1a1a1a;
            }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #7C3819; }
            .order-info { margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
            .info-label { color: #666; font-size: 14px; flex-shrink: 0; }
            .info-value { font-weight: 600; text-align: right; }
            .items { margin: 30px 0; }
            .item { display: flex; justify-content: space-between; align-items: flex-start; padding: 15px 0; border-bottom: 1px solid #e5e5e5; }
            .item-left { flex: 1; min-width: 0; }
            .item-name { font-weight: 600; }
            .item-details { color: #666; font-size: 14px; margin-top: 5px; }
            .item-price { font-weight: 600; text-align: right; white-space: nowrap; margin-left: 20px; }
            .total { display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: bold; margin: 20px 0; padding: 20px 0; border-top: 2px solid #1a1a1a; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
            .badge-completed { background: #10b981; color: white; }
            .badge-pending { background: #fbbf24; color: white; }
            .badge-in_process { background: #f59e0b; color: white; }
            .badge-packed { background: #8b5cf6; color: white; }
            .badge-dispatched { background: #3b82f6; color: white; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
              <img src="/logo.svg" alt="Doughlicious" style="height: 300px; width: 300px; object-fit: contain;" />
            </div>
            <p style="color: #666; font-size: 14px;">Thank you for your business!</p>
          </div>
          
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">Order Number:</span>
              <span class="info-value">${order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date & Time:</span>
              <span class="info-value">${formattedDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="badge badge-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' ')}</span>
            </div>
            ${order.stripeId ? `
            <div class="info-row">
              <span class="info-label">Transaction ID:</span>
              <span class="info-value" style="font-family: monospace; font-size: 12px;">${order.stripeId}</span>
            </div>
            ` : ''}
          </div>

          <div class="order-info">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 10px;">Customer</h3>
            <p style="font-weight: 600;">${customerName}</p>
            ${order.user?.email ? `<p style="color: #666; font-size: 14px;">${order.user.email}</p>` : ''}
          </div>

          <div class="items">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 15px;">Items</h3>
            ${order.items.map(item => `
              <div class="item">
                <div class="item-left">
                  <div class="item-name">${item.product.name}</div>
                  <div class="item-details">Qty: ${item.quantity} × ${formatPrice(item.unitPrice)}</div>
                </div>
                <div class="item-price">${formatPrice(item.unitPrice * item.quantity)}</div>
              </div>
            `).join('')}
          </div>

          ${order.pointsRedeemed && order.pointsRedeemed > 0 ? `
          <div class="info-row" style="color: #10b981; font-weight: 600;">
            <span class="info-label">Points Redeemed:</span>
            <span class="info-value">${order.pointsRedeemed} Dough (${formatCurrency(order.pointsRedeemed / 10)})</span>
          </div>
          ` : ''}

          <div class="total">
            <span>Total:</span>
            <span>${formatCurrency(order.totalAmount)}</span>
          </div>

          ${order.status === 'completed' ? `
          <div class="info-row" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e5e5;">
            <span class="info-label" style="color: #7C3819; font-weight: 600;">Points Earned:</span>
            <span class="info-value" style="color: #7C3819; font-weight: 600;">${Math.floor(order.totalAmount)} Dough</span>
          </div>
          ` : ''}

          <div class="footer">
            <p>We appreciate your business!</p>
            <p style="margin-top: 10px; font-size: 12px;">For any questions, please contact our support team.</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(fullHTML)
    printWindow.document.close()
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <DialogTitle className="text-center text-2xl flex-1">Order Receipt</DialogTitle>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div ref={receiptRef} className="space-y-6 py-4">
          {/* Logo and Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-2">
              <img src="/logo.svg" alt="Doughlicious" className="h-[300px] w-[300px] object-contain" />
            </div>
            <p className="text-sm text-muted-foreground">Thank you for your business!</p>
          </div>

          <Separator />

          {/* Order Information */}
          <div className="space-y-3">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-muted-foreground flex-shrink-0">Order Number:</span>
              <span className="font-mono font-bold text-lg text-right">
                {order.orderNumber || `#${order.id.slice(0, 8).toUpperCase()}`}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-muted-foreground flex-shrink-0">Date & Time:</span>
              <span className="font-medium text-right">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-muted-foreground flex-shrink-0">Status:</span>
              <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' ')}
              </Badge>
            </div>
            {order.stripeId && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-sm text-muted-foreground flex-shrink-0">Transaction ID:</span>
                <span className="font-mono text-xs text-right break-all">{order.stripeId}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Customer</h3>
            <p className="font-medium">{customerName}</p>
            {order.user?.email && (
              <p className="text-sm text-muted-foreground">{order.user.email}</p>
            )}
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg border">
                  {item.product.imageUrl && (
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold whitespace-nowrap">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Points Redemption */}
          {order.pointsRedeemed && order.pointsRedeemed > 0 && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-4 text-green-600">
                  <span className="flex-shrink-0 text-sm">Points Redeemed:</span>
                  <span className="text-right font-semibold">
                    {order.pointsRedeemed} Dough ({formatPrice(order.pointsRedeemed / 10)})
                  </span>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Total */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4 text-lg font-bold">
              <span className="flex-shrink-0">Total:</span>
              <span className="text-right">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Points Earned */}
          {order.status === 'completed' && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-4 text-primary">
                  <span className="flex-shrink-0 text-sm font-semibold">Points Earned:</span>
                  <span className="text-right font-bold text-lg">
                    {Math.floor(order.totalAmount)} Dough
                  </span>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Footer */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              We appreciate your business!
            </p>
            <p className="text-xs text-muted-foreground">
              For any questions, please contact our support team.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

