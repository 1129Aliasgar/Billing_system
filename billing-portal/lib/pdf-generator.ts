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

// Helper function to load image as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error("Error loading image:", error)
    return null
  }
}

export async function generateBillPDF(bill: SavedBill) {
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

  // Add full-cover background image with overlay for readability
  try {
    const backgroundImage = await loadImageAsBase64("/icon.jpg")
    if (backgroundImage) {
      // Add background image first (full cover)
      doc.addImage(backgroundImage, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST", 0)
      
      // Add semi-transparent white overlay on top for text readability
      // Using a light white fill with reduced opacity effect
      doc.setFillColor(255, 255, 255)
      doc.setGState(doc.GState({ opacity: 0.75 }))
      doc.rect(0, 0, pageWidth, pageHeight, "F")
      doc.setGState(doc.GState({ opacity: 1 }))
    } else {
      // If image fails to load, use white background
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, pageWidth, pageHeight, "F")
    }
  } catch (error) {
    // If background fails to load, continue with white background
    console.warn("Could not load background image:", error)
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, pageWidth, pageHeight, "F")
  }

  // Add logo (if available) - top left
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

  // Items Table - Proper Grid Layout
  const hasHsn = bill.items.some((i) => i.hsnCode)
  
  const tableStartX = margin
  const tableEndX = pageWidth - margin
  const columnGap = 2 // Gap between columns
  
  // Calculate column positions based on available width
  // We'll use a percentage-based approach to ensure proper spacing
  let columnPositions: number[] = []
  let columnWidths: number[] = []
  let numColumns = 0
  
  if (hasHsn && hasGst) {
    // 7 columns: SRNO, DESCRIPTION, HSN/SAC, GST RATE, QTY, RATE, AMOUNT
    numColumns = 7
    const percentages = [0.05, 0.35, 0.12, 0.08, 0.10, 0.12, 0.18] // Total = 1.0
    const totalGapWidth = (numColumns - 1) * columnGap
    const availableWidth = tableEndX - tableStartX - totalGapWidth
    let currentX = tableStartX
    percentages.forEach((percent) => {
      columnPositions.push(currentX)
      const width = availableWidth * percent
      columnWidths.push(width)
      currentX += width + columnGap
    })
  } else if (hasHsn && !hasGst) {
    // 6 columns: SRNO, DESCRIPTION, HSN/SAC, QTY, RATE, AMOUNT
    numColumns = 6
    const percentages = [0.05, 0.40, 0.15, 0.12, 0.13, 0.15]
    const totalGapWidth = (numColumns - 1) * columnGap
    const availableWidth = tableEndX - tableStartX - totalGapWidth
    let currentX = tableStartX
    percentages.forEach((percent) => {
      columnPositions.push(currentX)
      const width = availableWidth * percent
      columnWidths.push(width)
      currentX += width + columnGap
    })
  } else if (!hasHsn && hasGst) {
    // 6 columns: SRNO, DESCRIPTION, GST RATE, QTY, RATE, AMOUNT
    numColumns = 6
    const percentages = [0.05, 0.42, 0.10, 0.12, 0.13, 0.18]
    const totalGapWidth = (numColumns - 1) * columnGap
    const availableWidth = tableEndX - tableStartX - totalGapWidth
    let currentX = tableStartX
    percentages.forEach((percent) => {
      columnPositions.push(currentX)
      const width = availableWidth * percent
      columnWidths.push(width)
      currentX += width + columnGap
    })
  } else {
    // 5 columns: SRNO, DESCRIPTION, QTY, RATE, AMOUNT
    numColumns = 5
    const percentages = [0.05, 0.50, 0.15, 0.15, 0.15]
    const totalGapWidth = (numColumns - 1) * columnGap
    const availableWidth = tableEndX - tableStartX - totalGapWidth
    let currentX = tableStartX
    percentages.forEach((percent) => {
      columnPositions.push(currentX)
      const width = availableWidth * percent
      columnWidths.push(width)
      currentX += width + columnGap
    })
  }

  // Table Header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  let colIdx = 0
  
  doc.text("SRNO", columnPositions[colIdx], yPos)
  colIdx++
  
  doc.text("DESCRIPTION OF GOODS", columnPositions[colIdx], yPos)
  colIdx++
  
  if (hasHsn) {
    doc.text("HSN/SAC", columnPositions[colIdx], yPos)
    colIdx++
  }
  
  if (hasGst) {
    doc.text("GST RATE", columnPositions[colIdx] + columnWidths[colIdx] - 1, yPos, { align: "right" })
    colIdx++
  }
  
  doc.text("QTY", columnPositions[colIdx] + columnWidths[colIdx] - 1, yPos, { align: "right" })
  colIdx++
  
  doc.text("RATE", columnPositions[colIdx] + columnWidths[colIdx] - 1, yPos, { align: "right" })
  colIdx++
  
  doc.text("AMOUNT", columnPositions[colIdx] + columnWidths[colIdx] - 1, yPos, { align: "right" })
  
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

  // Cache background image for reuse on multiple pages
  let cachedBackgroundImage: string | null = null
  try {
    cachedBackgroundImage = await loadImageAsBase64("/icon.jpg")
  } catch (error) {
    // Continue without background
  }

  // Helper function to add background to a page
  const addPageBackground = (doc: jsPDF, bgImage: string | null) => {
    if (bgImage) {
      try {
        doc.addImage(bgImage, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST", 0)
        doc.setFillColor(255, 255, 255)
        doc.setGState(doc.GState({ opacity: 0.75 }))
        doc.rect(0, 0, pageWidth, pageHeight, "F")
        doc.setGState(doc.GState({ opacity: 1 }))
      } catch (error) {
        // Continue without background if it fails
      }
    }
  }

  bill.items.forEach((item, index) => {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      // Add background to new page
      addPageBackground(doc, cachedBackgroundImage)
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

    // Use the grid layout for table rows
    let rowColIdx = 0
    
    // SRNO
    doc.text(String(index + 1), columnPositions[rowColIdx], yPos)
    rowColIdx++
    
    // DESCRIPTION - Truncate if too long
    const productName = item.name.length > 35 ? item.name.substring(0, 32) + "..." : item.name
    doc.text(productName, columnPositions[rowColIdx], yPos, { maxWidth: columnWidths[rowColIdx] })
    rowColIdx++
    
    // HSN/SAC
    if (hasHsn) {
      doc.text(item.hsnCode || "-", columnPositions[rowColIdx], yPos)
      rowColIdx++
    }
    
    // GST RATE
    if (hasGst) {
      doc.text(`${gstRate}%`, columnPositions[rowColIdx] + columnWidths[rowColIdx] - 1, yPos, { align: "right" })
      rowColIdx++
    }
    
    // QTY
    doc.text(String(item.qty), columnPositions[rowColIdx] + columnWidths[rowColIdx] - 1, yPos, { align: "right" })
    rowColIdx++
    
    // RATE
    addText(doc, formatNumber(item.price), columnPositions[rowColIdx] + columnWidths[rowColIdx] - 1, yPos, { align: "right" })
    rowColIdx++
    
    // AMOUNT
    addText(doc, formatNumber(lineTotal), columnPositions[rowColIdx] + columnWidths[rowColIdx] - 1, yPos, { align: "right" })
    
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
    // Add background to new page
    addPageBackground(doc, cachedBackgroundImage)
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
