export type Product = {
  _id: string
  name: string
  discription?: string
  price: number
  inStock: number
  image: string
  HSNC_code: string
  metadata?: {
    colorvalues?: string[]
    sizevalues?: string[]
    brandvalues?: string[]
  }
  IsVisible: boolean
}
