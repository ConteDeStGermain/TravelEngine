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

  async function getInRange(pool: any, aroundEvent: any) {
    let coords = await getCoordinates(aroundEvent.address);
    let eventsInRange: any[] = [];
  
    for (let key in pool) {
      let eventCoords = await getCoordinates(pool[key].address);
      if (withinRange(eventCoords, coords, 7)) {
        eventsInRange.push(pool[key])
      }
    }
  
    let returnEvent = eventsInRange[getRandomNum(eventsInRange.length)]
    return returnEvent;
  }
  