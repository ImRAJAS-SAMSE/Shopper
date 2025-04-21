const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 4000;
const JWT_SECRET = "secret_ecom"; // Move to .env in production

// Middleware
app.use(express.json());
app.use(cors());
app.use('/images', express.static('upload/images'));

// DB Connection
mongoose.connect("", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Multer Setup
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Mongo Schemas
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});

// JWT Middleware
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes
app.get("/", (req, res) => res.send("API running"));

app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await Users.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: "User exists" });

    const cart = Object.fromEntries(Array.from({ length: 300 }, (_, i) => [i, 0]));
    const user = new Users({ name: username, email, password, cartData: cart });
    await user.save();

    const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user || user.password !== password)
      return res.status(400).json({ success: false, error: "Invalid credentials" });

    const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
    res.json({ success: true, token });
  } catch {
    res.status(500).json({ success: false, error: "Login failed" });
  }
});

app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

app.get("/newcollections", async (req, res) => {
  const products = await Product.find().sort({ date: -1 }).limit(8);
  res.send(products);
});

app.get("/popularinwomen", async (req, res) => {
  const products = await Product.find().limit(4);
  res.send(products);
});

app.post("/addtocart", fetchUser, async (req, res) => {
  const { itemId } = req.body;
  const user = await Users.findById(req.user.id);
  if (user) {
    user.cartData[itemId] = (user.cartData[itemId] || 0) + 1;
    await user.save();
    res.send("Item added to cart");
  } else {
    res.status(404).send("User not found");
  }
});

app.post("/removefromcart", fetchUser, async (req, res) => {
  const { itemId } = req.body;
  const user = await Users.findById(req.user.id);
  if (user && user.cartData[itemId] > 0) {
    user.cartData[itemId] -= 1;
    await user.save();
    res.send("Item removed from cart");
  } else {
    res.status(404).send("Item not found in cart");
  }
});

app.post("/getcart", fetchUser, async (req, res) => {
  const user = await Users.findById(req.user.id);
  res.json(user?.cartData || {});
});

app.post("/addproduct", async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newProduct = new Product({ id: (lastProduct?.id || 0) + 1, ...req.body });
    await newProduct.save();
    res.json({ success: true, name: newProduct.name });
  } catch {
    res.status(500).json({ success: false, error: "Product not added" });
  }
});

app.post("/removeproduct", async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, message: "Product removed" });
  } catch {
    res.status(500).json({ success: false, error: "Remove failed" });
  }
});

app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
