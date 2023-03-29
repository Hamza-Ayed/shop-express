const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const mongoose = require('mongoose');
const checkAuth =require('../middilware/check-auth');
// Get all orders
router.get('/', checkAuth,async (req, res, next) => {
    try {
        const orders = await Order.find().select('_id quantity date product').populate('product', 'name price');
        if (orders.length >= 0) {
            const count = orders.length;
            const totalPrice = orders.reduce((acc, order) => {
                return acc + order.quantity * order.product.price;
            }, 0);

            res.status(200).json({
                count: count,
                totalPrice: totalPrice,
                orders: orders.map(order => {
                    const totalCost = order.quantity * order.product.price;
                    return {
                        _id: order._id,
                        quantity: order.quantity,
                        product: order.product,
                        totalCost: totalCost,
                        date: order.date,
                        request: {
                            type: "GET",
                            url: `${process.env.BASE_URL}orders/${order._id}`
                        }
                    }
                })
            });
        } else {
            res.status(404).json({message: 'No orders found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

// Add a new order
router.post('/',checkAuth, async (req, res, next) => {
    // Check if the request body contains a product ID field
    if (!req.body || !req.body.productId) {
        res.status(400).json({
            error: 'Missing product ID in request body',
        });
        return;
    }
    console.log(req.body)
    // Check if the product ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.body.productId)) {
        res.status(400).json({
            error: 'Invalid product ID in request body',
        });
        return;
    }

    // Create a new order
    const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity, // Default quantity is 1
    });

    try {
        const result = await order.save();
        res.status(201).json({
            message: 'Order created',
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity,
                request: {
                    type: "GET",
                    url: `${process.env.BASE_URL}orders/${result._id}`
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

// Get a specific order by ID
router.get('/:orderId',checkAuth, async (req, res, next) => {
    const orderId = req.params.orderId;

    try {
        const order = await Order.findById(orderId).select('_id quantity product date').populate('product', 'name price');
        const totalCost = order.quantity * order.product.price;
        if (order) {
            res.status(200).json({
                order: {
                    _id: order._id,
                    product: order.product,
                    quantity: order.quantity,
                    totalCost: totalCost,
                    date: order.date,
                    request: {
                        type: "GET",
                        url: `${process.env.BASE_URL}orders`
                    }
                }
            });
        } else {
            res.status(404).json({message: 'Order not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

// Delete a specific order by ID
router.delete('/:orderId',checkAuth, async (req, res, next) => {
    const orderId = req.params.orderId;

    try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (deletedOrder) {
            res.status(200).json({
                message: 'Order deleted successfully',
                request: {
                    type: "POST",
                    url: `${process.env.BASE_URL}orders/`,
                    body: {productId: 'String', quantity: 'Number'}
                }
            });
        } else {
            res.status(404).json({message: 'Order not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

// Update a specific order by ID
router.put('/:orderId',checkAuth, async (req, res, next) => {
    const orderId = req.params.orderId;

    try {
        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {product: req.body.productId, quantity: req.body.quantity || 1},
            {new: true}
        ).select('_id product quantity');
        if (updatedOrder) {
            res.status(200).json({
                message: 'Order updated',
                updatedOrder: {
                    _id: updatedOrder._id,
                    product: updatedOrder.product,
                    quantity: updatedOrder.quantity,
                    request: {
                        type: "GET",
                        url: `${process.env.BASE_URL}orders/${updatedOrder._id}`
                    }
                }
            });
        } else {
            res.status(404).json({message: 'Order not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

// Partially update a specific order by ID
router.patch('/:orderId',checkAuth, async (req, res, next) => {
    const orderId = req.params.orderId;

    try {
        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {$set: {product: req.body.productId, quantity: req.body.quantity || 1}},
            {new: true}
        ).select('_id product quantity');
        if (updatedOrder) {
            res.status(200).json({
                message: 'Order updated',
                updatedOrder: {
                    _id: updatedOrder._id,
                    product: updatedOrder.product,
                    quantity: updatedOrder.quantity,
                    request: {
                        type: "GET",
                        url: `${process.env.BASE_URL}orders/${updatedOrder._id}`
                    }
                }
            });
        } else {
            res.status(404).json({message: 'Order not found'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;