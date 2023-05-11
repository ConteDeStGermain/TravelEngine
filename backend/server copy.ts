import axios from 'axios';
import { scrapeData } from './gmap_tourist_scraper';

require('dotenv').config();
var express = require("express");
var app = express();
const PORT = 8080

app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});

app.get("/schedule", async (req: any, res:any) => {
  const address: string = req.query.address;
  const coordinates = await getCoordinates(address);
  const dayType = "tourist_attraction|point_of_interest|art_gallery|park|library|historical_monument|historical_place|landmark|church";
  const eveningType = "lounge|bar|tea_room|bar, pool_hall|pub";
  const foodType = "restaurant|cafe";

  

  // const mfoods = await getPlaces(coordinates.lat, coordinates.lng, 50000, 4, foodType, "coffee shop");
  // const foods = await getPlaces(coordinates.lat, coordinates.lng, 50000, 4, foodType, "dinner");
  const dayEvents = await getPlaces(coordinates.lat, coordinates.lng, 50000, -1, dayType, "")
  // const eveningEvents = await getPlaces(coordinates.lat, coordinates.lng, 50000, -1, eveningType, "");

  // console.log(mfoods.length)
  // console.log(foods.length)
  console.log( dayEvents.length)
  // console.log(eveningEvents.length)

  // let rand: number = getRandomNum(mfoods.length);
  // let bk: any = mfoods[rand];
  // let e1: any = getInRange(dayEvents, bk);
  // let e2: any = getInRange(dayEvents, e1);
  // let e3: any = getInRange(dayEvents, e2);
  // let dn: any = getInRange(foods, e3);
  // let ne: any = getInRange(eveningEvents, dn);


  // res.json({bk, e1, e2, e3, dn, ne});
});



// Version 1
// app.get("/schedule", async (req: any, res:any) => {
//   const address: string = req.query.address;

//   const coordinates = await getCoordinates(address);
//   // google places sdk result
//   let attractionType = "tourist_attraction|point_of_interest|establishment|art_gallery|park|library|historical_monument|historical_place|landmark|church";
//   let eveninngActivity = "night_club|lounge|bar|tea_room|bar, pool_hall|pub"
//   let keyword = "basilica";
  
//   let bk: any = await getPlaces(coordinates.lat, coordinates.lng, 15000, 4, "restaurant", "breakfast");
//   bk = bk[getRandomNum(bk.length)];

//   let e1: any = await getPlaces(bk.lat, bk.lng, 5000, -1, attractionType, "");
//   e1 = e1[getRandomNum(e1.length)];

//   let ln: any = await getPlaces(e1.lat, e1.lng, 5000, 4, "restaurant", "lunch");
//   ln = ln[getRandomNum(ln.length)];

//   let e2: any = await getPlaces(ln.lat, ln.lng, 7000, -1, attractionType, "");
//   e2 = e2[getRandomNum(e2.length)];

//   let e3: any = await getPlaces(e2.lat, e2.lng, 7000, -1, attractionType, "");
//   e3 = e3[getRandomNum(e3.length)];

//   let dn: any = await getPlaces(e3.lat, e3.lng, 5000, 4, "restaurant", "lunch");
//   dn = dn[getRandomNum(dn.length)];

//   let ne: any = await getPlaces(dn.lat, dn.lng, 7000, 4, eveninngActivity, "");
//   ne = ne[getRandomNum(ne.length)];

//   res.json({bk, e1, ln, e2, e3, dn, ne});
//  });


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