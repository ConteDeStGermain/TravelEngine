import axios from 'axios';
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
  // google places sdk result
  // let restaurants = await getRestaurants(coordinates.lat, coordinates.lng, 10000, 4, "breakfast");
  // let randomKey: number = Math.floor(Math.random() * Object.keys(restaurants).length);
  // let food1 = restaurants[randomKey];
  
  // let culturalEvent = await getAttractions(food1.lat, food1.lng, 20000);
  // randomKey =  Math.floor(Math.random() * Object.keys(culturalEvent).length);
  // let event1 = culturalEvent[randomKey];
  // if (event1 == undefined) {
  //   console.log(event1)
  //   console.log('-------EVENT 1--------')
  //   console.log(culturalEvent)
  //   console.log(randomKey)
  //   console.log(Object.keys(culturalEvent).length)
  //   console.log(food1)
  // }

  // restaurants = await getRestaurants(event1.lat, event1.lng, 5000, 4, "lunch");
  // randomKey = Math.floor(Math.random() * Object.keys(restaurants).length );
  // let food2 = restaurants[randomKey];

  // culturalEvent = await getAttractions(food2.lat, food2.lng, 20000);
  // randomKey = Math.floor(Math.random() * Object.keys(culturalEvent).length );
  // let event2 = culturalEvent[randomKey];

  // if (event2 == undefined) {
  //   console.log(event2)
  //   console.log('-------EVENT 2--------')
  //   console.log(culturalEvent)
  //   console.log(culturalEvent[0])
  //   console.log(randomKey)
  //   console.log(Object.keys(culturalEvent).length)
  //   console.log(food2)

  //   // event2 = culturalEvent;
  // }

  
  // culturalEvent = await getAttractions(event2.lat, event2.lng, 20000);
  // randomKey = Math.floor(Math.random() * Object.keys(culturalEvent).length );
  // let event3 = culturalEvent[randomKey]
  // console.log(culturalEvent)

  // if (event3 == undefined) {
  //   console.log(event3)
  //   console.log('-------EVENT 3--------')
  //   console.log(culturalEvent)
  //   console.log(randomKey)
  //   console.log(Object.keys(culturalEvent).length)
  //   console.log(event2)
  // }

  // restaurants = await getRestaurants(event3.lat, event3.lng, 5000, 4, "dinner|supper");
  // randomKey = Math.floor(Math.random() * Object.keys(restaurants).length );
  // let food3 = restaurants[randomKey];

  // let evenningActivity = await getEveningActivity(food3.lat, food3.lng, 4, 5000);
  // randomKey = Math.floor(Math.random() * Object.keys(evenningActivity).length);
  // let evenningActivity1 = evenningActivity[randomKey];
  
  // if (food1.id == food2.id || food1.id == food3.id) {
  //   console.log("food1 duplicated")
  // }

  // if (event1.id == event2.id || event1.id == event3.id) {
  //   console.log("event 1 is duplicated")
  // }
  
  // if (event2.id == event3.id){
  //   console.log("event 2 is duplicated")
  // }
  
  let type = "tourist_attraction|point_of_interest|establishment|art_gallery|park|library|historical_monument|historical_place|landmark|city_hall";
  // "restaurant"
  // "night_club|lounge|bar|tea_room|bar, pool_hall|pub"
  let keyword = "";

  let test = await getPlaces(coordinates.lat, coordinates.lng, 49000, 4, type, keyword);
  // res.json({food1, event1, food2,  event2, event3, food3, evenningActivity1});
  test = test.sort((a, b) => b.numberOfRatings - a.numberOfRatings);
  res.json({test});
 });


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

async function getPlaces(lat: number, lng: number, range: number, min_rating: number, type: string, keyword: string) {
  let results: any[] = [];
  let nextPageToken: string | null = null;
  let url: string = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${process.env.GAPI_KEY}&location=${lat},${lng}&radius=${range}&types=${type}&keyword=${keyword}`;

  while(results.length < 60) {
    await delay(1500);

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
      id: result.place_id
    }));

    results = results.concat(filteredResult);
  }

  results = results.sort((a, b) => b.numberOfRatings - a.numberOfRatings);
  
  return results;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


 // Create a repo with basic type typescript, express, nodemon (with a yarn/npm  package.json)
 // make it well stuctures, with src, tests, and other well though out file stucture 
 // Create first places endpoint
 // Copy Kyles server setup
