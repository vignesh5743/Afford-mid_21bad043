

import React, { useState } from 'react';
import axios from 'axios';

const Product = () => {
  const [companyName, setCompanyName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [top, setTop] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const handleFetchProducts = async () => {
    if (!companyName || !categoryName || !top || minPrice === '' || maxPrice === '') {
      setError('Please fill in all fields.');
      return;
    }

    const topValue = parseInt(top, 10);
    if (isNaN(topValue) || topValue <= 0) {
      setError('Top value must be a positive integer.');
      return;
    }

    const minPriceValue = parseFloat(minPrice);
    const maxPriceValue = parseFloat(maxPrice);
    if (isNaN(minPriceValue) || isNaN(maxPriceValue) || minPriceValue > maxPriceValue) {
      setError('Min Price must be less than Max Price.');
      return;
    }

    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/api/fetch-products', {
        companyName,
        categoryName,
        top: topValue,
        minPrice: minPriceValue,
        maxPrice: maxPriceValue,
        sortbyprice: true 
      });
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching products');
      setProducts([]);
    }
  };

  return (
    <div>
      <h1>Product Fetcher</h1>
      <div>
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Top"
          value={top}
          onChange={(e) => setTop(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button onClick={handleFetchProducts}>Fetch Products</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {products.length > 0 && (
        <div>
          {products.map((product) => (
            <div key={product.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              <p><strong>Price:</strong> ${product.price}</p>
              <p><strong>Rating:</strong> {product.rating} / 5</p>
              <p><strong>Availability:</strong> {product.availability}</p>
              <p><strong>Discount:</strong> {product.discount}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Product;
