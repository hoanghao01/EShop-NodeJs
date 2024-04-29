'use strict'

const  controller = {};
const passport = require('./passport');
const models = require('../models');

controller.show = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('login', { loginMessage: req.flash('loginMessage'), reqUrl: req.query.reqUrl, registerMessage: req.flash('registerMessage')});
};

controller.login = (req, res) => {
    let keepSignedIn = req.body.keepSignedIn;
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/user/my-account';
    let cart = req.session.cart;
    passport.authenticate('local-login', (err, user) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        }
        req.logIn(user, (error) => {
            if (error) {
                return next(error);
            }
            req.session.cookie.maxAge = keepSignedIn ? 24 * 60 * 60 * 1000 : null;
            req.session.cart = cart;    //dang nhap thanh cong thi luu gio hang lai 
            return res.redirect(reqUrl);
        });
    })(req, res, next)
};

controller.logout = (req, res, next) => {
    let cart = req.session.cart;
    req.logout((error) => {
        if (error) {
            return next(error);
        }
        req.session.cart = cart;    //luu gio hang truoc khi logout
        res.redirect('/');  //redirect ve trang chu
    });      
}

controller.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect(`/users/login?reqUrl=${req.originalUrl}`);
}

controller.register = (req, res, next) => {
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/user/my-account';
    let cart = req.session.cart;
    passport.authenticate('local-register', (error, user) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        }
        req.logIn(user, (error) => {
            if (error) {
                return next(error);
            }
            req.session.cart = cart;    //dang ky thanh cong thi luu gio hang lai
            return res.redirect(reqUrl);
        });
    })(req, res, next);
}

controller.showForgotPassword = (req, res) => {
    res.render('forgot-password');
}

controller.showForgotPassword =async (req, res) => {
    let email = req.body.email;
    //kiem tra email ton tai
    let user = await models.User.findOne({ where: { email } });
    if (user) {
        //Tao link
        const { sign } = require('.jwt');
        const host = req.header('host');
        const resetLink = `${req.protocol}://${host}/users/reset?token=${sign(email)}&email=${email}`;
        //Gui email
        const { sendForgotPasswordMail } = require('./mail');
        sendForgotPasswordMail(user, host, resetLink)
            .then((result) => {
                console.log('Email has been sent!');
                return res.render('forgot-password', { done: true });
            })
            .catch(error => {
                console.log(error.statusCode);
                return res.render('forgot-password', { message: 'An error has occured when sending to your email. Please check your email address!' });
            });
    } else {
        //Nguoc lai, thong bao email ton tai
        return res.render('forgot-password', { message: 'Email does not exist!' });
    }    
}

controller.showResetPassword = (req, res) => {
    let token = req.query.token;
    let email = req.query.email;
    const { verify } = require('./jwt');
    if (verify(token, email)) {
        res.render('reset-password', { email });
    } else {
        res.redirect('/users/forgot');
    }
}
controller.resetPassword = (req, res) => {}

module.exports = controller;