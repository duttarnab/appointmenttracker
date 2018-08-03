/** 
 * DGAppointmentsController.js : All requests from the front-end first reaches this controller file. From here based on
 * the requested url navigates to appropriate controller method.
 * 
 * **/

var CryptoJS = require("crypto-js");


module.exports = {
//This method fetches all appointments from database based on selected distribution group on user interface.
    getAppointmentsFromDBByDistGroup: async function (req, res) {
        try{

            let dgId =req.param('dgId');

            console.log('Distribution Group Id:: '+dgId);

            let dgAppointments = await DGAppointmentsDBService.getAppointmentsFromDBByDistGroup(dgId);
            console.log(dgAppointments);
            return res.ok (dgAppointments);
        }catch(e){
            return res.badRequest({message: e.message});
        }
    },
//This method fetches all changelogs from database based  on selected distribution group, appointment start date, appointment end date
//selected on the user interface.
    getChangelogs: async function (req, res) {
        try{

            let dgId =req.param('dgId');
            let startDate =req.param('startDate');
            let endDate =req.param('endDate');

        

            let changelogs = await DGAppointmentsDBService.getChangelogs(dgId, startDate, endDate);
            //console.log(changelogs);
            return res.ok (changelogs);
        }catch(e){
            return res.badRequest({message: e.message});
        }
    },
//This method save the username and password of the administrator into application. The saved username/password is used for
//running the refresh process in application.
    saveCredentials: async function (req, res) {
        try{
            let username =req.param('username');
            let password =req.param('password');
          
            var cipherpassword = CryptoJS.AES.encrypt(password, sails.config.session.secret);         
            
            console.log(username);

            DGAppointmentsDBService.saveCredentials(username, cipherpassword.toString());            
        }catch(e){
            return res.badRequest({message: e.message});
        }
    },
//After login the application checks if any admin credential is stored in application using this method.
    checkCredentials: async function (req, res) {
        try{

            let isUserPresent =  await DGAppointmentsDBService.checkCredentials();  
            //console.log(isUserPresent);    
            return res.ok ({isUserPresent:isUserPresent});
        }catch(e){
            return res.badRequest({message: e.message});
        }
    }

};