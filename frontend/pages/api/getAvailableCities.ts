import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);
    const collection = await db.collection(process.env.COLLECTION_NAME);

    let uniqueCities = await collection.distinct("city");
    // uniqueCities = uniqueCities
    //   .map(city => capitalizeFirstLetter(city))
    //   .map(country => capitalizeFirstLetter(country));
    res.json(uniqueCities);
  } catch (e) {
    console.log(e);
  }
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
