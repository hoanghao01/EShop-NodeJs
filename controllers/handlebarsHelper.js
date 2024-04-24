'use strict'

const helper = {};

helper.createStarList = (stars) => {
    //lay phan nguyen
    let star = Math.floor(stars);   // 4.5 -> 4
    //lay phan thap phan
    let half = stars - star;        // 4.5 - 4 = 0.5 
    //tao chuoi html
    let str = '<div class="ratting">';
    let i;
    for (i = 0; i < star; i++) {
        str += '<i class="fa fa-star"></i>';
    }
    if(half > 0) {
        str += '<i class="fa fa-star-half"></i>';
        i++;
    }
    for (; i < 5; i++) {
        str += '<i class="fa fa-star-o"></i>';
    }
    str += '</div>'; 
    return str;
}
module.exports = helper;