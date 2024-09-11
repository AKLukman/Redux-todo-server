const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;
// middlewares
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.send("hello");
});

const uri =
  "mongodb+srv://redux-todo:j9pjdfza4Xycasoo@cluster0.tdvhb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const tasksCollection = client.db("todos").collection("tasks");

    app.get("/tasks", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }

      const cursor = tasksCollection.find(query);
      const result = await cursor.toArray();
      res.send({ status: true, data: result });
    });
    app.post("/tasks", async (req, res) => {
      const data = req.body;
      const result = await tasksCollection.insertOne(data);
      res.send(result);
    });

    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const task = req.body;
      const updateDoc = {
        $set: {
          isCompleted: task.isCompleted,
          title: task.title,
          description: task.description,
          priority: task.priority,
        },
      };
      const options = { upsert: true };
      const result = await tasksCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
