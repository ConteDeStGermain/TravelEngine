import axios from 'axios';
import { scrapeData } from './gmap_tourist_scraper';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '@Builder',
  port: 5432,
});

require('dotenv').config();
var express = require("express");
var app = express();
const PORT = 8080

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});

app.get("/day_itin", async (req: any, res: any) => {
  try {
    const address: string = req.query.address.toLowerCase();
    const offset: number = Number(req.query.offset || 0);
    console.log("Getting day event for " + address + ", " + offset);

    let [city, country] = address.split(', ');

    if (city == undefined || country == undefined) {
      res.status(400).json({ error: 'Address must include both city and country' });
      return;
    }

    if (!(await cityCountryInDB(city, country))) {
      await scrapeMissingCity(city, country);
    }

    let attractions = await getPlaceDetails(city, country, 'tourist_attraction');
    let parks = attractions.filter(attraction => attraction.name.toLowerCase().includes('park'));
    attractions = attractions.filter(attraction => !attraction.name.toLowerCase().includes('park'));
    let bk = await getPlaceDetails(city, country, 'breakfast');
    let dnr = await getPlaceDetails(city, country, 'dinner');
    let ckt = await getPlaceDetails(city, country, 'cocktail');
    let clb = await getPlaceDetails(city, country, 'club');

    if (offset < 0 || offset + 2 >= attractions.length) {
      res.status(400).json({ error: 'Invalid offset parameter' });
      return;
    }

    let event1 = attractions[offset];
    let event2 = attractions[offset + 1];
    let event3 = attractions[offset + 2];

    // let breakfastPlace = await getInRange(bk, event1);
    // let dinnerPlace = await getInRange(dnr, event2);
    // let cocktailPlace = await getInRange(ckt, event3);
    // let clubPlace = await getInRange(clb, dinnerPlace);

    let breakfastPlace = bk[getRandomNum(bk.length)];
    let dinnerPlace = dnr[getRandomNum(dnr.length)];
    let cocktailPlace = ckt[getRandomNum(ckt.length)];
    let clubPlace = clb[getRandomNum(clb.length)];

    console.log('Done!')
    res.json({breakfastPlace, event1, dinnerPlace, event2, event3, cocktailPlace, clubPlace});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

app.get("/cities", async (req: any, res: any) => {
  try { 
    let cities = await getCityNames();
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while getting all cities' });
  }
});

function filterDuplicates(inputArr: any[]) {
  const idSet = new Set();
  for(const key in inputArr) {
    idSet.add(inputArr[key].id)
  }

  let filteredArr: any[] = [];
  for (const key in inputArr) {
    const object = inputArr[key];
    if (idSet.has(object.id)) {
      filteredArr[key] = object;
      idSet.delete(object.id);
    }
  }
  filteredArr = filteredArr.filter((result: any) => result != null);
  return filteredArr;
}

function getRandomNum(length: number) {
  return Math.floor(Math.random() * length);
}

function withinRange(place1: any, place2: any, range: number): boolean {  
  let lat1 = place1.lat;
  let lon1 = place1.lng;
  let lat2 = place2.lat;
  let lon2 = place2.lng;

  const earthRadius = 6371; // in kilometers

  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distanceInKm = earthRadius * c;

  return distanceInKm < range;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

async function scrapeMissingCity(city: string, country: string) {
  await scrapeData(city, country, 1);
  await scrapeData(city, country, 2);
  await scrapeData(city, country, 3);
  await scrapeData(city, country, 4);
  await scrapeData(city, country, 5);
}

async function cityCountryInDB(city: string, country: string): Promise<boolean> {
  const res = await pool.query(
    'SELECT * FROM place WHERE city = $1 AND country = $2',
    [city, country]
  );
  return res.rowCount > 0;
}

async function getPlaceDetails(city: string, country: string, type: string): Promise<any[]> {
  try {
    const res = await pool.query(
      'SELECT * FROM place WHERE city = $1 and country = $2 and type = $3 and rating IS NOT NULL and numberofratings IS NOT NULL and rating > 3.9 and numberofratings > 99 ORDER BY numberofratings DESC',
      [city, country, type]
    );
    return res.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function getCityNames(): Promise<string[]> {
  const res = await pool.query('SELECT DISTINCT city, country FROM place');
  return res.rows.map(row => `${capitalizeFirstLetter(row.city)}, ${capitalizeFirstLetter(row.country)}`);
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
