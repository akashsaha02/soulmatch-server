const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// middlewares
app.use(cors(
    {
        origin: ['http://localhost:5173', 'https://soulmatch-b2923.web.app', 'https://soulmatch-b2923.firebase.app'],
        credentials: true
    }
));
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
        const biodataCollection = database.collection("biodatas");
        const favouritesCollection = database.collection("favourites");
        const contactRequestCollection = database.collection("contactRequests");
        const premiumRequestCollection = database.collection("premiumRequests");
        const successStoryCollection = database.collection("successStories");

        // jwt api

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token })
        });

        // middleware functions
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
        // middleware function end

        // payment stripe api
        app.post("/create-payment-intent", verifyToken, async (req, res) => {
            const { price } = req.body;
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: price,
                currency: "usd",
                // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });


        // payment contact request api

        app.post('/payments', verifyToken, async (req, res) => {
            const payment = req.body;
            const result = await contactRequestCollection.insertOne(payment);
            res.json(result);
        });

        app.get('/contact-requests', verifyToken, async (req, res) => {
            const email = req.query.email;

            if (!email) {
                return res.status(400).json({ message: "Email is required." });
            }

            try {
                const requests = await contactRequestCollection.find({ email }).toArray();
                res.json(requests);
            } catch (error) {
                console.error("Error fetching contact requests:", error);
                res.status(500).json({ message: "Failed to fetch contact requests." });
            }
        });

        app.delete('/contact-requests/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await contactRequestCollection.deleteOne(query);
            res.json(result);
        });

        app.patch('/admin/contact-requests/:id', verifyToken, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const { biodataId } = req.body;
            const parsedBiodataId = parseInt(biodataId);

            const query = {
                biodataId: parsedBiodataId
            }
            const biodata = await biodataCollection.findOne(query);
            if (!biodata || !biodata.mobileNumber) {
                return res.status(404).json({ message: "Biodata or mobile number not found." });
            }
            const result = await contactRequestCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: 'approved', mobileNumber: biodata.mobileNumber } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Contact request not found." });
            }

            res.json({ message: "Contact request approved successfully." });

        });

        app.get('/admin/contact-requests', verifyToken, verifyAdmin, async (req, res) => {
            const contactRequests = await contactRequestCollection.find().toArray();
            res.send(contactRequests);
        });

        // Premium User Requests
        app.post('/request-premium/:id', verifyToken, async (req, res) => {
            const id = req.params.id;

            try {
                const query = { _id: new ObjectId(id) };
                const biodata = await biodataCollection.findOne(query);

                if (!biodata) {
                    return res.status(404).send({ message: 'Biodata not found' });
                }

                // Check if a request already exists
                const existingRequest = await premiumRequestCollection.findOne({
                    biodataUniqueId: id,
                    userEmail: biodata.userEmail,
                });
                if (existingRequest) {
                    return res.status(400).send({ message: 'Premium request already exists for this user and biodata' });
                }
                // Create a new premium request
                const requestPremium = {
                    biodataUniqueId: id,
                    biodataId: biodata.biodataId,
                    userEmail: biodata.userEmail,
                    userName: biodata.name,
                    status: 'pending',
                };
                const result = await premiumRequestCollection.insertOne(requestPremium);
                res.send(result);
            } catch (error) {
                console.error('Error creating premium request:', error);
                res.status(500).send({ message: 'Internal server error' });
            }
        });

        app.get('/request-premium', verifyToken, verifyAdmin, async (req, res) => {
            const requests = await premiumRequestCollection.find().toArray();
            res.send(requests);
        })

        app.get('/request-premium/:email', verifyToken, async (req, res) => {
            const email = req.params.email
            const requests = await premiumRequestCollection.find({ userEmail: email }).toArray();
            res.send(requests);
        })

        app.patch('/admin/premium-requests/:id/approve', verifyToken, verifyAdmin, async (req, res) => {
            const { id } = req.params;
            const { userEmail } = req.body;

            try {
                // Update the request status to 'approved'
                await premiumRequestCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { status: 'approved' } }
                );
                // Update the user role to 'premium'
                await userCollection.updateOne(
                    { email: userEmail },
                    { $set: { role: 'premium' } }
                );

                await biodataCollection.updateOne(
                    { userEmail: userEmail },
                    { $set: { isPremium: true } }
                )

                res.send({ message: 'Request approved and user role updated' });
            } catch (error) {
                console.error("Error approving request:", error);
                res.status(500).send({ message: 'Failed to approve request' });
            }
        });

        app.delete('/admin/premium-requests/:id', verifyToken, async (req, res) => {
            const { id } = req.params;

            try {
                const result = await premiumRequestCollection.deleteOne({
                    _id: new ObjectId(id),
                });
                res.send(result);
            } catch (error) {
                console.error("Error deleting request:", error);
                res.status(500).send({ message: 'Failed to delete request' });
            }
        });

        // User Collection
        app.get('/users/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'Forbidden request' });
            }
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.send(user);
        });

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
            } else {
                isAdmin = false;
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
            const { role, email } = req.body; // Expecting role: 'admin', 'premium', or 'normal'
            const emailQuery = { userEmail: email };
            const updateBiodata = { $set: { isPremium: true } };
            if (role == 'premium') {
                await biodataCollection.updateOne(emailQuery, updateBiodata);
            } else {
                await biodataCollection.updateOne(emailQuery, { $set: { isPremium: false } });
            }
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

        // Fetch all biodatas
        app.get('/biodatas', async (req, res) => {
            try {
                const biodatas = await biodataCollection.find().toArray();
                res.send(biodatas);
            } catch (error) {
                res.status(500).send({ error: "Failed to fetch biodatas" });
            }
        });

        app.get('/biodatas/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const biodata = await biodataCollection.findOne({ userEmail: email });
                res.send(biodata);
            } catch (error) {
                res.status(500).send({ error: "Failed to fetch biodata" });
            }
        });

        app.get('/biodatas/details/:id', verifyToken, async (req, res) => {
            try {
                const id = req.params.id;
                const biodata = await biodataCollection.findOne({ _id: new ObjectId(id) });
                res.send(biodata);
            } catch (error) {
                res.status(500).send({ error: "Failed to fetch biodata" });
            }
        });

        // Create a new biodata
        app.post('/biodatas', verifyToken, async (req, res) => {
            try {
                const biodata = req.body;

                // Check if biodata already exists for the user
                const existingBiodata = await biodataCollection.findOne({ userEmail: biodata.userEmail });

                if (existingBiodata) {
                    // Update existing biodata
                    const result = await biodataCollection.updateOne(
                        { userEmail: biodata.userEmail },
                        { $set: biodata }
                    );
                    res.status(200).json({ message: "Biodata updated successfully", result });
                } else {
                    // Find the last created biodata to determine the next id
                    const lastBiodata = await biodataCollection.find().sort({ biodataId: -1 }).limit(1).toArray();
                    const lastId = lastBiodata.length ? lastBiodata[0].biodataId : 0;

                    // Set the new biodata ID
                    biodata.biodataId = lastId + 1;

                    // Insert the biodata into the collection
                    const result = await biodataCollection.insertOne(biodata);
                    res.status(201).json({ message: "Biodata created successfully", result });
                }
            } catch (error) {
                console.error("Error creating/updating biodata:", error);
                res.status(500).send({ error: "Failed to create or update biodata" });
            }
        });



        //Success Stories
        app.post('/success-stories', verifyToken, async (req, res) => {
            try {
                const data = req.body;
                const { selfBiodataId, partnerBiodataId, coupleImage, successStory, marriageDate, rating } = data;

                // Fetch biodata for self and partner
                const selfBiodata = await biodataCollection.findOne({ biodataId: parseInt(selfBiodataId) });
                const partnerBiodata = await biodataCollection.findOne({ biodataId: parseInt(partnerBiodataId) });

                // Check if biodatas exist
                if (!selfBiodata || !partnerBiodata) {
                    return res.status(404).json({ error: 'One or both biodatas not found' });
                }

                // Extract required fields from biodatas
                const selfDetails = {
                    name: selfBiodata.name,
                    photo: selfBiodata.profileImage,
                    birthday: selfBiodata.dob,
                    occupation: selfBiodata.occupation,
                };

                const partnerDetails = {
                    name: partnerBiodata.name,
                    photo: partnerBiodata.profileImage,
                    birthday: partnerBiodata.dob,
                    occupation: partnerBiodata.occupation,
                };

                const story = {
                    selfBiodataId,
                    partnerBiodataId,
                    selfDetails,
                    partnerDetails,
                    coupleImage,
                    successStory,
                    marriageDate, // New field
                    rating: parseFloat(rating), // New field
                    date: new Date(), // Record the current timestamp
                };

                const result = await successStoryCollection.insertOne(story);
                // Return success response
                res.send(result);
            } catch (error) {
                console.error('Error saving success story:', error);
                res.status(500).json({ error: 'Failed to save success story' });
            }
        });


        app.get('/success-stories', async (req, res) => {
            try {
                const stories = await successStoryCollection.find().toArray();
                res.send(stories);
            } catch (error) {
                console.error('Error fetching success stories:', error);
                res.status(500).json({ error: 'Failed to fetch success stories' });
            }
        });



        // Favourites Collection
        app.get('/favourites', verifyToken, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await favouritesCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/favourites', verifyToken, async (req, res) => {
            const favourite = req.body;
            const { email, favouriteEmail, favouriteBiodataId } = favourite;
            // Check if the user is trying to add their own profile to favourites
            if (email === favouriteEmail) {
                return res.status(400).json({ message: 'You cannot add your own profile to favourites.' });
            }
            // Check if this user already added this biodata to their favourites
            const existingFavourite = await favouritesCollection.findOne({
                email: email,
                favouriteBiodataId: favouriteBiodataId,
            });
            if (existingFavourite) {
                return res.status(400).json({ message: 'Already added to favourites!' });
            }
            // If not, add the new favourite
            const result = await favouritesCollection.insertOne(favourite);
            res.json(result);
        });

        app.delete('/favourites/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await favouritesCollection.deleteOne(query);
            res.json(result);
        });

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Soul match Server!');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});