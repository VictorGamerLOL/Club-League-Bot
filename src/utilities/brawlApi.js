const dotenv = require('dotenv');
dotenv.config();
const TOKEN = process.env.BRAWLTOKEN
const baseUrl = 'https://api.brawlstars.com/v1/';
const CLUBID = ("%23" + process.env.CLUBID)
const fetch = require('node-fetch');


const options = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  }
};

const afetch = (request) => {  //Asyncronous fetch because I need async await.
  const url = baseUrl + request;
  return new Promise(function (resolve, reject) {
    fetch(url,options)
      .then(response => resolve(response.json()))
      .catch(error => reject(error));
  })
}

module.exports = {
  getClubMembers: async () => {
    const response = await afetch(`clubs/${CLUBID}/members`);
    return response.items;
  }
}