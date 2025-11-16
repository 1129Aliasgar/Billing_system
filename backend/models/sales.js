import mongoose from "mongoose"

const salesSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true
  },
  quantitySold: {
    type: Number,
    required: true,
    min: 1
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2000
  },
  billId: {
    type: String,
    ref: "billing"
  },
  billObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "billing",
    required: false
  }
}, {
  timestamps: true
})

// Compound index to ensure unique sales record per product per month
salesSchema.index({ productId: 1, month: 1, year: 1 }, { unique: true })

export default mongoose.model("sales", salesSchema)

