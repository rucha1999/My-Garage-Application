const garages = require('./data/garages');
const connection = require('./config/mongoConnection');

const main = async () => {
  let Meineke;
  let allgarages;
  let Firestone;
  let Broadway;
  //let updatedgarage;
  //let removegarage;
  try {
    Meineke = await garages.create("Meineke Car Care Center", "Jersey City, New Jersey", "201-299-6390", "https://www.meineke.com/locations/nj/north-arlington-456/", 4, {pickuppart: true, maintainance: true, delivercar: false});
    //console.log(Meineke);
  } catch(e) {
    console.log(e);
  }
  
  try {
    Firestone = await garages.create("Firestone Complete Auto Care", "Jersey City, New Jersey", "201-918-3214", "https://local.firestonecompleteautocare.com/new-jersey/jersey-city/70-nj-139/?utm_source=google&utm_medium=organic&utm_campaign=localmaps&lw_cmp=oloc_google_localmaps_maps", 3, {pickuppart: true, maintainance: true, delivercar: true});
  } catch(e) {
    console.log(e);
  }

  console.log("Getting all the garages")
  //getting all the garages
  try {
    allgarages = await garages.getAll();
    console.log(allgarages);
  } catch(e) {
    console.log(e);
  }

  try {
    Broadway = await garages.create('Broadway Sunoco Service', "Jersey City, New Jersey", "201-641-7243", "https://www.broadwaysunocoservice.com/", 4, {pickuppart: true, maintainance: true, delivercar: true});
    console.log(Broadway);
  } catch(e) {
    console.log(e);
  }

  //console.log("Let's rename the website of first garage");

  // try {
  //   updatedgarage = await garage.rename(allgarages[0]._id,"https://www.meineke.com/locations/nj/north-arlington-456/");
  //   console.log(updatedgarage);
  // } catch(e) {
  //   console.log(e);
  // }

  // console.log("Now, lets remove the second garage which is being created")

  // try {
  //   removegarage = await garages.remove(allgarages[1]._id);
  //   console.log(removegarage);
  // } catch(e) {
  //   console.log(e);
  // }

  // try {
  //   allgarages = await garages.getAll();
  //   console.log(allgarages);
  // } catch(e) {
  //   console.log(e);
  // }

  const db = await connection.connectToDb();
  await connection.closeConnection();
  console.log('Done!');
};

main().catch((error) => {
  console.log(error);
});