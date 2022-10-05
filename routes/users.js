const express = require("express");
const router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const otpHelpers = require("../helpers/otp-helpers");
const usersHelpers = require("../helpers/user-helpers");


/* GET home page. */
const varifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/authentication");
  }
};

router.get("/", async function (req, res, next) {
  const user = req.session.user;
  let cartCount = 0;
  let cartProducts;
  let total
  if (req.session.user) {
    cartCount = await usersHelpers.getCartCount(req.session.user._id);
    cartProducts = await usersHelpers.getCartProducts(req.session.user._id);
     total =await usersHelpers.getTotalAmount(req.session.user._id)
  
  }
  productHelpers.getAllproducts().then((products) => {
    res.render("users/index", {
      total,
      cartProducts,
      cartCount,
      products,
      user,
      layout: "users-layout",
      users: true,
    });
  });
}) 

router.get("/authentication", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("users/authentication", { layout: "users-layout" });
  }
});

router.post("/signup", (req, res) => {
  req.session.user = req.body;
  otpHelpers.makeOtp(req.session.user.phoneNumber).then((response) => {
    res.redirect("/otp");
  });
});
router.get("/otp", (req, res) => {
  res.render("users/otp");
});

router.post("/otp", (req, res) => {
  const userNumber = req.session.user.phoneNumber;
  const userData = req.session.user;
  req.session.otp = req.body;
  otpHelpers.varifyOtp(userNumber, req.session.otp).then((verified) => {
    if (verified) {
      usersHelpers.doSignup(userData).then((response) => {
        req.session.loggedIn = true;
        res.redirect("/");
      });
    } else {
      res.redirect("/otp");
    }
  });
});

router.post("/login", (req, res) => {
  usersHelpers.doLogin(req.body).then((response) => {
    if (response) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.logginErr = "Invalid Email or Password";
      res.redirect("/authentication");
    }
  });
});
router.get("/user", (req, res) => {
  let user = req.session.user;
  res.render("user/user-details", {
    user,
    layout: "users-layout",
    users: true,
  });
});
router.get("/logout", (req, res) => {
  console.log("dfsd");
  req.session.destroy();
  res.redirect("/");
});

router.get("/edit-user", (req, res) => {
  let user = req.session.user;
  usersHelpers.getUserDetails(user._id).then((userData) => {
    req.session.loggedIn = true;
    res.render("users/user-edit", {
      user,
      layout: "users-layout",
      users: true,
      userData,
    });
  });
});
router.post("/edit-user", (req, res) => {
  const user = req.session.user;
  usersHelpers.updateUserData(req.body, user._id).then(() => {
    res.redirect("/");
  });
});

router.get("/shop/:gender", (req, res) => {
  const gender = req.params.gender;
  let user = req.session.user;
  productHelpers.getProducts(gender).then((products) => {
    res.render("users/shoping", {
      user,
      products,
      layout: "users-layout",
      users: true,
    });
  });
});
router.get("/products-details/:id", async (req, res) => {
  const product = await productHelpers.getProductDetails(req.params.id);
  const user = req.session.user;
  let cartCount = null;
  let cartProducts;
  if (req.session.user) {
    cartCount = await usersHelpers.getCartCount(req.session.user._id);
    cartProducts = await usersHelpers.getCartProducts(req.session.user._id);
  }
  res.render("users/product-detail", {
    cartCount,
    cartProducts,
    user,
    product,
    layout: "users-layout",
    users: true,
  });
});

router.get("/cart", varifyLogin, async (req, res) => {
  const user= req.session.user;
  const userId=req.session.user._id
  const cartCount = await usersHelpers.getCartCount(req.session.user._id);
  const products = await usersHelpers.getCartProducts(req.session.user._id);
  let totalValue =await usersHelpers.getTotalAmount(req.session.user._id)

  res.render("users/shoping-cart", {
    cartCount,
    userId,  
    products,
    totalValue,
    user,
    layout: "users-layout",
    users: true,
  });
});

router.get("/add-to-cart/:id", (req, res) => {
  console.log("api call");
  usersHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
    // res.redirect(`/products-details/${req.params.id}`)
  });
});

router.post("/change-product-quantity",(req, res, next) => {
  usersHelpers.changeProductQuantity(req.body).then(async(response) => {
    response.total=await usersHelpers.getTotalAmount(req.body.user)   
    res.json(response)
  });
});

router.get('/place-order',varifyLogin ,async (req,res)=>{ 
  let total =await usersHelpers.getTotalAmount(req.session.user._id)
  res.render('users/place-oder',{total,user:req.session.user,layout:'users-layout',users:true})
})

router.post('/place-order',async(req,res)=>{
  console.log('qqqqqqq');
  let products=await usersHelpers.getCartProductList(req.body.userId)
  let totalPrice=await usersHelpers.getTotalAmount(req.body.userId)
  usersHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    console.log('wwwwwwww');
    console.log(response);
    res.json({status:true})
  })
  console.log(req.body);
})

router.get('/order-success',(req,res)=>{
  console.log(tttttt);
  res.render('users/order-success',{users:true,layout:'users-layout',user:req.session.user})
})

module.exports = router;
