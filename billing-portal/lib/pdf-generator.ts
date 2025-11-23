import jsPDF from "jspdf"
import type { SavedBill } from "./types"

// Helper function to format numbers properly for PDF
function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Helper function to safely add text with rupee symbol
function addText(doc: jsPDF, text: string, x: number, y: number, options?: any) {
  // Replace rupee symbol with "Rs." to avoid encoding issues
  const safeText = text.replace(/₹/g, "Rs. ")
  doc.text(safeText, x, y, options)
}

export function generateBillPDF(bill: SavedBill) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin

  // Header
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("TAX INVOICE", pageWidth / 2, yPos, { align: "center" })
  yPos += 8

  // Bill Details - smaller font
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`Bill ID: ${bill.billId || bill.id}`, margin, yPos)
  yPos += 5
  doc.text(`Bill Name: ${bill.name}`, margin, yPos)
  yPos += 5
  if (bill.vehicleNumber) {
    doc.text(`Vehicle Number: ${bill.vehicleNumber}`, margin, yPos)
    yPos += 5
  }
  const createdDate = new Date(bill.createdAt)
  doc.text(`Date: ${createdDate.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}`, margin, yPos)
  yPos += 5
  doc.text(`Time: ${createdDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`, margin, yPos)
  yPos += 8

  // Items Table - Calculate column widths dynamically
  const hasHsn = bill.items.some((i) => i.hsnCode)
  const availableWidth = pageWidth - (margin * 2)
  
  // Optimized column widths - more compact
  let colWidths: number[]
  if (hasHsn) {
    // Product, HSN, Price, Qty, GST%, Total
    colWidths = [60, 25, 30, 18, 20, 35]
  } else {
    // Product, Price, Qty, GST%, Total (no HSN)
    colWidths = [75, 35, 20, 22, 38]
  }

  // Table Header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  let xPos = margin
  doc.text("Product", xPos, yPos)
  xPos += colWidths[0] + 2
  
  if (hasHsn) {
    doc.text("HSN", xPos, yPos)
    xPos += colWidths[1] + 2
  }
  
  doc.text("Price", xPos, yPos, { align: "right" })
  xPos += colWidths[hasHsn ? 2 : 1] + 2
  doc.text("Qty", xPos, yPos, { align: "right" })
  xPos += colWidths[hasHsn ? 3 : 2] + 2
  doc.text("GST%", xPos, yPos, { align: "right" })
  xPos += colWidths[hasHsn ? 4 : 3] + 2
  doc.text("Total", xPos, yPos, { align: "right" })
  
  yPos += 5
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  // Table Rows - Calculate totals from items
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  
  let subtotal = 0
  let totalGst = 0
  let totalCgst = 0
  let totalSgst = 0

  bill.items.forEach((item) => {
    if (yPos > pageHeight - 50) {
      doc.addPage()
      yPos = margin
    }

    const lineTotal = item.price * item.qty
    const gstRate = item.gstRate || 0
    const gstAmount = (gstRate / 100) * lineTotal
    const itemTotal = lineTotal + gstAmount
    
    subtotal += lineTotal
    totalGst += gstAmount
    if (gstRate === 18) {
      totalCgst += gstAmount / 2
      totalSgst += gstAmount / 2
    }

    xPos = margin
    // Truncate product name if too long
    const productName = item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name
    doc.text(productName, xPos, yPos)
    xPos += colWidths[0] + 2
    
    if (hasHsn) {
      doc.text(item.hsnCode || "-", xPos, yPos)
      xPos += colWidths[1] + 2
    }
    
    // Format numbers properly - shorter format
    addText(doc, formatNumber(item.price), xPos, yPos, { align: "right" })
    xPos += colWidths[hasHsn ? 2 : 1] + 2
    doc.text(String(item.qty), xPos, yPos, { align: "right" })
    xPos += colWidths[hasHsn ? 3 : 2] + 2
    doc.text(`${gstRate}%`, xPos, yPos, { align: "right" })
    xPos += colWidths[hasHsn ? 4 : 3] + 2
    addText(doc, formatNumber(itemTotal), xPos, yPos, { align: "right" })
    
    yPos += 5
  })

  yPos += 3
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 5

  // Calculate final total from items (not from bill.total which might include debit adjustments)
  const calculatedTotal = subtotal + totalGst

  // Totals Section - Smaller and more compact
  const totalsX = pageWidth - margin - 50
  
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("Subtotal:", totalsX, yPos, { align: "right" })
  addText(doc, `Rs. ${formatNumber(subtotal)}`, pageWidth - margin, yPos, { align: "right" })
  yPos += 5

  // Check if CGST/SGST should be shown (if any item has 18% GST)
  const hasCgstSgst = bill.items.some((i) => (i.gstRate || 0) === 18)
  
  if (hasCgstSgst && totalCgst > 0) {
    doc.text("CGST (9%):", totalsX, yPos, { align: "right" })
    addText(doc, `Rs. ${formatNumber(totalCgst)}`, pageWidth - margin, yPos, { align: "right" })
    yPos += 5
    doc.text("SGST (9%):", totalsX, yPos, { align: "right" })
    addText(doc, `Rs. ${formatNumber(totalSgst)}`, pageWidth - margin, yPos, { align: "right" })
    yPos += 5
  } else {
    doc.text("GST Total:", totalsX, yPos, { align: "right" })
    addText(doc, `Rs. ${formatNumber(totalGst)}`, pageWidth - margin, yPos, { align: "right" })
    yPos += 5
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Total:", totalsX, yPos, { align: "right" })
  addText(doc, `Rs. ${formatNumber(calculatedTotal)}`, pageWidth - margin, yPos, { align: "right" })
  yPos += 8

  // Signature Area
  if (yPos > pageHeight - 50) {
    doc.addPage()
    yPos = margin
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8
  
  const signatureY = pageHeight - 35
  doc.text("Authorized Signature", margin, signatureY)
  doc.text("Company Stamp", pageWidth - margin, signatureY, { align: "right" })
  
  // Draw signature box
  doc.rect(margin, signatureY - 12, 55, 18)
  doc.rect(pageWidth - margin - 55, signatureY - 12, 55, 18)

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(128, 128, 128)
  doc.text(
    "This is a computer-generated invoice.",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  )

  // Generate filename
  const filename = `Bill_${bill.billId || bill.id}_${new Date(bill.createdAt).toISOString().split("T")[0]}.pdf`
  
  doc.save(filename)
}
