const collection = require("../config/collection");
const db = require("../config/connection");
const { ObjectId } = require("mongodb");


module.exports = {
  addProduct: (product, images) => {
    images.forEach((image) => {
      image._id = new ObjectId();
    });

    const { brand } = product;
    const { productName } = product;
    const { type } = product;
    const { category } = product;
    const { description } = product;
    const { price } = product;

    const productObject = {
      brand,
      productName,
      type,
      category,
      description,
      price,
      stocks: [
        {
          size: "s",
          stock: Number(product.s),
        },
        {
          size: "m",
          stock: Number(product.m),
        },
        {
          size: "l",
          stock: Number(product.l),
        },
        {
          size: "xl",
          stock: Number(product.xl),
        },
        {
          size: "xxl",
          stock: Number(product.xxl),
        },
      ],
      images,
    };
    console.log("product");
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .insertOne(productObject)
        .then((data) => {
          console.log(data);
          resolve();
        });
    });
  },

  addCategory: (categoryDetails, image) => {
    image._id = new ObjectId();
    console.log("helllp");
    const { category } = categoryDetails;
    console.log("dddsds");
    // let { type } = categoryDetails;
    // const isArray = Array.isArray(type);
    // console.log("dhh");

    // if (!isArray) {
    //   type = [type];
    // }

    const categoryObject = {
      category,
      // type,
      image,
    };
    console.log("hellob");
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .insertOne(categoryObject)
          .then((data) => {
            console.log(data);
            resolve();
          });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let category = await db
          .get()
          .collection(collection.CATEGORY_COLLECTION)
          .find()
          .toArray();
        resolve(category);
      } catch (error) {
        reject(error);
      }
    });
  },
  getAllproducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  deleteCategory: (catId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: ObjectId(catId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getCategoryDetials: (catId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ _id: ObjectId(catId) })
        .then((category) => {
          resolve(category);
        });
    });
  },
  updateCategory: (catDetails, catId, image) => {
    const updateObject = {
      category: catDetails.category,
    };
    if (image) {
      image._id = new ObjectId();
      updateObject.image = image;
    }
    const { category } = catDetails;
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { _id: ObjectId(catId) },
          {
            $set: { ...updateObject },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(proId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: ObjectId(proId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  updateProducts: (product, proId, images) => {
    console.log(proId);
    images.forEach((image) => {
      image._id = new ObjectId();
    });

    const { brand, productName, type, category, price, description } = product;

    const productObject = {
      brand,
      productName,
      category,
      type,
      description,
      price,
      stocks: [
        {
          size: "s",
          stock: Number(product.s),
        },
        {
          size: "m",
          stock: Number(product.m),
        },
        {
          size: "l",
          stock: Number(product.l),
        },
        {
          size: "xl",
          stock: Number(product.xl),
        },
        {
          size: "xxl",
          stock: Number(product.xxl),
        },
      ],
      images,
    };

    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proId) },
          {
            $set: {
              ...productObject,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },
  getProducts:  (gender) => {
    console.log(gender);
    return new Promise (async(resolve,reject)=>{
      const products =  await db
      .get()
      .collection(collection.PRODUCT_COLLECTION)
      .find({type : gender })
      .toArray();
      resolve(products)
    })   
  },
};
