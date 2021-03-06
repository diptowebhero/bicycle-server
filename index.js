const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
const cors = require("cors");

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mxsis.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db("supper_bikes");
    const service_collection = database.collection("services");
    const order_collection = database.collection("orders");
    const review_collection = database.collection("review");
    const user_collection = database.collection("user");

    //get all services
    app.get("/service", async (req, res) => {
      const cursor = service_collection.find({});
      const service = await cursor.toArray();
      res.send(service);
    });

    //get single service for order
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await service_collection.find(query).toArray();
      res.json(result[0]);
    });

    //post orders
    app.post("/addOrders", async (req, res) => {
      const newOrders = req.body;
      const result = await order_collection.insertOne(newOrders);
      res.json(result);
    });
    //add new product
    app.post("/addProduct", async (req, res) => {
      const newOrders = req.body;
      const result = await service_collection.insertOne(newOrders);
      res.json(result);
    });
    //add review
    app.post("/addReview", async (req, res) => {
      const review = req.body;
      const result = await review_collection.insertOne(review);
      res.json(result);
    });
    //get all review
    app.get("/reviews", async (req, res) => {
      const cursor = review_collection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });
    //saved userInfo
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await user_collection.insertOne(user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await user_collection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await user_collection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await user_collection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //load specific data
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = order_collection.find(query);
      const order = await cursor.toArray();
      res.send(order);
    });

    //delete a data
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await order_collection.deleteOne(query);
      res.json(result);
    });

    //get all orders
    app.get("/orders", async (req, res) => {
      const order = await order_collection.find({}).toArray();
      res.json(order);
    });

    //confirm order
    app.put("/confirm/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await order_collection.updateOne(query, order);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Supper bike server is running");
});

app.listen(port, () => {
  console.log("listening from", port);
});
