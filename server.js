const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const creds = {
    companyName: "Mepco",
    clientID: "6e8ee80a-fed1-4c5f-a805-fe13010eb63e",
    clientSecret: "zWRXLnKmktagbIWU",
    ownerName: "Hariharanvignesh K",
    ownerEmail: "hariharanvignesh2003@gmail.com",
    rollNo: "21BAD043"
};

async function refreshAccessToken() {
    const tokenUrl = 'https://20.244.56.144/test/auth'; 

    try {
        const response = await axios.post(tokenUrl, {
            companyName: creds.companyName,
            clientID: creds.clientID,
            clientSecret: creds.clientSecret,
            ownerName: creds.ownerName,
            ownerEmail: creds.ownerEmail,
            rollNo: creds.rollNo
        }, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error refreshing access token:', error.response?.data || error.message);
        throw new Error('Unable to refresh access token');
    }
}

app.post('/api/fetch-products', async (req, res) => {
    const { companyName, categoryName, top, minPrice, maxPrice, sortbyprice } = req.body;

    if (!companyName || !categoryName || !top || minPrice === undefined || maxPrice === undefined || sortbyprice === undefined) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (top > 10) {
        return res.status(400).json({ message: 'Top value cannot exceed 10' });
    }

    const url = `https://20.244.56.144/test/companies/${companyName}/categories/${categoryName}/products?top=${top}&minPrice=${minPrice}&maxPrice=${maxPrice}`;

    try {
        let accessToken = await refreshAccessToken();
        
        console.log('Request URL:', url);
        console.log('Access Token:', accessToken);

        let response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }) 
        });

        let products = response.data;

        if (sortbyprice) {
            products.sort((a, b) => a.price - b.price);
        }

        res.json(products);
    } catch (error) {
        if (error.response?.status === 401) {
            try {
                const newAccessToken = await refreshAccessToken();
                
                let response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`
                    },
                    httpsAgent: new https.Agent({ rejectUnauthorized: false })
                });

                let products = response.data;

                if (sortbyprice) {
                    products.sort((a, b) => a.price - b.price); 
                }

                res.json(products);
            } catch (refreshError) {
                res.status(refreshError.response?.status || 500).json({
                    message: 'Error refreshing access token',
                    error: refreshError.message,
                    details: refreshError.response?.data
                });
            }
        } else {
            console.error('Error response:', error.response?.data || error.message);
            res.status(error.response?.status || 500).json({
                message: 'Error making request to external API',
                error: error.message,
                details: error.response?.data
            });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
