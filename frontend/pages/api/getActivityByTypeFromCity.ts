import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const city = req.query.city as string;
    const activityType = req.query.activityType as string;

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = await db.collection(process.env.COLLECTION_NAME);
    const data = await collection
    .find({ city: city, type: activityType })
    .sort({  numberofratings: -1 }) // Order by numberofratings descending, then rating descending
    .toArray();

    res.json(data);
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
}