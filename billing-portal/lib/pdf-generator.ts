import jsPDF from "jspdf"
import type { SavedBill } from "./types"
import { sellerInfo, isMaharashtraGst } from "./seller-config"

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

  // Check if GST is enabled
  const hasGst = bill.items.some((i) => (i.gstRate || 0) > 0)
  
  // Check if buyer is from Maharashtra (for CGST/SGST vs IGST)
  const buyerGstNumber = bill.buyerInfo?.gstNumber
  const isSameState = isMaharashtraGst(buyerGstNumber) // If buyer is from Maharashtra, use CGST/SGST

  // Add logo background (if available) - top left
  if (sellerInfo.logo) {
    try {
      doc.addImage(sellerInfo.logo, "PNG", margin, yPos, 40, 40)
    } catch (e) {
      // If logo fails to load, continue without it
    }
  }

  // Seller Information - Top Left (reduced font size)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(sellerInfo.shopName, margin, yPos + 5)
  yPos += 10 // Increased bottom space after heading
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(`Address: ${sellerInfo.address}`, margin, yPos)
  yPos += 4
  doc.text(`State: ${sellerInfo.state}, Code: ${sellerInfo.stateCode}`, margin, yPos)
  yPos += 4
  doc.text(`GSTIN/UIN: ${sellerInfo.gstNumber}`, margin, yPos)
  yPos += 4
  doc.text(`Mobile No: ${sellerInfo.phone}`, margin, yPos)
  yPos += 4
  doc.text(`E-Mail: ${sellerInfo.email}`, margin, yPos)
  yPos += 8

  // Invoice Details - Top Right (moved more to the right)
  const invoiceX = pageWidth - margin - 30
  let invoiceY = margin
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("TAX INVOICE", pageWidth / 2, invoiceY, { align: "center" })
  invoiceY += 8
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(`INVOICE NO: ${bill.billId || bill.id}`, invoiceX, invoiceY, { align: "right" })
  invoiceY += 4
  const createdDate = new Date(bill.createdAt)
  doc.text(`DATE: ${createdDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, invoiceX, invoiceY, { align: "right" })
  invoiceY += 4
  
  // Replace MODE with DELIVERY
  if (bill.delivery) {
    doc.text(`DELIVERY: ${bill.delivery}`, invoiceX, invoiceY, { align: "right" })
    invoiceY += 4
  }

  // Buyer Information Section (removed heading)
  yPos = Math.max(yPos, invoiceY + 10)
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  const buyerName = bill.buyerInfo?.name || bill.name || "Customer"
  doc.text(`Buyer's Name: ${buyerName}`, margin, yPos)
  yPos += 4
  
  if (bill.buyerInfo?.address) {
    doc.text(`Address: ${bill.buyerInfo.address}`, margin, yPos)
    yPos += 4
  }
  
  if (bill.buyerInfo?.phone) {
    doc.text(`Mobile No: ${bill.buyerInfo.phone}`, margin, yPos)
    yPos += 4
  }
  
  if (bill.buyerInfo?.gstNumber) {
    doc.text(`GSTIN/UIN: ${bill.buyerInfo.gstNumber}`, margin, yPos)
    yPos += 4
  }
  
  if (bill.vehicleNumber) {
    doc.text(`Vehicle Number: ${bill.vehicleNumber}`, margin, yPos)
    yPos += 4
  }
  
  yPos += 5

  // Items Table
  const hasHsn = bill.items.some((i) => i.hsnCode)
  
  // Column widths - adjusted for better fit
  let colWidths: number[]
  const tableStartX = margin
  const tableEndX = pageWidth - margin
  
  if (hasHsn) {
    // SRNO, DESCRIPTION, HSN/SAC, GST RATE, QTY, RATE, AMOUNT
    if (hasGst) {
      colWidths = [8, 48, 24, 17, 20, 28, 33] // Increased QTY from 18 to 20, adjusted others
    } else {
      colWidths = [8, 58, 28, 0, 22, 33, 38] // Increased QTY from 20 to 22, adjusted others
    }
  } else {
    // SRNO, DESCRIPTION, GST RATE, QTY, RATE, AMOUNT (no HSN)
    if (hasGst) {
      colWidths = [8, 63, 17, 20, 28, 38] // Increased QTY from 18 to 20, adjusted others
    } else {
      colWidths = [8, 78, 0, 22, 33, 43] // Increased QTY from 20 to 22, adjusted others
    }
  }

  // Table Header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  let xPos = tableStartX
  doc.text("SRNO", xPos, yPos)
  xPos += colWidths[0] + 1
  
  doc.text("DESCRIPTION OF GOODS", xPos, yPos)
  xPos += colWidths[1] + 1
  
  if (hasHsn) {
    doc.text("HSN/SAC", xPos, yPos)
    xPos += colWidths[2] + 1
  }
  
  if (hasGst) {
    doc.text("GST RATE", xPos, yPos, { align: "right" })
    xPos += colWidths[hasHsn ? 3 : 2] + 1
  }
  
  const qtyIndex = hasHsn ? (hasGst ? 4 : 3) : (hasGst ? 3 : 2)
  doc.text("QTY", xPos, yPos, { align: "right" })
  xPos += colWidths[qtyIndex] + 1
  
  const rateIndex = hasHsn ? (hasGst ? 5 : 4) : (hasGst ? 4 : 3)
  doc.text("RATE", xPos, yPos, { align: "right" })
  xPos += colWidths[rateIndex] + 1
  
  const amountIndex = hasHsn ? (hasGst ? 6 : 5) : (hasGst ? 5 : 4)
  doc.text("AMOUNT", xPos, yPos, { align: "right" })
  
  yPos += 4
  doc.line(tableStartX, yPos, tableEndX, yPos)
  yPos += 4

  // Table Rows - Calculate totals from items
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  
  let subtotal = 0
  let totalGst = 0
  let totalCgst = 0
  let totalSgst = 0
  let totalIgst = 0

  bill.items.forEach((item, index) => {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = margin
    }

    const lineTotal = item.price * item.qty
    const gstRate = item.gstRate || 0
    const gstAmount = (gstRate / 100) * lineTotal
    const itemTotal = lineTotal + gstAmount
    
    subtotal += lineTotal
    totalGst += gstAmount
    
    // Calculate CGST/SGST or IGST based on buyer state
    if (gstRate > 0) {
      if (isSameState) {
        // Same state (Maharashtra): Split into CGST and SGST (9% each for 18% GST)
        if (gstRate === 18) {
          totalCgst += gstAmount / 2
          totalSgst += gstAmount / 2
        } else {
          // For other GST rates in same state, still split equally
          totalCgst += gstAmount / 2
          totalSgst += gstAmount / 2
        }
      } else {
        // Different state or no GST number: Use IGST
        totalIgst += gstAmount
      }
    }

    xPos = tableStartX
    doc.text(String(index + 1), xPos, yPos)
    xPos += colWidths[0] + 1
    
    // Truncate product name if too long
    const productName = item.name.length > 30 ? item.name.substring(0, 27) + "..." : item.name
    doc.text(productName, xPos, yPos)
    xPos += colWidths[1] + 1
    
    if (hasHsn) {
      doc.text(item.hsnCode || "-", xPos, yPos)
      xPos += colWidths[2] + 1
    }
    
    if (hasGst) {
      doc.text(`${gstRate}%`, xPos, yPos, { align: "right" })
      xPos += colWidths[hasHsn ? 3 : 2] + 1
    }
    
    const qtyIndex = hasHsn ? (hasGst ? 4 : 3) : (hasGst ? 3 : 2)
    doc.text(String(item.qty), xPos, yPos, { align: "right" })
    xPos += colWidths[qtyIndex] + 1
    
    const rateIndex = hasHsn ? (hasGst ? 5 : 4) : (hasGst ? 4 : 3)
    addText(doc, formatNumber(item.price), xPos, yPos, { align: "right" })
    xPos += colWidths[rateIndex] + 1
    
    const amountIndex = hasHsn ? (hasGst ? 6 : 5) : (hasGst ? 5 : 4)
    addText(doc, formatNumber(lineTotal), xPos, yPos, { align: "right" })
    
    yPos += 4
  })

  yPos += 3
  doc.line(tableStartX, yPos, tableEndX, yPos)
  yPos += 5

  // Summary of Charges
  const totalsX = pageWidth - margin - 50
  
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("Total Amount Before Tax:", totalsX, yPos, { align: "right" })
  addText(doc, `Rs. ${formatNumber(subtotal)}`, pageWidth - margin, yPos, { align: "right" })
  yPos += 5

  // Show CGST/SGST if same state, IGST if different state
  if (hasGst && totalGst > 0) {
    if (isSameState && totalCgst > 0) {
      doc.text("Add: CGST-:", totalsX, yPos, { align: "right" })
      doc.text("9%", totalsX + 20, yPos)
      addText(doc, `Rs. ${formatNumber(totalCgst)}`, pageWidth - margin, yPos, { align: "right" })
      yPos += 5
      
      doc.text("Add: SGST-:", totalsX, yPos, { align: "right" })
      doc.text("9%", totalsX + 20, yPos)
      addText(doc, `Rs. ${formatNumber(totalSgst)}`, pageWidth - margin, yPos, { align: "right" })
      yPos += 5
    } else if (!isSameState && totalIgst > 0) {
      doc.text("Add: IGST-:", totalsX, yPos, { align: "right" })
      const igstRate = bill.items.find((i) => (i.gstRate || 0) > 0)?.gstRate || 18
      doc.text(`${igstRate}%`, totalsX + 20, yPos)
      addText(doc, `Rs. ${formatNumber(totalIgst)}`, pageWidth - margin, yPos, { align: "right" })
      yPos += 5
    }
    
    doc.text("Total GST Tax -:", totalsX, yPos, { align: "right" })
    const gstRate = bill.items.find((i) => (i.gstRate || 0) > 0)?.gstRate || 18
    doc.text(`${gstRate}%`, totalsX + 20, yPos)
    addText(doc, `Rs. ${formatNumber(totalGst)}`, pageWidth - margin, yPos, { align: "right" })
    yPos += 5
  }

  const calculatedTotal = subtotal + totalGst
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("Total Invoice Amount:", totalsX, yPos, { align: "right" })
  addText(doc, `Rs. ${formatNumber(calculatedTotal)}`, pageWidth - margin, yPos, { align: "right" })
  yPos += 8

  // Amount in Words
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  const amountInWords = convertToWords(calculatedTotal)
  doc.text(`AMOUNT IN WORDS: ${amountInWords}`, margin, yPos)
  yPos += 8

  // Signature Area
  if (yPos > pageHeight - 50) {
    doc.addPage()
    yPos = margin
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 15 // Increased gap for signature space
  
  const signatureY = pageHeight - 35
  doc.text(`FOR ${sellerInfo.shopName}`, margin, signatureY - 10) // Moved up to create gap
  doc.text("Authorised signatory", margin, signatureY + 2) // Moved down to create gap
  
  // Draw signature box (wider to accommodate signature/stamp)
  doc.rect(margin, signatureY - 15, 85, 25) // Increased width from 60 to 85

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

// Helper function to convert number to words (simplified version)
function convertToWords(num: number): string {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"]
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
  
  if (num === 0) return "zero rupees only"
  
  const rupees = Math.floor(num)
  const paise = Math.round((num - rupees) * 100)
  
  function convertHundreds(n: number): string {
    if (n === 0) return ""
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) {
      const ten = Math.floor(n / 10)
      const one = n % 10
      return tens[ten] + (one > 0 ? " " + ones[one] : "")
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100)
      const remainder = n % 100
      return ones[hundred] + " hundred" + (remainder > 0 ? " " + convertHundreds(remainder) : "")
    }
    return ""
  }
  
  function convertThousands(n: number): string {
    if (n < 1000) return convertHundreds(n)
    const thousand = Math.floor(n / 1000)
    const remainder = n % 1000
    return convertHundreds(thousand) + " thousand" + (remainder > 0 ? " " + convertHundreds(remainder) : "")
  }
  
  function convertLakhs(n: number): string {
    if (n < 100000) return convertThousands(n)
    const lakh = Math.floor(n / 100000)
    const remainder = n % 100000
    return convertHundreds(lakh) + " lakh" + (remainder > 0 ? " " + convertThousands(remainder) : "")
  }
  
  function convertCrores(n: number): string {
    if (n < 10000000) return convertLakhs(n)
    const crore = Math.floor(n / 10000000)
    const remainder = n % 10000000
    return convertHundreds(crore) + " crore" + (remainder > 0 ? " " + convertLakhs(remainder) : "")
  }
  
  let result = convertCrores(rupees)
  result = result.charAt(0).toUpperCase() + result.slice(1)
  result += " rupees"
  
  if (paise > 0) {
    result += " and " + convertHundreds(paise) + " paise"
  }
  
  result += " only"
  return result
}
