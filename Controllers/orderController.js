// @ts-nocheck
const Order=require("../models/order")
const Cart=require("../models/cart");
const AsyncHandler = require("express-async-handler");
const customError = require("../Utils/customError");
const Product = require("../models/Product");
const { getOrderByIdServise,getOrdersServise} = require("../services/orderServise");
// @ts-ignore
const Stripe= require("stripe")(process.env.Stripe_Secrete);

const createOrder=AsyncHandler(async(req,res,next)=>{
    const cartId=req.body.cartId;
    if(!cartId)
        return next("cartId required");
    //get cart by id
    const cart= await Cart.findById(req.body.cartId);
    if(!cart)
        return next(new customError("can't found this cart",204));
    const taxPrice=0;
    const shippingPrice=0;
    const totalOrderPrice=cart.totalprice + taxPrice+shippingPrice;
    //create order
    const order=await Order.create({
        user:req.user._id,
        cartItems:cart.cartItems,
        totalOrderPrice,
        shippingAddress:req.body.shippingAddress
    })

    //increment Sold and decrement quantity in Product
    const Bulkoption=cart.cartItems.map((item)=>({
        updateOne:{
            filter:{_id:item.product},update:{$inc:{quantity: -item.quantity,sold: +item.quantity}}
        }
    }));
    Product.bulkWrite(Bulkoption,{})

    //clear cart 
    await Cart.findByIdAndDelete(req.body.cartId)

    res.status(201).json({success:'success',data:order})
})

const getOrderes=AsyncHandler(async(req,res,next)=>{
    const orders= await getOrdersServise();
    res.send(orders);
});


const getOrderById=AsyncHandler(async(req,res,next)=>{
    const orderId=req.params.id;
    if(!orderId)
        return next(new customError("orderId required")); 
    const order=await getOrderByIdServise(orderId);
    if(order.user.toString() ===req.user.id)
        res.send(order)
    else
    return next(new customError("there is no such a order for this user"))       
})
const cancelOrder=AsyncHandler(async(req,res,next)=>{
    const orderId=req.params.id;
    if(!orderId)
        return next(new customError("orderId required")); 
    const order=await getOrderByIdServise(orderId);
    console.log("order",order);
    if(order.length==0)return next(new customError("there is no such a order for this user"));
    if(order.user.toString()===req.user.id)
    {
        order.status="Canceled";
        const updatedOrder=await order.save();
        res.status(200).json({status:"success",data:updatedOrder})
    }
    else
        return next(new customError("there is no such a order for this user"));
 
})

const checkoutSession=AsyncHandler(async(req,res,next)=>{
    const cart= await Cart.findById(req.params.cartId);


    if(!cart) return next(next(new customError("not found cadt")));

    const shippingPrice=0;
    const taxPrice=0;

    const totalprice=shippingPrice+taxPrice+cart.totalprice;

    const session= await Stripe.Checkout.session.create({
        line_items:[
            {
                name:req.user.name,
                amount:totalprice,
                currency:'egp',
                quantity:1,
            }],
            mode:'payment',
            success_url:`${req.protocol}://${req.get('host')}/orders`,
            cancel_url:`${req.protocol}://${req.get('host')}/cart`
    });

    res.status(200).send({status:'success',session})
})

module.exports={createOrder,getOrderes,getOrderById,cancelOrder,checkoutSession}
