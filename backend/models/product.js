import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    name:{
        type: String ,
        require: true,
        unique:true
    },
    discription:{
        type: String ,
    },
    price:{
        type: Number ,
        require: true,
    },
    inStock:{
        type: Number ,
        require: true,
    },
    image:{
        type: String ,
        require: true,
    },
    HSNC_code:{
        type: String ,
        require: true,
        unique:true
    },
    metadata: {
        colorvalues: [String],
        sizevalues: [String],
        brandvalues: [String]
    },
    IsVisible:{
        type: Boolean ,
        default: true
    },
    ISBillingAvailable:{
        type: Boolean ,
        default: false
    },
})

export default mongoose.model("products" , productSchema)