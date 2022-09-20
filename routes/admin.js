const express = require("express");
const router = express.Router();
const path = require("path");
const adminHelpers = require("../helpers/admin-helpers");
const productHelpers = require("../helpers/product-helpers");
const multer = require("multer");
const usersHelpers = require ('../helpers/user-helpers')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      cb(null, "./public/upload");
    } catch (error) {price
      res.redirect("/admin/error-500");
    }
  },
  filename: function (req, file, cb) {
    try {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      console.log(file);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    } catch (error) {
      res.redirect("/admin/error-500");
    }
  },
});

const upload = multer({ storage: storage });
 
//verification
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
};

/* Add Product post */
router.post
("/add-product", upload.array("files", 3), (req, res) => {
  productHelpers.addProduct(req.body, req.files).then(() => {
    res.redirect("/admin/products");
  });
});
/* Add Category post */
router.post("/add-category", upload.single("files"), function (req, res) {
  productHelpers.addCategory(req.body, req.file).then(() => {
    res.redirect("/admin/category");
  });
  console.log(req.file, req.body);
});
/* Error-500 */
router.get("/error-500", (req, res) => {
  res.render("admin/error-500");
});

/* Loggin page */
router.get("/", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/admin/dashboard");
  } else {
    res.render("admin/login", {
      layout: "admin-layout",
      loginErr: req.session.loginErr,
    });
    req.session.loginErr = false;
  }
});

/* Dashboard */
router.get("/dashboard", verifyLogin, (req, res) => {
  const admin = req.session.admin;
  console.log(admin);
  res.render("admin/index", { layout: "admin-layout", admin: true, admin });
});
/* Login */
router.post("/login", (req, res) => {
  adminHelpers
    .adminLogin(req.body)
    .then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.admin = response.admin;
        res.redirect("/admin/dashboard");
      } else {
        req.session.loginErr = "Invalid Email or Password";
        res.redirect("/admin");
      }
    })
    .catch((error) => {
      if (error.serverError) {
        res.redirect("/admin/error-500", { layout: "admin-layout" });
      }
    });
});
/* Product */
router.get("/products", verifyLogin, (req, res) => {
  productHelpers.getAllproducts().then((products) => {
    res.render("admin/products", {
      products,
      layout: "admin-layout",
      admin: true,
    });
  });
});
/* Add product */
router.get("/add-products", verifyLogin, (req, res) => {
  console.log("hd");
  productHelpers
    .getCategory(req.params.id)
    .then((category) => {
      res.render("admin/add-products", {
        category,
        layout: "admin-layout",
        admin: true,
      });
      console.log("hp");
    })
    .catch((error) => {
      console.log(error);
    });
});
/* Category */
router.get("/category", verifyLogin, (req, res) => {
  productHelpers.getCategory().then((category) => {
    res.render("admin/category", {
      category,
      layout: "admin-layout",
      admin: true,
    });
  });
});
/* add Category */
router.get("/add-category", verifyLogin, (req, res) => {
  productHelpers.getCategory().then((category) => {
    res.render("admin/add-category", {
      category,
      layout: "admin-layout",
      admin: true,
    });
  });
});
/* Delete Category */
router.get("/delete-category/:id", (req, res) => {
  const catId = req.params.id;
  productHelpers.deleteCategory(catId).then((response) => {
    res.redirect("/admin/category");
  });
});
/* Edit Category */
router.get("/edit-category/:id", async (req, res) => {
  const category = await productHelpers.getCategoryDetials(req.params.id);
  console.log(category);
  res.render("admin/edit-category", {
    category,
    layout: "admin-layout",
    admin: true,
  });
});
/* Edit Category post */
router.post("/edit-category/:id", upload.single("files"), (req, res) => {
  let id = req.params.id;
  productHelpers.updateCategory(req.body, id, req.file).then(() => {
    res.redirect("/admin/category");
  });
});
/* Delete Product */
router.get("/delete-products/:id", (req, res) => {
  const proId = req.params.id;
  productHelpers.deleteProduct(proId).then(() => {
    res.redirect("/admin/products");
  });
});
/* Edit Product */
router.get("/edit-products/:id", async (req, res) => {
  const product = await productHelpers.getProductDetails(req.params.id);
  const category = await productHelpers.getCategory(req.params.id);
  res.render("admin/edit-products", {
    category,
    product,
    layout: "admin-layout",
    admin: true,
  });
});
/* Edit Product post */
router.post("/edit-products/:id", upload.array("files", 3), (req, res) => {
  productHelpers.updateProducts(req.body, req.params.id, req.files).then(() => {
    res.redirect("/admin/products");
  });
});
/* Logout */
router.get("/logout", (req, res) => {
  console.log("dfsd");
  req.session.destroy();
  res.redirect("/admin");
});
/* Users */
router.get('/users',(req,res)=>{
  usersHelpers.getAllusers().then((users)=>{
    console.log(users);
    res.render('admin/users',{users,layout:'admin-layout',admin:true}) 
  })
})
/* Delete users */
router.get('/delete-users/:id',(req,res)=>{
  const userID= req.params.id
  usersHelpers.deleteUser(userID).then(()=>{
    res.redirect('/admin/users')
  })

})

module.exports = router;
