const express=require("express")
require("dotenv").config()
require("./db/connectionDB")
const customError = require("./Utils/customError")
const errorHandler=require("./middleware/errorMiddleware")


//

//routes
const userRoutes=require("./routes/userRoutes")
const profileRoutes=require("./routes/profileRoutes")
const cartRouter=require("./routes/cartRoutes")
const productRoutes=require("./routes/productRoutes")
const ordersRoutes=require("./routes/ordersRoutes")
const CategoryRoutes=require("./routes/categoryRoutes")
const { auth } = require("./middleware/auth")
const { isAdmin } = require("./middleware/AdminUserAuth")

const app=express();
app.use(express.json())

app.use('/api/v1', userRoutes);
app.use('/api/v1/products', productRoutes);
//cart route
app.use('/api/v1/cart',cartRouter)

app.use(errorHandler);


////////////////// amal 




/////////             heba






////////////////// aml









////////////////   radwa









////////// ahmed


app.use("/api/v1/orders",ordersRoutes)








///////////emad
app.use("/category",CategoryRoutes)






app.all("*",(req,res,next)=>{
    next(new customError("can't found this route",500));
})
app.use(errorHandler);


app.listen(process.env.PORT,()=>console.log("running"))

//ouside rejection
process.on("unhandledRejection",(err)=>{
    console.log(`error: ${err.name} , message : ${err.message}`)
})