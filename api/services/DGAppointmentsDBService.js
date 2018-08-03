/**
 * DGAppointmentsDBService.js: This service is responsible to handling all database transaction processes in application and is 
 * mainly used by refresh process.
 */

let moment = require('moment');
module.exports = {
//this method checks if any user credentials is stored in database.
    checkCredentials: async function () {
        try{
             let users = await User.find();
             console.log(users);
             if(users.length > 0){
                 return true;
             }else{
                 return false;
             }
            
        }catch(e){
            console.log('--------error--------------'+e.message);
        }
    },
//this method fetches user credentials from database for running the refresh process.
    getCredentials: async function () {
        try{
             let users = await User.find({username: { '!=': '#'}});
             if(users.length > 0){
                 return users[0];
             }else{
                 return null;
             }
            
        }catch(e){
            console.log('--------error--------------'+e.message);
        }
    },
//this method saves user credentials into database
    saveCredentials: async function (username, password) {
        try{
            await User.destroy({}); 
            await User.create({username: username, password: password});
            
        }catch(e){
            console.log('--------error--------------'+e.message);
        }
    },
//this method saves all appointments into database.
    saveAppointmentsToDB: async function(dgAppointments){

        try{

            let savedAppointments = await DGAppointments.createEach(dgAppointments).fetch();
     
        }catch(e){
            console.log('--------error--------------'+e.message);
            
        }
        
    },
//this method deletes all old appointments in database.
    deleteAllAppointmentsFromDB: async function(){

        try{

            await DGAppointments.destroy({});  
     
        }catch(e){
            console.log('--------error--------------'+e.message);
            
        }
        
    },
//get all appointments of a particular distribution group
    getAppointmentsFromDBByDistGroup: async function(dgCode){

        try{
            
            let appointments = await DGAppointments.find({distributionGroupId: dgCode}).sort('userName ASC');
            
            return appointments;
     
        }catch(e){
            console.log('--------error--------------'+e.message);
            
        }
    },
//this method updates the status of all appointments in database to whether inserted or updated status. It also adds the new changelogs into the list.
    updateAppointmentStatusInDB: async function(dgAppointments){
        try{
                let deltaAppointments = []; 
                await DeltaAppointments.update({status: { '!=': 'D'}}).set({status:'D'});

                //getting appointments from db
                let appointmentsFrmDB = await DeltaAppointments.find();
                //delete all appointments
                await DeltaAppointments.destroy({}); 
                await asyncForEach(dgAppointments, async (appointment, index) =>  {
                
                    let item = {};
                    //console.log(appointment.appointmentId);
                // await DeltaAppointments.destroy({appointmentId : appointment.appointmentId}); 

                var selectedAppointmentsFrmDB = appointmentsFrmDB.filter(function (ele) {
                    return ele.appointmentId == appointment.appointmentId &&
                        ele.distributionGroupName == appointment.distributionGroupName;
                });
                    
                    item.appointmentId = await appointment.appointmentId;
                    item.start = await appointment.start;
                    item.end = await appointment.end;
                    item.eventTitle = await appointment.eventTitle;
                    item.distributionGroupName = await appointment.distributionGroupName;
                    item.userName = await appointment.userName;
                    item.distributionGroupId = await appointment.distributionGroupId;
                    item.userId = await appointment.userId;
                    item.crtEventDate = await appointment.crtEventDate;
                    item.updEventDate = await appointment.updEventDate;
                    item.isAllDay = await appointment.isAllDay;
                    item.type = await appointment.type;
                    item.bodyPreview = await appointment.bodyPreview;
                    item.location = await appointment.location;
                    item.eventChanges = [];

                    if(item.crtEventDate == item.updEventDate || selectedAppointmentsFrmDB.length == 0){
                        
                        item.status = 'I';
                        item.eventChanges.push(`New meeting : ${appointment.eventTitle}`);
                    }else{
                        
                        
                        item.eventChanges = await addUpdatedChangelogsInAppointment(selectedAppointmentsFrmDB, appointment);  
                        if(item.eventChanges.length > 0){
                            item.status = 'U';
                        }else{
                            item.status = 'I';
                        }
                        
                    }

                    await deltaAppointments.push(item);
                });
                
                let savedAppointments = await DeltaAppointments.createEach(deltaAppointments).fetch();
        }catch(e){
            console.log('--------error updateAppointmentStatusInDB--------------'+e.message);
            
        }
        
    },
    //this method fetches all changelogs of a distribution group between a given date range
    getChangelogs: async function (dgId, startDate, endDate) {
        try{

            let changelogs=[];
            if(startDate == endDate){
                changelogs = await DeltaAppointments.find({distributionGroupId: dgId, start : { contains: startDate }}).sort('status ASC').sort('userName ASC');
            }else{
                changelogs = await DeltaAppointments.find({distributionGroupId: dgId
                    , start : { '>=': new Date(startDate), '<=': new Date(endDate) }
                    
                }).sort('userName ASC').sort('start ASC');
    
            }
           

            return changelogs;

        }catch(e){
            console.log('--------error--------------'+e.message);
            
        }
    }
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

async function addUpdatedChangelogsInAppointment(selectedAppointmentsFrmDB, appointment){
    let changeCount = 0;
    let changeLogs = [];

    changeLogs = selectedAppointmentsFrmDB[0].eventChanges;

    if(selectedAppointmentsFrmDB.length > 0){

        if(selectedAppointmentsFrmDB[0].eventTitle.trim() != '' && appointment.eventTitle != selectedAppointmentsFrmDB[0].eventTitle){
            changeLogs.push(`${appointment.eventTitle} title changed from ${selectedAppointmentsFrmDB[0].eventTitle} to ${appointment.eventTitle}`);
            changeCount++;
        }
        if(appointment.isAllDay != selectedAppointmentsFrmDB[0].isAllDay && appointment.isAllDay == 'true'){
            changeLogs.push(`${appointment.eventTitle} changed to all day event`);
            changeCount++;
        }
        if(appointment.isAllDay != selectedAppointmentsFrmDB[0].isAllDay && appointment.isAllDay == 'false'){
            changeLogs.push(`${appointment.eventTitle} changed to single day event`);
            changeCount++;
        }
        if(selectedAppointmentsFrmDB[0].start.trim() != ''  && appointment.start != selectedAppointmentsFrmDB[0].start){
            changeLogs.push(`${appointment.eventTitle} start date-time changed from ${selectedAppointmentsFrmDB[0].start} to ${appointment.start}`);
            changeCount++;
        }
        if(selectedAppointmentsFrmDB[0].end.trim() != ''  &&  appointment.end != selectedAppointmentsFrmDB[0].end){
            changeLogs.push(`${appointment.eventTitle} end date-time changed from ${selectedAppointmentsFrmDB[0].end} to ${appointment.end}`);
            changeCount++;
        }
        if(appointment.location != selectedAppointmentsFrmDB[0].location){
            
            changeLogs.push(`${appointment.eventTitle} moved ${!selectedAppointmentsFrmDB[0].location ? '' : 'from '+selectedAppointmentsFrmDB[0].location} to ${appointment.location}`);
            changeCount++;
        }
        if(appointment.bodyPreview != selectedAppointmentsFrmDB[0].bodyPreview){
            changeLogs.push(`${appointment.eventTitle} description changed`);
            changeCount++;
        }
        
        if( selectedAppointmentsFrmDB[0].type.trim() != '' && appointment.type != selectedAppointmentsFrmDB[0].type){
            changeLogs.push(`${appointment.eventTitle} changed from ${selectedAppointmentsFrmDB[0].type == 'seriesMaster' ? 'series event' : 'single day event'} to ${appointment.type == 'seriesMaster' ? 'series event' : 'single dayevent'}`);
            changeCount++;
        }
        /*
        if(changeCount == 0){
            if(!!selectedAppointmentsFrmDB[0].eventChanges 
                && selectedAppointmentsFrmDB[0].eventChanges.length > 0
                && selectedAppointmentsFrmDB[0].eventChanges[0].trim() != ''){
                    changeLogs = selectedAppointmentsFrmDB[0].eventChanges;
            }else {
                changeLogs.push(`${appointment.eventTitle} was modified`);
            }
            
        }*/
    }
    
    return changeLogs;
}