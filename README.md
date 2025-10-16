# AI-Powered Food Ordering System - Backend

A comprehensive food ordering system with AI-powered recommendations, payment integration, and admin management features.

## Features

### Customer Features
- 🔐 User authentication (register, login, logout)
- 🍔 Browse dishes with advanced filters (category, price, rating)
- 🔍 Search dishes by name or description
- 🛒 Place food orders with multiple items
- 💳 VNPay payment integration
- 📍 Multiple delivery addresses management
- ⭐ Rate and review dishes
- 🔔 Real-time notifications for order updates
- 👤 User profile and preferences management
- ❤️ Favorite dishes management

### AI-Powered Recommendations
- 🎯 Personalized dish recommendations based on order history
- 🥗 Healthy options filtered by dietary restrictions
- 🍽️ Meal planning for multiple people
- 💰 Spending optimization suggestions
- 👥 Collaborative filtering (similar users' preferences)

### Admin Features
- 👥 User management (status, roles)
- 🍕 Product management (CRUD operations)
- 📦 Order management and status updates
- 💵 Payment and refund processing
- 📊 Revenue reports and analytics
- 📈 Order statistics and insights
- 📋 Dashboard with key metrics

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Payment Gateway:** VNPay
- **API Style:** RESTful

## Project Structure

```
be/
├── src/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── adminController.js    # Admin operations
│   │   ├── authController.js     # Authentication logic
│   │   ├── dishController.js     # Dish management
│   │   ├── notificationController.js
│   │   ├── orderController.js    # Order processing
│   │   ├── paymentController.js  # VNPay integration
│   │   ├── recommendationController.js  # AI recommendations
│   │   ├── reviewController.js   # Reviews & ratings
│   │   └── userController.js     # User profile
│   ├── middlewares/
│   │   └── auth.js               # JWT authentication & authorization
│   ├── models/
│   │   ├── Dish.js
│   │   ├── Notification.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   ├── Session.js
│   │   ├── User.js
│   │   └── UserPreference.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── dishes.js
│   │   ├── index.js
│   │   ├── notifications.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── recommendations.js
│   │   ├── reviews.js
│   │   └── users.js
│   ├── services/              # Business logic services
│   ├── utils/
│   │   └── jwt.js            # JWT utilities
│   └── server.js             # Application entry point
├── .env                       # Environment variables
├── .env.example              # Environment template
├── package.json
├── API_DOCUMENTATION.md      # Complete API documentation
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd ordering_system/be
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configurations:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/food_ordering

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRE=30d

# VNPay
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5000/api/payments/vnpay-return
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or if using MongoDB service
sudo service mongod start
```

5. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Start Examples

#### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "0123456789"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 3. Get dishes with filters
```bash
curl -X GET "http://localhost:5000/api/dishes?category=main_course&minPrice=50000&maxPrice=200000&page=1&limit=20"
```

#### 4. Create an order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {"dish": "dish_id_1", "quantity": 2},
      {"dish": "dish_id_2", "quantity": 1}
    ],
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Ho Chi Minh City",
      "district": "District 1",
      "ward": "Ward 1",
      "phone": "0123456789"
    },
    "paymentMethod": "vnpay"
  }'
```

## Database Schema

### User
- Email, password (hashed)
- Name, phone
- Roles (customer, admin)
- Status (active, inactive, banned)
- Delivery addresses

### Dish
- Name, description, price
- Category, image
- Ingredients, calories
- Health info, tags
- Rating and review count

### Order
- User reference
- Items (dish, quantity, price)
- Total amount
- Delivery address
- Status (pending → confirmed → preparing → delivering → completed)
- Payment status

### Payment
- Order reference
- Amount, method
- VNPay transaction details
- Status (pending, successful, failed, refunded)

### Review
- User and dish references
- Rating (1-5), comment
- Images

### UserPreference
- Favorite categories
- Dietary restrictions
- Allergies
- Budget range
- Spice level preference

## Testing

### Manual Testing
Use Postman or any API client:
1. Import the API collection from `API_DOCUMENTATION.md`
2. Set up environment variables
3. Test each endpoint

### Unit Testing (TODO)
```bash
npm test
```

## Deployment

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start src/server.js --name food-ordering-api

# Monitor
pm2 monit

# View logs
pm2 logs food-ordering-api
```

### Using Docker
```bash
# Build image
docker build -t food-ordering-api .

# Run container
docker run -p 5000:5000 --env-file .env food-ordering-api
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Refresh token mechanism
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ MongoDB injection prevention
- ✅ Rate limiting (TODO: implement with express-rate-limit)
- ✅ CORS configuration
- ✅ Helmet security headers (TODO: add helmet middleware)

## Performance Optimization

- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient MongoDB aggregation queries
- Caching strategy (TODO: implement Redis)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Future Enhancements

- [ ] Real-time order tracking with WebSocket
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Image upload for dishes and reviews
- [ ] Coupon and discount system
- [ ] Loyalty points program
- [ ] Driver assignment and tracking
- [ ] Restaurant multi-tenancy
- [ ] GraphQL API

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
sudo service mongod start
```

### JWT Token Invalid
**Solution:** Check if JWT_SECRET in .env matches and token hasn't expired

### VNPay Payment Fails
**Solution:** 
1. Verify VNPAY_TMN_CODE and VNPAY_HASH_SECRET
2. Check if return URL is accessible
3. Use sandbox credentials for testing

## License

MIT License

## Contact

For questions or support, please contact:
- Email: support@foodordering.com
- GitHub: [hoanganhcoder](https://github.com/hoanganhcoder)

---

Made with ❤️ by the Food Ordering Team
