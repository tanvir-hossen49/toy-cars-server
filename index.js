const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("doctor is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xieksrd.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toysCollection = client.db("toy-cars").collection("cars");

    const customerReviewCollection = client
      .db("toy-cars")
      .collection("customer-review");

    app.get("/all-toys", async (_req, res) => {
      try {
        const limit = 20;
        const toys = await toysCollection.find().limit(limit).toArray();

        if (toys.length > 0) {
          res.json(toys);
        } else {
          res.status(404).json({ error: "No toys found" });
        }
      } catch (error) {
        console.error("Error fetching all toys:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching toys" });
      }
    });

    app.get("/category/:category", async (req, res) => {
      try {
        const category = req.params.category;

        const toysInCategory = await toysCollection
          .find({ subCategory: category })
          .toArray();

        if (toysInCategory.length > 0) {
          res.json(toysInCategory);
        } else {
          res.status(404).json({ error: "No toys found in this category" });
        }
      } catch (error) {
        console.error("Error fetching toys in category:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching toys" });
      }
    });

    app.get("/toy/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await toysCollection.findOne(query);

        if (result) {
          res.json(result); // Sending JSON response
        } else {
          res.status(404).json({ error: "Toy not found" });
        }
      } catch (error) {
        console.error("Error fetching toy:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching the toy" });
      }
    });

    app.get("/my-toys", async (req, res) => {
      try {
        const { sortType, email } = req.query;
        const sortDirection = sortType === "ascending" ? 1 : -1;

        const query = email ? { sellerEmail: email } : {};

        const toys = await toysCollection
          .find(query)
          .sort({ price: sortDirection })
          .toArray();

        if (toys.length > 0) {
          res.json(toys);
        } else {
          res.status(404).json({ error: "No toys found" });
        }
      } catch (error) {
        console.error("Error fetching my toys:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching toys" });
      }
    });

    app.delete("/my-toys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const deletionResult = await toysCollection.deleteOne(query);

        if (deletionResult.deletedCount === 1) {
          res.json({ message: "Toy deleted successfully" });
        } else {
          res.status(404).json({ error: "Toy not found" });
        }
      } catch (error) {
        console.error("Error deleting toy:", error);
        res
          .status(500)
          .json({ error: "An error occurred while deleting the toy" });
      }
    });

    app.put("/my-toy/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };

        const updatedToy = req.body;
        const updateFields = {
          $set: {
            toyName: updatedToy.toyName,
            price: updatedToy.price,
            category: updatedToy.category,
            quantity: updatedToy.quantity,
            descriptions: updatedToy.descriptions,
          },
        };

        const options = { upsert: true };

        const updateResult = await toysCollection.updateOne(
          filter,
          updateFields,
          options
        );

        if (updateResult.matchedCount === 1) {
          res.json({ message: "Toy updated successfully" });
        } else {
          res.status(404).json({ error: "Toy not found" });
        }
      } catch (error) {
        console.error("Error updating toy:", error);
        res
          .status(500)
          .json({ error: "An error occurred while updating the toy" });
      }
    });

    app.post("/toy", async (req, res) => {
      try {
        const toy = req.body;

        const insertionResult = await toysCollection.insertOne(toy);

        if (insertionResult.insertedCount === 1) {
          res.json({
            message: "Toy created successfully",
            insertedId: insertionResult.insertedId,
          });
        } else {
          res.status(500).json({ error: "Failed to create toy" });
        }
      } catch (error) {
        console.error("Error creating toy:", error);
        res
          .status(500)
          .json({ error: "An error occurred while creating the toy" });
      }
    });

    app.get("/my-toy/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const toy = await toysCollection.findOne(query);

        if (toy) {
          res.json(toy);
        } else {
          res.status(404).json({ error: "Toy not found" });
        }
      } catch (error) {
        console.error("Error fetching toy:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching the toy" });
      }
    });

    app.get("/top-rated-product", async (_req, res) => {
      try {
        const toys = await toysCollection
          .find()
          .sort({ ratings: -1 })
          .limit(6)
          .toArray();

        if (toys.length > 0) {
          res.json(toys);
        } else {
          res.status(404).json({ error: "No toys found" });
        }
      } catch (error) {
        console.error("Error fetching my toys:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching toys" });
      }
    });

    //customer collection
    app.get("/customer-review", async (_req, res) => {
      try {
        const reviews = await customerReviewCollection.find().toArray();

        if (reviews.length > 0) {
          res.json(reviews);
        } else {
          res.status(404).json({ error: "No customer reviews found" });
        }
      } catch (error) {
        console.error("Error fetching customer reviews:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching customer reviews" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log("app is running on port ", PORT);
});
