const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middilware/check-auth');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limit: {fileSize: 1024 * 1024 * 5},
    fileFilter: fileFilter,
});
// Add a new product
router.post('/', upload.single('productImage'),checkAuth, async (req, res, next) => {
    console.log(req.file);
    // Check if the request body contains a name field
    if (!req.body || !req.body.name) {
        res.status(400).json({
            error: 'Missing name in request body',
        });
        return;
    }

    // Create a new product object
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path,
    });

    try {
        // Save the product to the database
        const result = await product.save();

        // Add the product URL to the response
        const productUrl = `${process.env.BASE_URL}products/${result._id}`;

        // Return a JSON response with the created product and its URL
        res.status(201).json({
            message: 'Product created successfully',
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price,
                request: {
                    type: 'GET',
                    url: productUrl,
                },
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err,
        });
    }
});
// Get all products
router.get('/', (req, res, next) => {
    Product.find().select('name price _id productImage').lean().exec()
        .then((products) => {
            if (products.length >= 0) {
                const count = products.length;
                res.status(200).json({
                    count: count, products: products.map(product => {
                        return {
                            _id: product._id,
                            name: product.name,
                            price: product.price,
                            productImage: `${process.env.BASE_URL}` + product.productImage,
                            request: {
                                type: "GET",
                                url: `${process.env.BASE_URL}products/${product._id}`
                            }
                        }
                    })
                });
            } else {
                res.status(404).json({message: 'No products found'});
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({message: 'Server error'});
        });
});

// Get a specific product by ID
router.get('/:productId', async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId).select('name price');
        if (product) {
            res.status(200).json({
                product: product,
                request: {
                    type: "GET",
                    url: `${process.env.BASE_URL}products/`
                }
            });
        } else {
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

// Update a specific product by ID
router.put('/:productId',checkAuth, async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            req.body,
            {new: true}
        ).select('name price');
        if (updatedProduct) {
            res.status(200).json({
                message: "Updated Done",
                updatedProduct: updatedProduct,
                request: {
                    type: "GET",
                    url: `${process.env.BASE_URL}products/${productId}`
                }
            });
        } else {
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

// Partially update a specific product by ID
router.patch('/:productId',checkAuth, async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            req.body,
            {new: true}
        ).select('name price');
        if (updatedProduct) {
            res.status(200).json(
                {
                    message: "Updated Done",
                    updatedProduct: updatedProduct,
                    request: {
                        type: "GET",
                        url: `${process.env.BASE_URL}products/${productId}`
                    }
                });
        } else {
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

// Delete a specific product by ID
router.delete('/:productId', checkAuth,async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (deletedProduct) {
            res.status(200).json(
                {
                    message: 'Product deleted successfully',
                    request: {
                        type: "POST",
                        url: `${process.env.BASE_URL}products/`,
                        body: {name: 'String', price: 'Number'}
                    }
                });
        } else {
            res.status(404).json({message: 'Product not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;