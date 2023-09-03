const express = require('express');
const app = express();
bodyParser = require("body-parser"),
app.use(bodyParser.urlencoded({ extended: true }));
const axios = require('axios');
app.use(express.json());


//this contain the data required for Authentication
const APIdata = {
    companyName: "Train Central SMT",
    clientID: "73c72501-04b1-4ed5-9ca7-26ab98456277",
    clientSecret: "edrbCacQftixfOdp",
    ownerName: "vasanth",
    ownerEmail: "vasanthmarshal2020@gmail.com",
    rollNo: "124003354"
  };


//used to store the access token after authorisation;
var AccessToken="";

async function fetchAuth(APIdata) {
    try {
      const response = await axios.post(
        "http://20.244.56.144/train/auth",
        APIdata
      );

      const token = response.data.access_token;
      return token;
    } catch (error) {
        res.status(500).json("sorry for inconvenience something went wrong" );
    }
  }
  
//authorising nd fetching all data about train
  async function fetchTrains() {
    AccessToken= await fetchAuth(APIdata);
    try {
      const headers = {
        Authorization: `Bearer ${AccessToken}`,
      };
      const res = await axios.get("http://20.244.56.144/train/trains", {
        headers,
      });
      const trainsData = res.data;
      return trainsData;
    } catch (error) {
        res.status(500).json("sorry for inconvenience something went wrong" );
    }
  }


  //sorting the data based on given functionality
  function sorting(trains_data) {

    function mysort(a, b) {

      const priceCompare = a.price.AC - b.price.AC;
      if (priceCompare !== 0) {
        return priceCompare;
      }
    
      const seatsAvailableComp = b.seatsAvailable.AC - a.seatsAvailable.AC;

      if (seatsAvailableComp !== 0) {
        return seatsAvailableComp;
      }
  
      
      const departureTimeA = a.departureTime.Hours * 60 + a.departureTime.Minutes;
      const departureTimeB = b.departureTime.Hours * 60 + b.departureTime.Minutes;
      return departureTimeB - departureTimeA;
    }
  
    
    for (let i = 0; i < trains_data.length - 1; i++) {
      for (let j = 0; j < trains_data.length - i - 1; j++) {
        if (mysort(trains_data[j], trains_data[j + 1]) > 0) {
          const temp = trains_data[j];
          trains_data[j] = trains_data[j + 1];
          trains_data[j + 1] = temp;
        }
      }
    }
  
    const sortedTrains = [];
    for (const train of trains_data) {
      if (train.departureTime.Minutes > 30) {
        sortedTrains.push(train);
      }
    }
    return sortedTrains;
  }


//route to get details about all trian
  app.get("/train", async (req, res) => {
    try {
     //calling the function for fetching the train data 
      const trainsData = await fetchTrains();
       
    //sorting the train dat based on given condition

      const sortedTrains = sorting(trainsData);
      res.json(sortedTrains);
    } catch (error) {
      res.status(500).json("sorry for inconvenience something went wrong");
    }
  });



  app.get("/train/:trainId", async (req, res) => {
    try {
      const train_num = req.params.trainId;
      AccessToken = await fetchAuth(APIdata);
  
      const headers = {
        Authorization: `Bearer ${AccessToken}`,
      };
  
      const train_data = await axios.get(
        `http://20.244.56.144/train/trains/${train_num}`,
        { headers }
      );
      res.json(train_data.data);
    } catch (error) {
        res.status(500).json("sorry for inconvenience something went wrong");
    }
  });
 




app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
