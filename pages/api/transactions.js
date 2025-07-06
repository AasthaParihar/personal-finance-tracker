// pages/api/transactions.js
import { MongoClient, ObjectId } from 'mongodb';

// Use your actual MongoDB Atlas connection string
const uri = process.env.MONGODB_URI || 'mongodb+srv://aasthaparihar:aastha-parihar@cluster0.lo4osnq.mongodb.net/financeDB?retryWrites=true&w=majority&appName=Cluster0';

let client;
let clientPromise;

// Use connection pooling for better performance
if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

async function connectToDatabase() {
  try {
    const client = await clientPromise;
    return client.db('financeDB'); // Using financeDB as requested
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('transactions');

    switch (req.method) {
      case 'GET':
        try {
          const transactions = await collection
            .find({})
            .sort({ date: -1, _id: -1 })
            .toArray();
          
          res.status(200).json(transactions);
        } catch (error) {
          console.error('Error fetching transactions:', error);
          res.status(500).json({ error: 'Failed to fetch transactions' });
        }
        break;

      case 'POST':
        try {
          const { description, amount, category, date, type } = req.body;

          // Validation
          if (!description || amount === undefined || amount === null || !date) {
            return res.status(400).json({ 
              error: 'Missing required fields: description, amount, date' 
            });
          }

          if (isNaN(amount)) {
            return res.status(400).json({ error: 'Amount must be a valid number' });
          }

          const transaction = {
            description: description.trim(),
            amount: parseFloat(amount),
            category: category?.trim() || 'General', // Make category optional with default
            date: new Date(date),
            type: type || (amount >= 0 ? 'income' : 'expense'),
            createdAt: new Date()
          };

          const result = await collection.insertOne(transaction);
          const newTransaction = await collection.findOne({ _id: result.insertedId });
          
          res.status(201).json(newTransaction);
        } catch (error) {
          console.error('Error adding transaction:', error);
          res.status(500).json({ error: 'Failed to add transaction' });
        }
        break;

      case 'PUT':
        try {
          const { id, description, amount, category, date, type } = req.body;

          if (!id) {
            return res.status(400).json({ error: 'Transaction ID is required' });
          }

          if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
          }

          // Validation
          if (!description || amount === undefined || amount === null || !date) {
            return res.status(400).json({ 
              error: 'Missing required fields: description, amount, date' 
            });
          }

          if (isNaN(amount)) {
            return res.status(400).json({ error: 'Amount must be a valid number' });
          }

          const updateData = {
            description: description.trim(),
            amount: parseFloat(amount),
            category: category?.trim() || 'General',
            date: new Date(date),
            type: type || (amount >= 0 ? 'income' : 'expense'),
            updatedAt: new Date()
          };

          const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
          );

          if (!result.value) {
            return res.status(404).json({ error: 'Transaction not found' });
          }

          res.status(200).json(result.value);
        } catch (error) {
          console.error('Error updating transaction:', error);
          res.status(500).json({ error: 'Failed to update transaction' });
        }
        break;

      case 'DELETE':
        try {
          const { id } = req.body;

          if (!id) {
            return res.status(400).json({ error: 'Transaction ID is required' });
          }

          if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid transaction ID' });
          }

          const result = await collection.deleteOne({ _id: new ObjectId(id) });

          if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
          }

          res.status(200).json({ message: 'Transaction deleted successfully' });
        } catch (error) {
          console.error('Error deleting transaction:', error);
          res.status(500).json({ error: 'Failed to delete transaction' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}