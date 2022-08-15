const token = require('../../config.json').brawlToken;
const baseUrl = 'https://api.brawlstars.com/v1/';
const clubId = ("%23" + require('../../config.json').clubId)
const fetch = require('node-fetch');


const options = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
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
    const response = await afetch(`clubs/${clubId}/members`);
    return response.items;
  }
}