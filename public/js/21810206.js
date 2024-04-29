'use strict'

async function addCart(id, quantity) {
    let res = await fetch('/products/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ id, quantity })
    })
    let json = await res.json();
    document.getElementById('cart-quantity').innerText = `(${json.quantity})`;
};

async function updateCart(id, quantity) {
    if(quantity > 0) {
        let res = await fetch('/products/cart', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id, quantity })
        });
        if (res.status == 200) {
            let json = await res.json();
            document.getElementById('cart-quantity').innerText = `(${json.quantity})`;  //update so luong san pham trong gio hang
            document.getElementById('subtotal').innerText = `$${json.subtotal}`;    
            document.getElementById('total').innerText = `$${json.total}`;  
            document.getElementById(`total${id}`).innerText = `$${json.item.total}`;    //update tong tien cua san pham
        }      
    } else {
        removeCart(id);  
    }
};

async function removeCart(id) {
    if(confirm('Do you really want to remove this product?')) {
        let res = await fetch('/products/cart', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id})
        });
        if (res.status == 200) {
            let json = await res.json();
            if (json.quantity > 0) { 
                document.getElementById('cart-quantity').innerText = `(${json.quantity})`;  //update so luong san pham trong gio hang
                document.getElementById('subtotal').innerText = `$${json.subtotal}`;    
                document.getElementById('total').innerText = `$${json.total}`;
                document.getElementById(`product${id}`).remove();    //xoa san pham khoi gio hang
            } else {
                //location.reload();  //reload trang neu khong con san pham trong gio hang
                document.querySelector('.cart-page .container').innerHTML = `<div class="text-center border py-3">
                <h3>Your cart is empty!</h3>
                </div>`;
            }
        }      
    }
};

async function clearCart() {
    if(confirm('Do you really want to clear your cart?')) {
        let res = await fetch('/products/cart/all', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (res.status == 200) {
            document.getElementById('cart-quantity').innerText = '(0)';  //update so luong san pham trong gio hang la 0
            //location.reload();  //reload trang neu khong con san pham trong gio hang
            document.querySelector('.cart-page .container').innerHTML = `<div class="text-center border py-3">
            <h3>Your cart is empty!</h3>
            </div>`;
        }     
    }   
}

function placeorders(e) {
    e.preventDefault();

    const addressId = document.querySelector('input[name=addressId]:checked');  //lay dia chi duoc chon
    if (!addressId || addressId.value == 0) {
        if (!e.target.checkValidity()) {
            return e.target.reportValidity();  //hien thi loi neu khong nhap day du thong tin
        }
    }
    e.target.submit();  //gui form neu da nhap day du thong tin
}

function checkPasswordConfirm(formId) {
    let password = document.querySelector(`#${formId} input[name=password]`); //lay mat khau nhap vao form dang ky
    let confirmPassword = document.querySelector(`#${formId} input[name=confirmPassword]`);  //lay mat khau nhap lai

    if (password.value != confirmPassword.value) {
        confirmPassword.setCustomValidity('Passwords do not match!');  //hien thi loi neu mat khau khong khop
        confirmPassword.reportValidity();   //bao loi
    } else {
        confirmPassword.setCustomValidity('');  //an loi neu mat khau giong nhau
    }
}