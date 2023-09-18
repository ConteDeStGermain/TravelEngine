import { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const address = req.query.address as string;
    const offset = req.query.offset as string;
    const response = await fetch(`http://localhost:8080/day_itin?address=${encodeURIComponent(address)}&offset=${encodeURIComponent(offset)}`)
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message })
  }
}