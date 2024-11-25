// C3.js
function renderChart(data){
    const colorsMap = ["#DACBFF","#9D7FEA","#5434A7","#301E5F"]
    const colorsData = Object.fromEntries(data.map((item,index) => [
        item[0],colorsMap[index % colorsMap.length]
    ]))
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns:data
            ,
            colors:colorsData
        },
    });
}

//圖表資料處理
//類別:category
let chartData =[];
function getChartData(){
    let obj = {};
    const productstData = ordersData.map(item => item.products).flatMap(item => item)
    productstData.forEach(item => {
        const productPrice = item.price * item.quantity;
        const productCategory = item.category;
        if(obj[productCategory]){
            obj[productCategory] += productPrice;
        }else{
            obj[productCategory] = productPrice;
        }
    })
    chartData = Object.entries(obj)
    
    renderChart(chartData)
}
//功能處理
const apiPath = "s41115208";
const apiBaseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/admin/";
const customer = apiBaseUrl + apiPath;
const token = "4pPdglyy7GUY56FoAv07cSTczwh2";
const config = {
    headers:{
    Authorization:token
    }
}
const orderPageTableTbody = document.querySelector('tbody')
//抓取訂單資料
let ordersData = [];

function getOrdersData(){
    axios.get(`${customer}/orders`,config)
    .then(res =>{
        ordersData = res.data.orders
        renderOrders()
        getChartData()
    }).catch(err => {
        console.log(err)
    })
}
getOrdersData()
//渲染訂單

function renderOrders(err){
    const message = err || "目前沒有訂單"
    if(ordersData.length === 0){
        orderPageTableTbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">${message}</td></tr>`;
        return
    }
    const str = ordersData.map((item,index) =>{
        let paidStatus = '';
        item.paid ? paidStatus = '已處理' : paidStatus = '未處理';
    return`<tr data-num="${item.id}">
    <td>${item.createdAt}</td>
    <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
    </td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>
        <p>${item.products.map(item => item.title)}</p>
    </td>
    <td>2021/03/08</td>
    <td >
        <a href="#" class="orderStatus">${paidStatus}</a>
    </td>
    <td>
        <input type="button" class="delSingleOrder-Btn" value="刪除">
    </td>
</tr>`;}).join('');
    orderPageTableTbody.innerHTML = str
    // checkPaidStatus()
}
//修改訂單狀態以及刪除單筆訂單
orderPageTableTbody.addEventListener('click',e =>{
    e.preventDefault()
    const id = e.target.closest('tr').dataset.num;
    if(e.target.classList.contains('orderStatus')){
        checkOrdersStatus(id)
    }else if(e.target.classList.contains('delSingleOrder-Btn')){
        deleteOrder(id)
    }
})
function putOrders(data){
    axios.put(`${customer}/orders`,data,config)
    .then(res => {
        ordersData = res.data.orders;
        renderOrders()
        getChartData()
    }).catch(err => {
        console.log(err)
    })
}
//檢查訂單狀態並推送更改
function checkOrdersStatus(id){
    
    let paidData = {
        data: {
            id,
            paid: true
        }
    }
    ordersData.forEach(item => {
        if(id === item.id){
            if(item.paid){
                paidData.data.paid = false;
            }else{
                paidData.data.paid = true;
            }
        }
    })
    putOrders(paidData)
}
//刪除單筆訂單
function deleteOrder(id){
    axios.delete(`${customer}/orders/${id}`,config)
    .then(res => {
        ordersData = res.data.orders;
        const overMessage = '已經沒有訂單';
        renderOrders(overMessage)
        getChartData()
    }).catch(err =>{
        console.log(err)
    })
}
//刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',e =>{
    e.preventDefault()
    deleteOrdersALL()
})
function deleteOrdersALL(){
    axios.delete(`${customer}/orders`,config)
    .then(res => {
        ordersData = res.data.orders;
        renderOrders()
        renderChart()
    }).catch(err => {
        const errMessage = err.response.data.message
        renderOrders(errMessage)
    })
}