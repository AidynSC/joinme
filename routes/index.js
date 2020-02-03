const express = require("express");
const fs = require('fs');
const allCities = fs.readFileSync('./db/cities.txt');
const cities = JSON.parse(allCities);
const bcrypt = require('bcrypt');
const saltRounds = 10;
const router = express.Router();
const moment = require('moment');
const { User } = require('../models/users');
const { Travel } = require('../models/travel');

const token = "5690764e041e60b23132eab4ec802871";

router.get('/', async(req, res, next)=>{
   res.render('index')
});

router.get('/login', async(req, res, next)=>{
   res.render('login')
});

router.get('/signup', async(req, res, next)=>{
   res.render('signup')
});

router.get('/busymail', async(req, res, next)=>{
   res.render('./errors/busymail')
});

router.get('/busyusername', async(req, res, next)=>{
   res.render('./errors/busyusername')
});
const path = require('path');
router.get('/wrongemail', async(req, res, next)=>{
   res.render('./errors/wrongemail')
});

router.get('/wrongpassword', async(req, res, next)=>{
   res.render('./errors/wrongpassword')
});

router.post('/signup', async function (req, res, next) {
   try {
      let users = await User.find();
      let user;
      let used = [];
      let  {username, email, password} = req.body;
      users.forEach((element)=> {
         if (element.email === email) {
            res.redirect('busymail');
            used.push(element);
         } else if(element.username===username){
            res.redirect('busyusername');
            used.push(element)
         }
      });

      if(used.length===0){
         user = await new User({
            username,
            email,
            password: await bcrypt.hash(password, saltRounds)
         });
         await user.save();
         req.session.user = user;
         res.redirect('/')
      }

   } catch (error) {
      next(error);
   }
});

router.post('/login', async function (req, res, next) {
   const email = req.body.email;
   const password = req.body.password;
   const user = await User.findOne({email});
   if(!user){
      res.redirect("/wrongemail");
   } else if(!(await bcrypt.compare(password, user.password))){
      res.redirect('/wrongpassword')
   } else if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = user;
      res.redirect('/')
   }

});

router.post("/logout", async (req, res, next) => {
   if (req.session.user) {
      try {
         await req.session.destroy();
         res.clearCookie("user_sid");
         res.redirect("/");
      } catch (error) {
         next(error);
      }
   } else {
      res.redirect("/login");
   }
});

router.get('/ticket', async (req, res, next)=>{
let date = Date.now();
let currentDate = moment(date).format('YYYY MM DD');

   res.render('ticket', { currentDate })
});

router.post('/traveladd', async (req, res, next)=>{
   const { origin, destination, departdate, changes, cost } = req.body;
const date = Date.parse(departdate);
   // moment(date).format("YYYY-MM-DD");
   // console.log(moment(date).format("YYYY-MM-DD"));
   let travel = await new Travel({
      requested: req.session.user.username,
      origin,
      destination,
      date,
      changes: +changes,
      cost: +cost
   });
   await travel.save();
   let usertravels = await User.findOne({username: req.session.user.username}, {_id: 0, travels: 1});
   let newTravel = await Travel.findOne({origin, destination, date, changes: +changes, cost: +cost});
   await usertravels.travels.push(newTravel);
   await User.updateOne({username: req.session.user.username}, {travels: usertravels.travels});
   const username = req.session.user.username;
   res.json({ username })
});

router.post('/ticket/check', async (req, res, next)=>{

   const currency = req.body.currency;
   let originRaw = req.body.origin;
   let original = [];
   let origin1 = originRaw.split('');
   origin1.forEach((element)=>{
      if(origin1[0]===element){
         original.push(element.toUpperCase());
      } else original.push(element.toLowerCase());
   });
   const finalOrigin = original.join('');

   let destinationRaw = req.body.destination;
   let destinationArray = [];
   let destination1 = destinationRaw.split('');
   destination1.forEach((element)=>{
      if(destination1[0]===element){
         destinationArray.push(element.toUpperCase());

      } else if(destination1[destination1.indexOf('-')+1]===element){
         destinationArray.push(element.toUpperCase());
      } else destinationArray.push(element.toLowerCase());
   });
   const finalDestination = destinationArray.join('');


   let beginning_of_period = req.body.beginning_of_period;
   moment(beginning_of_period).format("YYYY-MM-DD");
   const one_way = req.body.one_way;
   const limit = req.body.limit;
   const sorting = req.body.sorting;
   const trip_duration = req.body.trip_duration;


   let originCity = cities.filter((element)=>{
      return element.name === finalOrigin
   });

   let destinationCity = cities.filter((element)=>{
      return element.name === finalDestination
   });


   if(originRaw.length===0 || !destinationRaw.length===0 || beginning_of_period.length===0){
      // console.log(123)
      res.render('./errors/fullgaps', {
         layout: false
      })
   }
   else if(originCity.length===0 || destinationCity.length===0){
      // console.log(456)

      res.render('./errors/wrongcity', {
         layout: false
      })
   } else {
      // console.log(789)

      let originCityCode = originCity[0].code;
      let destinationCityCode = destinationCity[0].code;

      res.json({
         url: `http://api.travelpayouts.com/v2/prices/latest?currency=${currency}&origin=${originCityCode}&destination=${destinationCityCode}&beginning_of_period=${beginning_of_period}&period_type=month&one_way=${one_way}&page=1&limit=${limit}&show_to_affiliates=true&sorting=${sorting}&token=${token}&`
      })
   }

});

router.post('/ticket/results', async (req, res, next)=> {

   if (req.body.tickets.success) {
      const tickets = req.body.tickets.data;
      // console.log(tickets)
      res.render('results', {
         layout: false,
         tickets: tickets
      })
   } else
      res.render('badresults', {
         layout: false
      });
});



router.get('/:origin/:destination/:departdate/:numberofchanges/:value', async (req, res, next)=> {
   const origin = req.params.origin;
   const destination = req.params.destination;
   const departdate = req.params.departdate;
   const numberofchanges = req.params.numberofchanges;
   const value = req.params.value;


res.render('travel', {
   origin,
   destination,
   departdate,
   numberofchanges,
   value
})

});

router.get('/:name', async(req, res, next)=>{

   const user1 = await User.find({username: req.params.name});
   const user2 = user1[0];

   res.render('user', { user2 })
});

module.exports = router;
