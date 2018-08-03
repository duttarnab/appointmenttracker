/*
 * DGAppointmentsService.js : The service is used by application refresh process running after every 5 minutes to pull
 * all distribution groups and their events using microsoft graph api.
 * 
 */

let axios = require('axios');
let qs = require('qs');
let momenttz = require('moment-timezone');
let moment = require('moment');
let CryptoJS = require("crypto-js");
module.exports = {
//method to pull all distribution groups and their events using microsoft graph api.
    getAllDGWithEvents : async function (req, res) {
        try{
          //gettig token
          
          let user = await DGAppointmentsDBService.getCredentials();
    
          var bytes  = await CryptoJS.AES.decrypt(user.password, sails.config.session.secret);
          var pass = await bytes.toString(CryptoJS.enc.Utf8);
         
         const data = qs.stringify({ username :user.username,
          password : pass,
          client_secret : sails.config.security.client_secret,
          client_id : sails.config.security.client_id,
          resource : 'https://graph.microsoft.com',
          grant_type : 'password'});
         
         const headers = {
             'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
         };
         let tokenResponse = undefined;
         try{
          tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/token',
           data, headers
            );
         }catch(te){
          await User.destroy({});
          console.log(te.message);
         }
         
         
          let finalEvents = [];
          let count = 1;
          let token = tokenResponse.data.access_token;
          
          //getting all distribution groups

          let distributionGroupsResponse = await axios.get(
            'https://graph.microsoft.com/v1.0/groups?$select=id,displayName,mail&$orderby=displayName&$top=950',
            { headers: { Authorization: `Bearer ${token}` }});
          
          let distributionGroups = await distributionGroupsResponse.data.value;
          
          await asyncForEach(distributionGroups, async (distributionGroup, index) =>  {
            
                //getting appointments data
                let membersResponse = await  axios.get('https://graph.microsoft.com/v1.0/groups/'+distributionGroup.id+'/members?$select=id,displayName,mail',
                  { headers: { Authorization: `Bearer ${token}` }}
                );
                let members = await membersResponse.data.value;
                
                const filterDate = new Date(new Date().setHours(0,0,0));
                const filterStartDate = new Date(new Date(filterDate).setDate(filterDate.getDate() - 30));
                const filterEndDate = new Date(new Date(filterDate).setDate(filterDate.getDate() + 30));
                await asyncForEach(members, async (member, index) =>  {
                      
                      try{
                            
                            let eventsResponse = await  axios.get(`https://graph.microsoft.com/v1.0/users/${member.id}/events?$select=createdDateTime,lastModifiedDateTime,subject,start,end,isAllDay,type,location&$top=60&$filter=(createdDateTime ge ${filterStartDate.toISOString()}) and (createdDateTime le ${filterEndDate.toISOString()}) and showAs eq 'oof' &$orderby=start/dateTime`,
                            { headers: { Authorization: `Bearer ${token}` }});
                            
                            let events = await eventsResponse.data.value;
                            
                            await asyncForEach(events, async (event, idx) => {
                              if(event.type != 'seriesMaster') {
                              let startDate = await new Date(event.start.dateTime);
                              let startDateString = await new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(startDate);
                              
                              let endDate = await new Date(event.end.dateTime);
                              let endDateString = await  new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(endDate);
                              
                              if(event.isAllDay){
            
                                event.start.dateTime = moment(startDateString).format('YYYY-MM-DD HH:mm:ss');
                              }else{
                                
                                event.start.dateTime = momenttz.tz(startDateString, 'America/New_York').format('YYYY-MM-DD HH:mm:ss');  
                              }
                              if(event.isAllDay){
                                event.end.dateTime = moment(endDateString).format('YYYY-MM-DD HH:mm:ss');
                              }else{
                                event.end.dateTime = momenttz.tz(endDateString, 'America/New_York').format('YYYY-MM-DD HH:mm:ss');
                              }

                              //add in final list
                              let item = await {};
                              item.appointmentId = await event.id;
                              item.start = await event.start.dateTime;
                              item.end = await event.end.dateTime;
                              item.eventTitle = await event.subject;
                              item.distributionGroupName = await distributionGroup.displayName;
                              item.userName = await member.displayName;
                              item.distributionGroupId = await distributionGroup.id;
                              item.isAllDay = await event.isAllDay;
                              item.type = await event.type;
                              item.bodyPreview = await event.bodyPreview;
                              item.location = await event.location.displayName;
                              item.userId = member.id;

                              let createdDateTime = await new Date(event.createdDateTime);
                              let lastModifiedDateTime = await new Date(event.lastModifiedDateTime);

                              let createdDateTimeString = await new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(createdDateTime);
                              let lastModifiedDateTimeString = await new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(lastModifiedDateTime);

                              item.crtEventDate = await moment.tz(createdDateTimeString, 'America/New_York').format('YYYY-MM-DD HH:mm');
                              
                              item.updEventDate = await moment.tz(lastModifiedDateTimeString, 'America/New_York').format('YYYY-MM-DD HH:mm');
                              
                              
                              await finalEvents.push(item);
                            }else{
                              const yearStartDate = new Date(new Date(filterDate).setDate(filterDate.getDate()-365));
                              const yearEndDate = new Date(new Date(filterDate).setDate(filterDate.getDate() + 365));
                                let eventType = event.type;
                                let occurancesResponse = await  axios.get(`https://graph.microsoft.com/v1.0/users/${member.id}/events/${event.id}/instances?startDateTime=${yearStartDate.toISOString()}&endDateTime=${yearEndDate.toISOString()}&$select=createdDateTime,lastModifiedDateTime,subject,start,end,isAllDay,location&$top=60`,
                                { headers: { Authorization: `Bearer ${token}` }});
                                
                                let occurances = await occurancesResponse.data.value;
                    
                                await asyncForEach(occurances, async (event, idx) => {
                                  
                        
                                      let startDate = await new Date(event.start.dateTime);
                                      let startDateString = await new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(startDate);
                                      
                                      let endDate = await new Date(event.end.dateTime);
                                      let endDateString = await  new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(endDate);
                                      //for all day event make no change in timezone.
                                      if(event.isAllDay){
                                        
                                        event.start.dateTime = moment(startDateString).format('YYYY-MM-DD HH:mm:ss');
                                      }else{
                                        
                                        event.start.dateTime = momenttz.tz(startDateString, 'America/New_York').format('YYYY-MM-DD HH:mm:ss');  
                                      }
                                      if(event.isAllDay){
                                        event.end.dateTime = moment(endDateString).format('YYYY-MM-DD HH:mm:ss');
                                      }else{
                                        event.end.dateTime = momenttz.tz(endDateString, 'America/New_York').format('YYYY-MM-DD HH:mm:ss');
                                      }
                                      
                                      let item = await {};
                                      item.appointmentId = await event.id;
                                      item.start = await event.start.dateTime;
                                      item.end = await event.end.dateTime;
                                      item.eventTitle = await event.subject;
                                      item.distributionGroupName = await distributionGroup.displayName;
                                      item.userName = await member.displayName;
                                      item.location = await event.location.displayName;
                                      item.distributionGroupId = await distributionGroup.id;
                                      item.isAllDay = await event.isAllDay;
                                      item.type = await eventType;
                                      item.bodyPreview = await event.bodyPreview;
                                      item.userId = member.id;

                                      let createdDateTime = await new Date(event.createdDateTime);
                                      let lastModifiedDateTime = await new Date(event.lastModifiedDateTime);
        
                                      let createdDateTimeString = await new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(createdDateTime);
                                      let lastModifiedDateTimeString = await new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(lastModifiedDateTime);
        
                                      item.crtEventDate = await moment.tz(createdDateTimeString, 'America/New_York').format('YYYY-MM-DD HH:mm');
                                      
                                      item.updEventDate = await moment.tz(lastModifiedDateTimeString, 'America/New_York').format('YYYY-MM-DD HH:mm');
                                    
                                      await finalEvents.push(item);
                                    });
                            }
                              
                      });
                    }catch(ex){
                        console.log(ex.message);
                        
            
                    }
              });
          });
          await finalEvents.sort(this.sortFunction);
    
          return finalEvents;
           
        }catch(e){
           console.log(e.message);

        }
    }
};

async function sortFunction(a,b){  
  var dateA = await new Date(a.start).getTime();
  var dateB = await new Date(b.start).getTime();
  return await dateA > dateB ? 1 : -1;  
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }