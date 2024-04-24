//express is a node module for building web server
'use strict'
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const expressHbs = require('express-handlebars');
const {createStarList} = require('./controllers/handlebarsHelper');  //import helper
const { createPagination} = require('express-handlebars-paginate');  //import helper
const session = require('express-session')

//cau hinh public static folder
app.use(express.static(__dirname + '/public'));

//cau hinh su dung express-handblebars
app.engine('hbs', expressHbs.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    },
    helpers: {
        createStarList,
        createPagination,
    },
}))
app.set('view engine', 'hbs');

//Cau hinh doc du lieu post tu body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));  

//cau hinh session - cai dat session: pnpm install express-session || pnpm i -s express-session
app.use(session({
    secret: 'S3cret', //chuoi bi mat de ma hoa session id 
    resave: false,  //session chi duoc luu lai khi co su thay doi 
    saveUninitialized: false,   //session duoc tao ra ngay lap tuc ma khong can su kien gi xay ra 
    cookie: {
        httpOnly: true,
        maxAge: 20 * 60 * 1000  //20 minutes = 20ph * 60s * 1000ms
    }
}))


//middleware tao gio hang
app.use((req, res, next) => { 
    let Cart = require('./controllers/cart');
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});  //tao gio hang moi neu chua co gio hang trong session 
    res.locals.quantity = req.session.cart.quantity;

    next();
});
//routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/usersRouter'));

//cau hinh 404
app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page not found!' });
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error!' });
});
//khoi dong web server
app.listen(port, () => { 
    console.log(`Server is running on port ${port}`);

});
