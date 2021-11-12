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
    app.post('/addOrders',async(req,res) => {
      const newOrders = req.body;
      const result = await order_collection.insertOne(newOrders);
      res.json(result);
      console.log(result);
    })

    //load specific data
    app.get('/orders/:email',async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const cursor =  order_collection.find(query)
      const order = await cursor.toArray();
      res.send(order);
    })

    //delete a data
    app.delete('/delete/:id',async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await order_collection.deleteOne(query);
      res.json(result);
    })

    //get all orders
    app.get('/orders',async(req, res)=>{
      const order = await order_collection.find({}).toArray();
      res.json(order)
    })

    //confirm order
    app.put('/confirm/:id',async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)}
      const order = {
        $set:{
          status:"Shipped"
        }
      }
      const result = await order_collection.updateOne(query,order)
      res.json(result)
    })

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
