import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://aasthaparihar:aastha-parihar@cluster0.lo4osnq.mongodb.net/financeDB?retryWrites=true&w=majority&appName=Cluster0";

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;