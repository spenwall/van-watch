const kijiji = require('kijiji-scraper');
const db = require('./mydb');

const getProvince = (location) => {
  if (location === undefined) {
    return;
  }

  const locationSplit = location.split(',');

  if (locationSplit[2] === undefined) {
    return;
  }

  return locationSplit[2].replace(/ /g,'');
}

const getAds = async () => {
    const params = {
        locationId: 0,
        categoryId: kijiji.categories.CARS_AND_VEHICLES.CARS_AND_TRUCKS.id,
        minPrice: 10000,
        // maxPrice: 30000,
    };
    
    params["attr[caryear]"] = "2014,2020";
    params["attr[carmake]"] = "dodge";
    params["attr[carmodel]"] = "grndcrvn"; //caravan is grndcrvn or caravan
    // params["attr[carmileageinkms]"] = "10000,50000";
    // params["attr[forsaleby]"] = "ownr"; //delr
    
    const options = {
      minResults: 5000,
      // maxResults: 2
    };
    
    try {
      const ads = await kijiji.search(params, options);
      allAds = [];
      ads.forEach(ad => {
        const splitUrl = ad.url.split('/');
        const ad_id = splitUrl[splitUrl.length - 1];

        allAds.push({
            ad_id: ad_id,
            title: ad.title,
            price: ad.attributes.price,
            description: ad.description,
            date: ad.date,
            url: ad.url,
            image: ad.image,
            year: ad.attributes.caryear,
            make: ad.attributes.carmake,
            model: ad.attributes.carmodel,
            trim: ad.attributes.cartrim,
            color: ad.attributes.carcolor,
            drivetrain: ad.attributes.drivetrain,
            kms: ad.attributes.carmileageinkms,
            sale_by: ad.attributes.forsaleby === 'delr' ? 'dealer' : 'owner',
            province: getProvince(ad.attributes.location),
            location: ad.attributes.location,
            sunroof: ad.attributes.sunroof === 'true',
            navigation: ad.attributes.navsystem === 'true',
            heated_seats: ad.description.includes('heated'),
            bluetooth: ad.attributes.bluetooth === 'true',
            hail: ad.description.includes('hail'),
        });
      });

      console.log(allAds.length);
      seen = new Set();
      const filteredAds = allAds.filter(el => {
        const duplicate = seen.has(el.ad_id);
        seen.add(el.ad_id);
        return !duplicate;
      });
      console.log(filteredAds.length);
      return filteredAds;
    } catch (error) {
      console.log(error);
    }
}

const main = async () => {
  try {
    await db.bulk(await getAds());
    const vans = await db.allRecords();
    db.close();
  } catch (error) {
    console.log(error); 
  }
}

main();