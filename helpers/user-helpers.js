const collection = require("../config/collection");
const db = require("../config/connection");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { response } = require("../app");


module.exports = {
  doSignup: (userData) => {
    const response = {};
    return new Promise(async (resolve, reject) => {
      try {
        delete userData.confirmPassword;
        userData.password = bcrypt.hashSync(userData.password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then(() => {
            resolve();
          });
      } catch (error) {
        console.log("it is wrong" + error);
        reject(error);
      }
    });
  },
  doLogin: (userData) => {
    let loginStatus = false;
    let response = {};
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login password is error");
            resolve({ status: false });
          }
        });
      } else {
        console.log("wrong email");
        resolve({ status: false });
      }
    });
  },
  getUserDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .findOne({ _id: ObjectId(userId) })
          .then((userData) => {
            console.log(userData);
            resolve(userData);
          });
      } catch (error) {
        console.log("it is error" + error);
        reject(error);
      }
    });
  },
  updateUserData: (userData, userId) => {
    console.log("user details", userData);

    const { username, email, phoneNumber } = userData;

    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(userId) },
            {
              $set: {
                username: username,
                email: email,
                phoneNumber: phoneNumber,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        console.log("it is update Error" + error);
        reject(error);
      }
    });
  },
  getAllusers: () => {
    return new Promise(async (resolve, reject) => {
      const users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .deleteOne({ _id: ObjectId(userId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  addToCart: (productId, userId) => {
    let productObject = {
      item: ObjectId(productId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userCart) {
        let productExist = userCart.products.findIndex(
          (product) => product.item == productId
        );
        console.log(productExist);
        if (productExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId), "products.item": ObjectId(productId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: { products: productObject },
              }
            )
            .then((response) => {
              resolve();
            })
            
        }
      } else {
        let cartObject = {
          user: ObjectId(userId),
          products: [productObject],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObject)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$products",0] },
            },
          },
        ])
        .toArray();

      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      console.log(cart);
      if (cart) {
        count = cart.products.length;

      }
      resolve(count);

    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        console.log('adsfds');

        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) }, {
          $pull: { products: { item: ObjectId(details.product) } }
        }
        ).then((response) => {
          resolve({ removeProduct: true })
        })
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
            {
              $inc: { 'products.$.quantity': details.count }
            }).then((response) => {
              resolve(true)
            })
      }

    })
  },
  getTotalAmount:(userId) => {
    return new Promise(async(resolve,reject)=>{
      console.log(userId);
      let total= await db
      .get()
      .collection(collection.CART_COLLECTION)
      .aggregate([
        {
          $match:{user:ObjectId(userId)},
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            item: "$products.item",
            quantity: "$products.quantity",
          },
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: "item",
            foreignField: "_id",
            as:"products",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product:{$arrayElemAt:["$products",0] },
          },
        },
        
        {
          $group:{_id:null,
            total:{$sum:{$multiply:['$quantity','$products.price']}}       
          }
        }
        
      ])
      .toArray();
   
      console.log(total[0].total);
      resolve(total[0].total)
    })
    
  }
};
