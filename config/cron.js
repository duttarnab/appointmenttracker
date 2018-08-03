/* cron.js : The job is triggered after every 5 minutes to refresh the appointments and changelogs in database.*/
module.exports.cron = {
 
    fetchAndAppointments: {
      schedule: '0 */5 * * * *',
      onTick: async function () {
        try{
          console.log('-----JOB STARTED------');
          //get all distribution group and appointments using microsoft graph api
            let dgAppointments = await DGAppointmentsService.getAllDGWithEvents();
            //delete all existing appointments in database.
            await  DGAppointmentsDBService.deleteAllAppointmentsFromDB();
            
            //save all appointments into database
            let savedAppointments = await DGAppointmentsDBService.saveAppointmentsToDB(dgAppointments);
            //save all change logs into database
            await DGAppointmentsDBService.updateAppointmentStatusInDB(dgAppointments);
            console.log('-----JOB COMPLETED------');
     
          }catch(e){
              console.log('--------error cron--------------'+e.message);
              
          }
      }
}
  };
