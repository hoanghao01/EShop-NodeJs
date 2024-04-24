'use strict';

const controller = {};
const models = require('../models');

controller.showHomePage = async (req, res) => {
    const recentProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice', 'createdAt'],
        order: [['createdAt', 'DESC']], //sap xep theo ngay tao giam dan
        limit: 10, //lay 10 ban ghi
    });
    res.locals.recentProducts = recentProducts;
    
    const featuredProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
        order: [['stars', 'DESC']], //sap xep theo so sao giam dan
        limit: 10, //lay 10 ban ghi 
    });
    res.locals.featuredProducts = featuredProducts;

    const categories = await models.Category.findAll(); [1, 2, 3, 4]
    const secondCategory = categories.splice(2, 2); // cat 2 phan tu tu vi tri 2
    const thirdCategory = categories.splice(1, 1);
    res.locals.categoryArray = [categories, secondCategory, thirdCategory];

    const Brand = models.Brand; 
    const brands = await Brand.findAll(); //lay tat ca cac ban ghi trong bang Brand
    //res.locals.brands = brands;
    res.render('index', { brands: brands });
};

controller.showPage = (req, res, next) => {
    //let page = req.params.page;
    const pages = ['cart', 'checkout', 'contact', 'login', 'my-account', 'product-detail',
     'product-list', 'wishlist'];   
    if (pages.includes(req.params.page))
    {
        return res.render(req.params.page);
    }
    next(); //go to next middleware
    
};

module.exports = controller;