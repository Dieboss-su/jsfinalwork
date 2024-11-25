
const apiPath = "s41115208";
const apiBaseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/customer/";
const customer = apiBaseUrl + apiPath;
const config = {
    Name: "authorization",
    headers:"4pPdglyy7GUY56FoAv07cSTczwh2"
}
//抓取欄位變數
const productWrap = document.querySelector('.productWrap')
const productSelect = document.querySelector('.productSelect')
const shoppingCartTableBody = document.querySelector('.shoppingCart-table tbody')
const shoppingCartTableFoot = document.querySelector('.shoppingCart-table tfoot')
//取得產品相關並賦予資料
let productsData = [];

function getProducts(){
    axios.get(`${customer}/products`)
    .then((res) => {
        productsData = res.data.products;
        renderProducts (productsData);
    }).catch((err) =>{
        console.log(err)
    })
};

//渲染產品資料
function renderProducts (data){
    let str = "";
    data.forEach(item => {
        str +=`<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}"
            alt="">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
    </li>`
    });
    productWrap.innerHTML = str;
};
//初始化網頁資料
function init(){
    getProducts();
    getCarts()
}
init();
//篩選產品
function filterProducts (value){
    const result = [];
    productsData.forEach(item =>{
        if(item.category === value){
            result.push(item);
        }else if(value === '全部'){
            result.push(item);
        }
    });
    renderProducts (result);
}
productSelect.addEventListener('change',e => {
    filterProducts (e.target.value)
})
//取得購物車資料
let cartData = [];
const discardAllBtn = document.querySelector('.discardAllBtn')
function getCarts(){
    axios.get(`${customer}/carts`)
    .then(res => {
        cartData = res.data.carts;
        renderCarts();
        checkCartData (res.data.finalTotal)
    }).catch(err => {
        console.log(err);
    })
}
//渲染購物車
function renderCarts(){
    let str = "";
    cartData.forEach(item =>{
        let totalPrice = item.product.price * item.quantity;
        console.log(item);
        str += `<tr>
        <td>
            <div class="cardItem-title">
                <img src="${item.product.images}"
                    alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${item.product.price}</td>
        <td><button type="button" data-id="${item.id}" class="decrease">-</button>${item.quantity}<button type="button" data-id="${item.id}" class="add">+</button></td>
        <td>NT$${totalPrice}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${item.id}">
                clear
            </a>
        </td>
    </tr>`
    })
    shoppingCartTableBody.innerHTML = str;
    
}
//商品數量調整
const addBtn = document.querySelector('.add');
const decreaseBtn = document.querySelector('.decrease');
function addCartNum (id,num){
    let obj = {
        data:{
            id,
            quantity:num
        }
    }
    console.log(obj)
    axios.patch(`${customer}/carts`,
        obj
        ).then(res => {
            cartData = res.data.carts;
            renderCarts();
            checkCartData (res.data.finalTotal)
        }).catch(err =>{
            console.log(err)
        })
}
//新增購物車資料
function addCartData(id){
    const data = {
        "data": {
        "productId": id,
        "quantity": 1
        }
    }
    axios.post(`${customer}/carts`,data)
    .then(res => {
        cartData = res.data.carts;
        renderCarts()
        checkCartData (res.data.finalTotal)
    }).catch(err => {
        console.log(err);
    })
}
productWrap.addEventListener('click',e => {
    e.preventDefault();
    checkRepeatData(e.target.dataset.id)
    // addCartData(e.target.dataset.id);
})
//檢查購物車重複資料
function checkRepeatData(id){
    console.log(id)
    const isDuplicate =cartData.some(item => item.product.id === id)
    if(isDuplicate){
        alert('購物車已有重複商品');
        return;
    }
    addCartData(id)
}
//確認購物車是否為空
function checkCartData (finalTotal){
    if(cartData[0] === undefined){
        shoppingCartTableFoot.innerHTML = `購物車沒有商品...`;
    }else{
        shoppingCartTableFoot.innerHTML = `<tr>
        <td>
            <a href="#" class="discardAllBtn">刪除所有品項</a>
        </td>
        <td></td>
        <td></td>
        <td>
            <p>總金額</p>
        </td>
        <td>NT$${finalTotal}</td>
    </tr>`
    }
}
//刪除購物車所有品項
function deleteAllCart(){
    axios.delete(`${customer}/carts`)
    .then(res => {
        console.log(res.data);
        cartData = res.data.carts;
        renderCarts()
        checkCartData ()
        console.log(res.data.message);
    }).catch(err => {
        console.log(err);
    })
}

shoppingCartTableFoot.addEventListener('click',e => {
    console.log(e.target.classList.value);
    if(e.target.classList.value === 'discardAllBtn'){
        e.preventDefault();
        deleteAllCart();
    }
})
//刪除購物車單一品項,數量調整
shoppingCartTableBody.addEventListener('click',e => {
    console.log(e.target)
    const touchId = e.target.dataset.id;
    let num = 0;
    if(e.target.classList.value === 'add'){
        console.log('點擊增加')
    cartData.forEach(item =>{
        if(item.id === touchId){
            num = item.quantity +1;
        }
    })
        addCartNum(touchId,num);
        
    }else if(e.target.classList.value === 'decrease'){
        console.log('點擊減少')
        cartData.forEach(item =>{
            if(item.id === touchId){
                num = item.quantity -1;
            }
        })
        addCartNum(touchId,num);
    }else if(touchId){
        e.preventDefault();
        const cartId = e.target.dataset.id;
        deleteCart(cartId);
    }
})
function deleteCart(id){
    axios.delete(`${customer}/carts/${id}`)
    .then(res =>{
        console.log(res.data)
        cartData = res.data.carts;
        renderCarts();
        checkCartData (res.data.finalTotal)
    }).catch(err =>{
        console.log(err)
    })
}

//填寫表單
const orderInfoBtn = document.querySelector('.orderInfo-btn')
const orderInfoForm = document.querySelector('.orderInfo-form')
const customerName = document.querySelector('#customerName')
const customerPhone = document.querySelector('#customerPhone')
const customerEmail = document.querySelector('#customerEmail')
const customerAddress = document.querySelector('#customerAddress')
const tradeWay = document.querySelector('#tradeWay')
const orderInfoMessage = document.querySelectorAll('.orderInfo-message')
//定義驗證規則
const constraints = {
    姓名:{
        presence:{
            message:"^姓名不得為空"
        }
    },
    電話:{
        presence:{
            message:"^電話不得為空"
        }
    },
    Email:{
        presence:{
            message:"^Email不得為空"
        }
    },
    寄送地址:{
        presence:{
            message:"^寄送地址不得為空"
        }
    },
    交易方式:{
        presence:{
            message:"^交易方式不得為空"
        }
    }
}
//監聽表單提交事件
orderInfoForm.addEventListener('submit',e => {
    e.preventDefault();
    let obj = {};
    let errorData = [];
    const error = validate(orderInfoForm,constraints);
    console.log(error);
    if(error){
        errorData = Object.keys(error);
        const orderInfoMessage = document.querySelectorAll('.orderInfo-message')
        orderInfoMessage.forEach(item =>{
            const result = errorData.some(errorMessage => errorMessage === item.dataset.message);
            const errorMessage = document.querySelector(`[data-message="${item.dataset.message}"]`);
            if(result){
                errorMessage.textContent = `${error[`${item.dataset.message}`]}`;
            }else{
                errorMessage.textContent = "";
            }
        })
    }else{
        obj.data = {
            user:{
            name: customerName.value,
            tel: customerPhone.value,
            email: customerEmail.value,
            address: customerAddress.value,
            payment: tradeWay.value
            }
        }
        postForm(obj)
        resetForm()
        deleteAllCart()
    }
})
//重製表單
function resetForm(){
    orderInfoForm.reset();
}
//送出表單到後端
function postForm(formData){
    axios.post(`${customer}/orders`,formData)
    .then(res =>{
        console.log(res.data);
    }).catch(err => {
        console.log(err);
    })
}
