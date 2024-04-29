'use strict'

const passport = require('passport');
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
//const LocalStrategy = require('passport-local');
//const bcrypt = require('bcrypt');
const models = require('../models');

//ham nay duoc goi khi xac thuc thanh cong va luu thong tin user vao session
passport.serializeUser((user, done) => {
    done(null, user.id);    //luu user.id vao session
})

//ham duoc goi boi passport.session() de lay thong tin user tu csdl va dua vao req.user
passport.deserializeUser(async (id, done) => {
    try {
        let user = await models.User.findOne({
            attributes: ['id', 'email', 'firstName', 'lastName', 'mobile', 'isAdmin'],
            where: { id }
        });
        done(null, user);   //dua user vao req.user
    } catch (error) {
        done(error, null);  //bao loi neu co loi   
    }
});

//ham xac thuc nguoi dung khi dang nhap
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',    //ten truong email trong form login
    passwordField: 'password', //ten truong password trong form login
    passReqToCallback: true    //cho phep truyen req vao callback de kiem tra user da dang nhap hay chua
}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase();   //chuyen email ve chu thuong
    }
    try {
        if (!req.user) {    //neu user chua dang nhap
            let user = await models.User.findOne({
                where: { email }
            });
            if (!user) {    //neu email chua ton tai
                return done(null, false, req.flash('loginMessage', 'Email does not exist!')); //bao loi
            }    
            if (!bcrypt.compareSync(password, user.password)) {  //neu mat khau khong khop
                return done(null, false, req.flash('loginMessage', 'Invalid Password!'));  //bao loi
            }
            //cho phep dang nhap
            return done(null, user);
        }
        //bo qua dang nhap neu da dang nhap
        done(null, req.user);
    } catch (error) {
        done(error);    
    }
}));

//ham dang ky tai khoan
passport.use('local-register', new LocalStrategy({
    usernameField: 'email',    //ten truong email trong form dang ky
    passwordField: 'password', //ten truong password trong form dang ky
    passReqToCallback: true    //cho phep truyen req vao callback de kiem tra user da dang nhap hay chua
}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase();   //chuyen email ve chu thuong
    }
    if (req.user) {
        return done(null, req.user);    //bo qua neu da dang nhap    
    }
    try {
        let user = await models.User.findOne({ where: { email } });
        if (user) {
            return done(null, false, req.flash('registerMessage', 'Email is already taken!')); //bao loi neu email da ton tai
        }

        user = await models.User.create({
            email: email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)), //ma hoa mat khau
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile,
        });    //tao user moi
        //thong bao dang ky thanh cong
        done(null, false, req.flash('registerMessage', 'You have registered successfully. Please login!'));

    } catch (error) {
        done(error);
    }
}));
module.exports = passport;