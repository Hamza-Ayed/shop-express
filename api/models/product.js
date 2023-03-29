const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: [true, 'Please provide a product name']}, // This will show a custom message if name is missing
    price: {type: Number, required: [true, 'Please provide a Number for Price']},
    productImage:{type:String,required:true}
});

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;