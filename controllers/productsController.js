'use strict'

let controller = {};
const models = require('../models');
const sequelize = require('sequelize');
const Op = sequelize.Op;

controller.getData = async (req, res, next) => {
    //Lay tat ca cac category dua len view
    let categories = await models.Category.findAll({
        attributes: ['id', 'name'],
        include: [{
            model: models.Product,  //lien ket voi bang Product
        }]
    });
    res.locals.categories = categories;
    //Lay tat ca cac brand dua len view
    let brands = await models.Brand.findAll({
        attributes: ['id', 'name'],
        include: [{
            model: models.Product,  //lien ket voi bang Product
        }]
    });
    res.locals.brands = brands;
    //Lay tat ca cac tag dua len view
    let tags = await models.Tag.findAll();
    res.locals.tags = tags;

    next(); //go to next middleware
};

controller.show = async (req, res) => {
    let category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
    let brand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);
    let tag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);
    let keyword = req.query.keyword || '';
    let sort =['price', 'newest', 'popular'].includes(req.query.sort) ? req.query.sort : 'price';
    let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page));

    let options = {
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
        where: {},
    };
    if (category > 0) {
        options.where.categoryId = category;
    }

    if (brand > 0) {
        options.where.brandId = brand;
    }

    if (tag > 0) {
        // options.include.push({
        //     model: models.ProductTag,
        //     where: { tagId: tag }
        // });
        options.include = [{
            model: models.Tag,
            where: { id: tag}
        }];
    }

    if (keyword.trim() != '') {
        options.where.name = {
            [Op.iLike]: `%${keyword}%`
        }
    }
    switch (sort) {
        case 'newest':
            options.order = [['createdAt', 'DESC']];
            break;
        case 'popular':
            options.order = [['stars', 'DESC']];
            break;
        default:
            options.order = [['price', 'ASC']];
            break;
    }
    res.locals.sort = sort;
    res.locals.originalUrl = removeParam('sort', req.originalUrl);   //lay duoc url duoc truy cap va dua len view
    if(Object.keys(req.query).length == 0){
        res.locals.originalUrl = req.originalUrl + '?'; //neu khong co query thi them dau ? vao cuoi url       
    }

    const limit = 6;    //so luong san pham tren 1 trang
    //0 -> 5, 6 -> 11, 12 -> 17,...
    options.limit = limit;  //gioi han so luong san pham tren 1 trang
    options.offset = limit * (page - 1); //vi tri bat dau lay san pham. Vi du page = 2 thi offset = 6
    let { rows, count} = await models.Product.findAndCountAll(options); //rows: mang chua san pham, count: tong so san pham
    res.locals.pagination = {
        page: page, 
        limit:limit,
        totalRows: count, 
        queryParams: req.query
    }

    //let products = await models.Product.findAll(options);
    res.locals.products = rows;
    res.render('product-list');
};

controller.showDetail = async (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    let product = await models.Product.findOne({
        attributes: ['id', 'name', 'stars', 'price', 'oldPrice', 'summary', 'description', 'specification'],
        where: { id },
        include: [{
            model: models.Image,
            attributes: ['name', 'imagePath'],
        }, {
            model: models.Review,
            attributes: ['id', 'review', 'stars', 'createdAt'],
            include: [{
                model: models.User,
                attributes: ['firstName', 'lastName'],
            }]
        }, {
            model: models.Tag,
            attributes: ['id',]
        },
    ]
    });
    res.locals.product = product;

    let tagIds = [];
    product.Tags.forEach(tag => { tagIds.push(tag.id) });   //lay tat ca id cua tag cua san pham dang xem

    let relatedProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'price', 'oldPrice'],
        include: [{
            model: models.Tag,
            attributes: ['id'],
            where: { id: { [Op.in]: tagIds} }
        }],
        limit: 10,
    });
    res.locals.relatedProducts = relatedProducts;

    res.render('product-detail');
};

function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}
module.exports = controller;