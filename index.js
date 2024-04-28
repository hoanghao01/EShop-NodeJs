//express is a node module for building web server
'use strict'
require('dotenv').config(); //load bien moi truong tu file .env

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const expressHbs = require('express-handlebars');
const {createStarList} = require('./controllers/handlebarsHelper');  //import helper
const { createPagination} = require('express-handlebars-paginate');  //import helper
const session = require('express-session');
const redisStore = require('connect-redis').default;
const { createClient } = require('redis');
const redisClient = createClient({
    //url: 'rediss://red-col6j4q0si5c73e701sg:5O3SlxhtD4WL2yHm4HLa5V11OqtUzXeh@singapore-redis.render.com:6379' //localhost
    //url: 'redis://red-col6j4q0si5c73e701sg:6379'    //url cua redis tren onrender
    url: process.env.REDIS_URL
});
redisClient.connect().catch(console.error);
const passport = require('./controllers/passport'); //import passport
const flash = require('connect-flash'); //import flash de hien thi thong bao loi    

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
    secret: process.env.SESSION_SECRET, //chuoi bi mat de ma hoa session id
    store: new redisStore({ client: redisClient }),  //luu session vao redis 
    resave: false,  //session chi duoc luu lai khi co su thay doi 
    saveUninitialized: false,   //session duoc tao ra ngay lap tuc ma khong can su kien gi xay ra 
    cookie: {
        httpOnly: true,
        maxAge: 20 * 60 * 1000  //20 minutes = 20ph * 60s * 1000ms
    }
}))

//cau hinh su dung passport
app.use(passport.initialize()); //khoi dong passport middleware
app.use(passport.session());    //khoi dong passport session

//cau hinh flash de hien thi thong bao loi
app.use(flash());   //luu thong bao loi vao trong session

//middleware tao gio hang
app.use((req, res, next) => { 
    let Cart = require('./controllers/cart');
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});  //tao gio hang moi neu chua co gio hang trong session 
    res.locals.quantity = req.session.cart.quantity;
    res.locals.isLogin = req.isAuthenticated();  //kiem tra xem da dang nhap chua

    next();
});
//routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/authRouter'));
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
