const mongoCollections = require('../config/mongoCollections');
const users = require("./users");
const garages = mongoCollections.garages;
const { ObjectId } = require('mongodb');
const usersCol = mongoCollections.users;

module.exports = {
  async getgarage(id) {
    if (!id) 
      throw 'You must provide an id to search for';

    if (typeof id !== 'string' || !id.trim().replace(/\s/g, "").length)
      throw 'Please provide a valid ID for the garage'

    if(!ObjectId.isValid(id))
      throw 'The ID is not a valid Object ID';

    const garageCollection = await garages();
    const garage = await garageCollection.findOne({ _id: ObjectId(id) });

    if (garage === null)
      throw 'No garage with that id';

    garage._id = garage._id.toString();
    return garage;
  },

  async getAllgarages() {
    if(arguments.length > 0)
      throw 'Arguements are given to the fuction which is not allowed'

    const garageCollection = await garages();

    const garageList = await garageCollection.find({}).toArray();

    return garageList;
  },

  async getGarageByOwner(owner_id) {
    const garageCollection = await garages();

    if (!owner_id) throw 'You must provide an id to search for';
    if (typeof(owner_id) != 'string') throw 'Id must be a string.';
    if (owner_id.trim().length == 0) throw "Id must not be empty string";
  
    if (!ObjectId.isValid(owner_id)) throw "Id is not a valid ObjectId";

    const garage = await garageCollection.findOne({ownerid: owner_id.trim()});

    return garage;
  },


  async creategarage(name, location, phoneNumber, website, inventory, serviceOptions, ownerid) {
    if (!name || !location || !phoneNumber || !website || !serviceOptions)
      throw 'You must provide all valid inputs for your garage';

    let phoneNo = /^\d{3}?(-)\d{3}(-)\d{4}$/;
    //let pattern = /^(http(s?):\/\/www\.)(.){5,}(\.com)$/i;
    let price_regex = /^\d+(,\d{3})*(\.\d{1,2})?$/;

    if (typeof name != 'string' || typeof location != 'string' || typeof phoneNumber != 'string' || typeof website != 'string' )
      throw 'please enter a valid string for your inputs';

    if(!name.trim().replace(/\s/g, "").length || !location.trim().replace(/\s/g, "").length || !phoneNumber.trim().replace(/\s/g, "").length || !website.trim().replace(/\s/g, "").length)
      throw 'Only empty spaces in the strings are not allowed'

    if(!phoneNo.test(phoneNumber))
      throw 'Phone number does not follow proper format'

    if (!Array.isArray(inventory)) 
      throw 'Inventory should be an array';
    else{
      inventory.forEach((element) => {
        if(!element.hasOwnProperty('Part') || !element.hasOwnProperty('Price') || !element.hasOwnProperty('Number'))
          throw 'Trying to insert wrong key. Please enter valid key'
        if(typeof element.Part !== 'string' || typeof element.Price !== 'string' || typeof element.Number !== 'number')
          throw 'The object keys should be boolean. Please check'
      
        const x = element.Price
        if(!price_regex.test(x))
          throw "Price is invalid"
        })

    }
      
    if (typeof(serviceOptions) !== 'object') 
      throw 'Service options should be an object';

   
    if(!serviceOptions.hasOwnProperty('pickuppart') || !serviceOptions.hasOwnProperty('maintainance') || !serviceOptions.hasOwnProperty('delivercar'))
      throw 'Trying to insert wrong key. Please enter valid key'

    if (typeof(serviceOptions.pickuppart) !== 'boolean' && !price_regex.test(serviceOptions.pickuppart)) throw 'pickuppart not valid';
    if (typeof(serviceOptions.maintainance) !== 'boolean' && !price_regex.test(serviceOptions.maintainance)) throw 'maintainance not valid';
    if (typeof(serviceOptions.delivercar) !== 'boolean' && !price_regex.test(serviceOptions.delivercar)) throw 'delivercar not valid';


    const garageCollection = await garages();
    const samegarage = await garageCollection.findOne({ name: name, location: location, phoneNumber: phoneNumber });

    if (!ownerid) 
      throw 'You must provide an id to search for';

    if (typeof ownerid !== 'string' || !ownerid.trim().replace(/\s/g, "").length)
      throw 'Please provide a valid ID for the owner'

    if(!ObjectId.isValid(ownerid))
      throw 'The ID is not a valid Object ID';

    const userCollection = await usersCol();
    const validuser = await userCollection.findOne({ _id: ownerid})

    if (validuser !== null)
      throw 'Owner id provided is not valid'

    if (samegarage !== null)
      throw 'garage you are trying to add already exists. Please change Name, Location or Phone number of the garage';

    let newgarage = {
      name: name,
      location: location,
      phoneNumber: phoneNumber,
      website: website,
      inventory: inventory,
      serviceOptions: serviceOptions,
      ownerid: ownerid,
      monthly_earnings: 0
    };

    const insertInfo = await garageCollection.insertOne(newgarage);
    if (insertInfo.insertedCount === 0) 
      throw 'Could not add new garage';

    const newId = insertInfo.insertedId;

    const garage = newId.toString();
    return garage;
  },

  async removegarage(id) {
    if (!id)
      throw 'You must provide an id to search for';

    if(typeof id !== 'string' || !id.replace(/\s/g, "").length)
      throw 'Please provide a valid ID for removal of garage';

    if(!ObjectId.isValid(id))
      throw 'The ID is not a valid Object ID';

    const garageCollection = await garages();
    const garage = await garageCollection.findOne({ _id: ObjectId(id) });

    if (garage === null)
      throw 'No garage present with that id to delete';

    const deletionInfo = await garageCollection.deleteOne({ _id: ObjectId(id) });

    if(deletionInfo.deletedCount === 0) { 
      throw `Could not delete garage with id of ${id}`;
    }
    return `${garage.name} has been successfully deleted!`;
  },

  async renamegarage(id, newWebsite) {
    if (!id) 
      throw 'You must provide an id to search for';

    if (!newWebsite) 
      throw 'You must provide a name for your website';

    if (typeof id != 'string' || !id.trim().replace(/\s/g, "").length)
      throw 'Please provide a valid ID for the garage'

    if(!ObjectId.isValid(id))
      throw 'The ID is not a valid Object ID'

    let pattern = /^(http(s?):\/\/www\.)(.){5,}(\.com)$/i;

    if (typeof newWebsite !== 'string' || !pattern.test(newWebsite.trim()))
      throw 'please enter a valid input for your new website';

    let tempUrl = newWebsite.toLowerCase();

    const garageCollection = await garages();

    const garage = await garageCollection.findOne({ _id: ObjectId(id) });

    if (garage === null)
      throw 'No garage present with that id to update';

    if(garage.website.toLowerCase() === tempUrl)
      throw 'The new URL provided is same as the old one';

    const updatedgarage = {
      website: newWebsite
    };

    const updatedInfo = await garageCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: updatedgarage }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw 'could not update garage successfully';
    }
    return await this.get(id);
  }
};