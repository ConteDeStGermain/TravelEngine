import axios from 'axios';
import { readFile } from 'fs/promises';
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

let places = [
  "Cluj-napoca, Romania",
  "Brasov, Romania",
  "Iasi, Romania",
  "Timisoara, Romania",
  "Bangkok, Thailand",
  "London, United Kingdom",
  "Paris, France",
  "Dubai, United Arab Emirates",
  "New York City, United States",
  "Singapore, Singapore",
  "Kuala Lumpur, Malaysia",
  "Istanbul, Turkey",
  "Tokyo, Japan",
  "Seoul, South Korea",
  "Hong Kong, Hong Kong",
  "Barcelona, Spain",
  "Amsterdam, Netherlands",
  "Milan, Italy",
  "Taipei, Taiwan",
  "Rome, Italy",
  "Osaka, Japan",
  "Vienna, Austria",
  "Shanghai, China",
  "Prague, Czech Republic",
  "Los Angeles, United States",
  "Munich, Germany",
  "Miami, United States",
  "Dublin, Ireland",
  "Delhi, India",
  "Toronto, Canada",
  "Berlin, Germany",
  "Las Vegas, United States",
  "Marrakech, Morocco",
  "Sydney, Australia",
  "Lisbon, Portugal",
  "Rio de Janeiro, Brazil",
  "Budapest, Hungary",
  "Bangalore, India",
  "Bali, Indonesia",
  "Beijing, China",
  "Cairo, Egypt",
  "Cape Town, South Africa",
  "Vancouver, Canada",
  "Buenos Aires, Argentina",
  "Jerusalem, Israel",
  "Hanoi, Vietnam",
  "Ho Chi Minh City, Vietnam",
  "Copenhagen, Denmark",
  "Brussels, Belgium",
  "Jakarta, Indonesia",
  "Melbourne, Australia",
  "Athens, Greece",
  "Warsaw, Poland",
  "Mexico City, Mexico",
  "San Francisco, United States",
  "Tel Aviv, Israel",
  "Havana, Cuba",
  "Saint Petersburg, Russia",
  "Edinburgh, United Kingdom",
  "Zurich, Switzerland",
  "Auckland, New Zealand",
  "Helsinki, Finland",
  "Stockholm, Sweden",
  "Lima, Peru",
  "Sao Paulo, Brazil",
  "Kolkata, India",
  "Casablanca, Morocco",
  "Bogota, Colombia",
  "Lyon, France",
  "Mumbai, India",
  "Chicago, United States",
  "Antalya, Turkey",
  "Phuket, Thailand",
  "Mecca, Saudi Arabia",
  "Krakow, Poland",
  "Venice, Italy",
  "Guangzhou, China",
  "Granada, Spain",
  "Florence, Italy",
  "Moscow, Russia",
  "Dublin, Ireland",
  "Seattle, United States",
  "Boston, United States",
  "Shenzhen, China",
  "Brisbane, Australia",
  "Quebec City, Canada",
  "Bordeaux, France",
  "Santiago, Chile",
  "Damascus, Syria",
  "San Diego, United States",
  "Valencia, Spain",
  "Frankfurt, Germany",
  "Calgary, Canada",
  "Orlando, United States",
  "Cancun, Mexico",
  "Johannesburg, South Africa",
  "Monaco, Monaco",
  "Bucharest, Romania",
  "Cartagena, Colombia",
  "Kyoto, Japan",
  "Chiang Mai, Thailand",
  "Lahore, Pakistan",
  "Salvador, Brazil",
  "Manchester, United Kingdom",
  "Belfast, United Kingdom",
  "Cologne, Germany",
  "Sofia, Bulgaria",
  "Bratislava, Slovakia",
  "Porto, Portugal",
  "Perth, Australia",
  "Ljubljana, Slovenia",
  "Belgrade, Serbia",
  "Birmingham, United Kingdom",
  "Edmonton, Canada",
  "Guadalajara, Mexico",
  "Monterrey, Mexico",
  "Quito, Ecuador",
  "Tashkent, Uzbekistan",
  "Riga, Latvia",
  "Nairobi, Kenya",
  "Tallinn, Estonia",
  "Krabi, Thailand",
  "Da Nang, Vietnam",
  "Penang, Malaysia",
  "Minsk, Belarus",
  "Algiers, Algeria",
  "Accra, Ghana",
  "Harare, Zimbabwe",
  "Dar es Salaam, Tanzania",
  "Colombo, Sri Lanka",
  "Phnom Penh, Cambodia",
  "Yangon, Myanmar",
  "Lusaka, Zambia",
  "Kigali, Rwanda",
  "Abuja, Nigeria",
  "Dhaka, Bangladesh",
  "Kathmandu, Nepal",
  "Amman, Jordan",
  "Muscat, Oman",
  "Baku, Azerbaijan",
  "Tbilisi, Georgia",
  "Yerevan, Armenia",
  "Astana, Kazakhstan",
  "Islamabad, Pakistan",
  "Karachi, Pakistan",
  "Male, Maldives",
  "Reykjavik, Iceland",
  "Tunis, Tunisia",
  "Rabat, Morocco",
  "Lima, Peru",
  "Montevideo, Uruguay",
  "Caracas, Venezuela",
  "Kingston, Jamaica",
  "Bridgetown, Barbados",
  "Havana, Cuba",
  "Port-au-Prince, Haiti",
  "Nassau, Bahamas",
  "San Juan, Puerto Rico"
];

app.get("/schedule", async (req: any, res: any) => {
  const address: string = req.query.address.toLowerCase();
  // const coordinates = await getCoordinates(address);
  // let [city, country] = address.split(', ');  
  let [city, country] = "";  
  
  let index = 0;
  let stoppedCountry = "";

  try {
    for (let i = 0; i < places.length; i++) {
      [city, country] = places[i].split(', ');
      index = i;
      stoppedCountry = places[i];
      await scrapeMissingCity(city, country);
    }
  } catch (error) {
    console.log(error);
    console.log(index);
    console.log(stoppedCountry)
  }

  

  // res.json("Received");
});


interface PlaceDetails {
  name: string;
  address: string;
  rating: number;
  numberOfRatings: number;
  isOpen: boolean;
}

async function getCoordinates(address: string): Promise<any> {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.GAPI_KEY}`
    );
 
    
    return {
      "lat": response.data.results[0].geometry.location.lat, 
      "lng":response.data.results[0].geometry.location.lng
    };
  } catch (error) {
    console.error(error);
    return error; 
  }
}

async function getPlaces(lat: number, lng: number, range: number, min_rating: any, type: string, keyword: string) {
  let results: any[] = [];
  let nextPageToken: string | null = null;
  keyword = keyword == "" ? "" : `&keyword=${keyword}`;
  min_rating = min_rating == -1 ? "" : `&min_rating${min_rating}`;
  let url: string = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GAPI_KEY}&location=${lat},${lng}&radius=${range}&types=${type}${keyword}${min_rating}`;

  
  // delay(1200); // needed to 'activate' the nextPageToken, otherwise will get INVALID_REQUEST
  url = url + (nextPageToken !== null ? `&pagetoken=${nextPageToken}` : "");
  let response: any = await axios.get(url);
  nextPageToken = response.data.next_page_token;    

  let filteredResult = response.data.results.filter((result: any) => result.business_status === 'OPERATIONAL');
  filteredResult = filteredResult.map((result: any) => ({
    name: result.name,
    address: result.vicinity,
    ratings: result.rating,
    numberOfRatings: result.user_ratings_total,
    types: result.types,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    id: result.place_id,
  }));
  
  results = results.concat(filteredResult);
  results = results.sort((a, b) => b.numberOfRatings - a.numberOfRatings);
  results = results.filter((el: any) => el.numberOfRatings >= 50);
  results = filterDuplicates(results);
  
  // ------------------

  url = url + `&pagetoken=${nextPageToken}`;
  response = await axios.get(url); 

  filteredResult = response.data.results.filter((result: any) => result.business_status === 'OPERATIONAL');
  filteredResult = filteredResult.map((result: any) => ({
    name: result.name,
    address: result.vicinity,
    ratings: result.rating,
    numberOfRatings: result.user_ratings_total,
    types: result.types,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    id: result.place_id,
  }));
  
  results = results.concat(filteredResult);
  results = results.sort((a, b) => b.numberOfRatings - a.numberOfRatings);
  results = results.filter((el: any) => el.numberOfRatings >= 50);
  results = filterDuplicates(results);

  return results;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

function getInRange(pool: any, aroundEvent: any) {
  let eventInRange: any[] = [];
  if (aroundEvent) {

    pool.forEach((event : any) => {
      if (withinRange(event, aroundEvent, 7)) {
        eventInRange.push(event);
      }
    })
    
  }
  let returnEvent = eventInRange[getRandomNum(eventInRange.length)]
  return returnEvent;
}

async function getPlaceDetails(placeName: string): Promise<PlaceDetails | null> {
  try {
    // Step 1: Search for the place using the place name
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=place_id&key=${process.env.GAPI_KEY}`;
    const searchResponse = await axios.get(searchUrl);
    const placeId = searchResponse.data.candidates[0]?.place_id;

    if (!placeId) {
      console.error('Place not found.');
      return null;
    }

    // Step 2: Get the place details using the place ID
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,opening_hours&key=${process.env.GAPI_KEY}`;
    const detailsResponse = await axios.get(detailsUrl);
    const placeDetails = detailsResponse.data.result;

    return {
      name: placeDetails.name,
      address: placeDetails.formatted_address,
      numberOfRatings: placeDetails.user_ratings_total,
      rating: placeDetails.rating,
      isOpen: placeDetails.opening_hours?.open_now,
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

async function scrapeMissingCity(city: string, country: string) {
  await scrapeData(city, country, 1);
  await scrapeData(city, country, 2);
  await scrapeData(city, country, 3);
  await scrapeData(city, country, 4);
  await scrapeData(city, country, 5);
}

async function cityCountryExists(city: string, country: string): Promise<boolean> {
  const res = await pool.query(
    'SELECT * FROM place WHERE city = $1 AND country = $2',
    [city, country]
  );

  return res.rowCount > 0;
}
