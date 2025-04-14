const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Image Upload Config
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    const filename = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:4000/images/${req.file.filename}`,
  });
});

// Middleware for Auth
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ errors: "Please authenticate using a valid token" });
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch {
    res.status(401).json({ errors: "Please authenticate using a valid token" });
  }
};

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

// Routes
app.get("/", (req, res) => res.send("Root"));

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (user && req.body.password === user.password) {
    const data = { user: { id: user.id } };
    const token = jwt.sign(data, "secret_ecom");
    res.json({ success: true, token });
  } else {
    res.status(400).json({ success: false, errors: "Incorrect email or password" });
  }
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await Users.findOne({ email });
  if (existingUser) return res.status(400).json({ success: false, errors: "User already exists" });

  const cart = Object.fromEntries(Array.from({ length: 300 }, (_, i) => [i, 0]));
  const user = new Users({ name: username, email, password, cartData: cart });
  await user.save();

  const token = jwt.sign({ user: { id: user.id } }, "secret_ecom");
  res.json({ success: true, token });
});

app.get("/allproducts", async (req, res) => res.send(await Product.find({})));

app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  res.send(products.slice(-8));
});

app.get("/popularinwomen", async (req, res) => {
  const products = await Product.find({});
  res.send(products.slice(0, 4));
});

app.post("/addtocart", fetchuser, async (req, res) => {
  const user = await Users.findById(req.user.id);
  user.cartData[req.body.itemId] += 1;
  await user.save();
  res.send("Added");
});

app.post("/removefromcart", fetchuser, async (req, res) => {
  const user = await Users.findById(req.user.id);
  if (user.cartData[req.body.itemId] > 0) user.cartData[req.body.itemId] -= 1;
  await user.save();
  res.send("Removed");
});

app.post("/getcart", fetchuser, async (req, res) => {
  const user = await Users.findById(req.user.id);
  res.json(user.cartData);
});

app.post("/addproduct", async (req, res) => {
  const lastProduct = await Product.findOne().sort({ id: -1 });
  const newId = lastProduct ? lastProduct.id + 1 : 1;
  const product = new Product({ id: newId, ...req.body });
  await product.save();
  res.json({ success: true, name: req.body.name });
});

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true, name: req.body.name });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
