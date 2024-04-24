'use strict'

let controller = {};
let models = require('../models');

controller.add = async (req, res) => {
    let id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);    //id san pham
    let quantity = isNaN(req.body.quantity) ? 0 : parseInt(req.body.quantity);  //so luong san pham

    let product = await models.Product.findByPk(id);
    if (product && quantity > 0) {
        req.session.cart.add(product, quantity);    //them san pham vao gio hang
    }
    return res.json({ quantity: req.session.cart.quantity });  //tra ve so luong san pham trong gio hang
}

controller.show = (req, res) => {
    res.locals.cart = req.session.cart.getCart();  //lay gio hang tu session
    return res.render('cart');
}

controller.update = async (req, res) => {
    let id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);    //id san pham
    let quantity = isNaN(req.body.quantity) ? 0 : parseInt(req.body.quantity);  //so luong san pham

    let product = await models.Product.findByPk(id);
    if (quantity > 0) {
        let updatedItem = req.session.cart.update(id, quantity);    //them san pham vao gio hang
    
        return res.json({ 
            item: updatedItem,
            quantity: req.session.cart.quantity,  //tra ve so luong san pham trong gio hang   
            subtotal: req.session.cart.subtotal,  
            total: req.session.cart.total
        });
    }
    res.sendStatus(204).end();  //tra ve status 204
}

controller.remove = (req, res) => {
    let id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);    //id san pham
    req.session.cart.remove(id);    //xoa san pham khoi gio hang
    return res.json({ 
        quantity: req.session.cart.quantity,
        subtotal: req.session.cart.subtotal, 
        total: req.session.cart.total
    });
}

controller.clear = (req, res) => {
    req.session.cart.clear()  //xoa toan bo gio hang
    return res.sendStatus(200).end();
}
module.exports = controller;