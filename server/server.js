const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const products = require('./db');
const Constants = require('./Constants')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

http.createServer(app).listen(3001, () => {
  console.log('Listen on 0.0.0.0:3001');
});

app.get('/', (_, res) => {
  res.send({ status: 200 });
});

process.on('SIGINT', function () {
  process.exit();
});


/* Creating products. Support for body parsing, not query params */
app.post('/products', (req, res) => {
  const { name, category, price } = req.body;

  if (!name || !category || !price) {
    res.send({ status: 400, message: "Bad request: name, category and price should be included." })
  }
  else {
    if (name.trim() === "" || category.trim() === "" || price.trim() == "") {
      res.send({ status: 400, message: "Bad request: name, category and price should be included."})
    }
    else {
      const newProduct = {
        id: (name + category + price).toLowerCase(),      // Populated by DBMS, mocked here
        name: name.toLowerCase(),
        category: category.toLowerCase(), // Creates new category by default if not existing. Could be avoided by validating.
        price: Number.parseFloat(price)
      }
      products.push(newProduct);
      res.send({ status: 201, message: "Product was created.", createdProduct: newProduct })
    }
  }
})

/* Products */
app.get('/products', (req, res) => {
  
  if (Object.keys(req.query).length == 0) {
    res.send({ status: 200, products: products.slice(0, Constants.PAGE_SIZE) })
  }
  else {
    const { minPrice, maxPrice, category, page } = req.query;
    let filtered = products.filter( item => !minPrice || item.price >= Number.parseFloat(minPrice))
    filtered = filtered.filter( item => !maxPrice || item.price <= Number.parseFloat(maxPrice))
    filtered = filtered.filter( item => !category || item.category === category)
    
    if (filtered.length > Constants.PAGE_SIZE) {
      const offset = !page || page < 1 ? 0 : (Number.parseInt(page) - 1) * Constants.PAGE_SIZE;
      if (isNaN(offset)) {
        res.send({ status: 400, message: "Bad request: invalid page number."})
      }
      filtered = filtered.slice(offset, offset + Constants.PAGE_SIZE);
    }
    res.send({ status: 200, products: filtered })
  }
})


/* Matching products */
app.get('/products/match/:id', (req, res) => {

  const { id } = req.params;
  const matchedProducts = products.filter(item => item.id === id)
  if (matchedProducts.length === 0) {
    res.send({ status: 404, message: "Not found: did not find any product with requested id."})
  }
  else {
    const { price, category } = matchedProducts[0]
    const sameProducts = products
      .filter(item => item.category === category)
      .sort((a, b) => a.price < b.price)
      .slice(0, Constants.NUM_SIMILAR_PRODUCTS)
    res.send({ status: 200, products: sameProducts })
  }
})
