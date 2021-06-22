import React from 'react';

/* Assuming single product. Better to use js/fetch/axios for multiple products
in batch */
const ProductCreate = ({ handleSubmit }) => {
  return (
    <div>
      <h2>Create new product</h2>
      <form action="http://localhost:3001/products" method="POST" onSubmit={handleSubmit}>
        <label for="name">Name: </label>
        <input type="text" id="name" name="name" /><br />

        <label for="category">Category: </label>
        <input type="text" id="category" name="category" /><br />

        <label for="price">Price: </label>
        <input type="number" id="price" name="price" /><br />
        <button type="submit" className="submitBtn">Create</button>
      </form>
    </div>
  )
}

const App = () => (
  <div className="app">
    <ProductCreate />
  </div>
);

export default App;
