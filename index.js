// ko7Cq1hUOi6lSEoV
// tenet025

const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

// middlewares
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const database = client.db("soulmatchDb");
        const userCollection = database.collection("users");

        // jwt api

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token })
        });

        // middlewares
        const verifyToken = (req, res, next) => {
            // console.log(req.headers.authorization)
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'Unauthorized request' });
            }

            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).send({ message: 'Forbidden request' });
                }
                req.decoded = decoded;
                next();
            });
        }

        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            const isAdmin = user.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'Forbidden request' });
            }
            next();
        }


        // User Collection

        app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        app.get('/users/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'Forbidden request' });
            }
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user.role === 'admin') {
                isAdmin = true;
            }
            res.send(isAdmin);
        });


        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                res.send({ message: 'User already exists', insertedId: existingUser._id });
                return;
            }

            // Set default role to "normal" if not provided
            user.role = user.role || 'normal';

            const result = await userCollection.insertOne(user);
            res.json(result);
        });




        // Update User Role
        app.patch('/users/role/:id', verifyToken, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const { role } = req.body; // Expecting role: 'admin', 'premium', or 'normal'
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: { role },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });


        app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.json(result);
        });




    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Bistro Boss Server!');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});