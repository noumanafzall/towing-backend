# Customer API Documentation

## Authentication Endpoints

### Register Customer
- **Endpoint**: `POST /auth/register/customer`
- **Description**: Register a new customer account
- **Request Body**:
  ```json
  {
    "email": "string",
    "fullName": "string",
    "phoneNumber": "string",
    "password": "string",
    "confirmPassword": "string",
    "termsAccepted": "boolean",
    "country": "string",
    "city": "string",
    "region": "string (optional)"  // State/Province/Region
  }
  ```
- **Response**: Returns the created customer profile with JWT token

### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Login for customers and drivers
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: Returns JWT token and user profile

## Vehicle Management

### Get All Customer Vehicles
- **Endpoint**: `GET /customers/vehicles`
- **Description**: Get all vehicles registered to the authenticated customer
- **Headers**: Authorization token required
- **Response**: List of customer vehicles

### Get Specific Vehicle
- **Endpoint**: `GET /customers/vehicles/:id`
- **Description**: Get details of a specific vehicle
- **Headers**: Authorization token required
- **Response**: Vehicle details

### Add New Vehicle
- **Endpoint**: `POST /customers/vehicles`
- **Description**: Register a new vehicle for the customer
- **Headers**: Authorization token required
- **Request Body**:
  ```json
  {
    "make": "string",
    "model": "string",
    "year": "number",
    "licensePlate": "string",
    "isDefault": "boolean",
    "photos": "string[]"
  }
  ```
- **Response**: Created vehicle details

### Update Vehicle
- **Endpoint**: `PUT /customers/vehicles/:id`
- **Description**: Update vehicle details
- **Headers**: Authorization token required
- **Request Body**: Same as Add New Vehicle
- **Response**: Updated vehicle details

### Delete Vehicle
- **Endpoint**: `DELETE /customers/vehicles/:id`
- **Description**: Remove a vehicle from customer's profile
- **Headers**: Authorization token required
- **Response**: Success message

## Wallet Operations

### Get Wallet Balance
- **Endpoint**: `GET /wallet/:userId`
- **Description**: Get customer's wallet balance and details
- **Headers**: Authorization token required
- **Response**: Wallet details and balance

### Get All Transactions
- **Endpoint**: `GET /wallet/:userId/transactions`
- **Description**: Get customer's transaction history
- **Headers**: Authorization token required
- **Response**: List of transactions

### Deposit Money
- **Endpoint**: `POST /wallet/:userId/deposit`
- **Description**: Add money to customer's wallet
- **Headers**: Authorization token required
- **Request Body**:
  ```json
  {
    "amount": "number",
    "paymentMethod": "string"
  }
  ```
- **Response**: Updated wallet balance

### Withdraw Money
- **Endpoint**: `POST /wallet/:userId/withdraw`
- **Description**: Withdraw money from customer's wallet
- **Headers**: Authorization token required
- **Request Body**:
  ```json
  {
    "amount": "number",
    "withdrawalMethod": "string"
  }
  ```
- **Response**: Updated wallet balance

## Ride Management

### Create New Ride
- **Endpoint**: `POST /rides`
- **Description**: Create a new ride request
- **Headers**: Authorization token required
- **Request Body**:
  ```json
  {
    "pickupLocation": "string",
    "dropoffLocation": "string",
    "pickupDateTime": "string",
    "vehicleId": "number",
    "notes": "string",
    "beforeRidePhotos": "string[]"
  }
  ```
- **Response**: Created ride details

### Get Ride Details
- **Endpoint**: `GET /rides/:id`
- **Description**: Get details of a specific ride
- **Headers**: Authorization token required
- **Response**: Complete ride details including status

### Associate Vehicle with Ride
- **Endpoint**: `POST /rides/:id/vehicle`
- **Description**: Associate a vehicle with an existing ride
- **Headers**: Authorization token required
- **Request Body**:
  ```json
  {
    "vehicleId": "number",
    "beforeRidePhotos": "string[]",
    "afterRidePhotos": "string[]"
  }
  ```
- **Response**: Updated ride details

## Refund Requests

### Create Refund Request
- **Endpoint**: `POST /refund-requests`
- **Description**: Submit a refund request for a ride
- **Headers**: Authorization token required
- **Request Body**:
  ```json
  {
    "rideId": "number",
    "reason": "string",
    "amount": "number",
    "description": "string"
  }
  ```
- **Response**: Created refund request details

### Get Refund Requests
- **Endpoint**: `GET /refund-requests`
- **Description**: Get all refund requests for the customer
- **Headers**: Authorization token required
- **Response**: List of refund requests

## Location Services

### Get Ride Location
- **Endpoint**: `GET /location/:rideId/last`
- **Description**: Get the current location of an ongoing ride
- **Headers**: Authorization token required
- **Response**: Latest location coordinates and timestamp

### Get Location History
- **Endpoint**: `GET /location/:rideId/history`
- **Description**: Get the complete location history of a ride
- **Headers**: Authorization token required
- **Response**: Array of location updates with timestamps

## Important Notes

1. All endpoints require authentication unless specifically noted
2. All dates should be in ISO format
3. Photo uploads should be base64 encoded strings
4. Error responses follow the format:
   ```json
   {
     "statusCode": "number",
     "message": "string",
     "error": "string"
   }
   ```
5. Pagination is available on list endpoints using `skip` and `take` query parameters 