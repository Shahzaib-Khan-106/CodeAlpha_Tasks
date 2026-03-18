import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/ecommerce")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const JWT_SECRET = process.env.JWT_SECRET || "fallbackSecret";

// Schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, default: "user" }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }
});


const orderSchema = new mongoose.Schema({
  username: String,
  cart: Array,
  status: { type: String, default: "Pending" }
});

// Models
const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

// Seed products if empty
async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      { name: "White Tshirt", price: 20, image: "shirt.jpg" },
      { name: "Shoes", price: 20, image: "shoes.jpg" },
      { name: "Hat", price: 20, image: "hat.jpg" }
    ]);
    console.log("Products seeded");
  }
}
seedProducts();

// Routes
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.json({ message: "User Registered Successfully" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid Credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

app.get("/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No Token Provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: "Profile data", user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

app.post("/order", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No Token Provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { cart } = req.body;

    const order = new Order({ username: decoded.username, cart });
    await order.save();
    res.json({ message: "Order placed Successfully" });
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

app.get("/orders", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No Token Provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const orders = await Order.find({ username: decoded.username });
    res.json({ message: "User Orders", orders });
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

// Admin routes
app.get("/admin/orders", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No Token Provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ username: decoded.username });
    if (user.role !== "admin") return res.status(403).json({ message: "Access Denied" });

    const orders = await Order.find();
    res.json({ message: "All Orders", orders });
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

app.post("/admin/product", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No Token Provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ username: decoded.username });
    if (user.role !== "admin") return res.status(403).json({ message: "Access Denied" });

    const { name, price, image } = req.body;
    const product = new Product({ name, price, image });
    await product.save();
    res.json({ message: "Product Added Successfully" });
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
});

app.put("/admin/product/:id", async (req, res) => {
  const { name, price, image } = req.body;
  await Product.findByIdAndUpdate(req.params.id, { name, price, image });
  res.json({ message: "Product Updated Successfully" });
});

app.delete("/admin/product/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product Deleted Successfully" });
});

app.put("/admin/order/:id", async (req, res) => {
  const { status } = req.body;
  await Order.findByIdAndUpdate(req.params.id, { status });
  res.json({ message: "Order Status Updated" });
});

// Product details
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
