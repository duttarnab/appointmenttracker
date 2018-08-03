# appointment-tracker

Technology Stack
----------------
1.	Front-End : React.js, Bootstrap
2.	Back-end: Sails.js (Node.js)
3.	Database : Mongodb
4.	Libraries Used: Microsoft Graph api has been used to fetch Appointment details from O365 Outlook. To know more about api please visit: 
https://developer.microsoft.com/en-us/graph


Project pre/post requisite
--------------------------

1.	Login to Microsoft Application registration page using organization admin credentials on below link and share the Application id and client secret 
    with your developer so that it can be configured in application.
https://apps.dev.microsoft.com/?referrer=https:%2f%2fdeveloper.microsoft.com%2fen-us%2fgraph#/appList

2. Please ensure the application has DNS and SSL certiifcate is installed. 



Project installtion on linux server
------------------------------------
1. Install Docker on server (if not already installed) using the steps provided in below link.
      
      https://docs.docker.com/install/linux/docker-ce/ubuntu/

2. Install docker composer (if not already installed) using below command.
      
      apt install docker-compose

3. Go to location on server where you want to install project. eg. cd /user/src

4. Clone git project from repository using below command (url will change).

      git clone https://duttarnab@bitbucket.org/pgaus/tracker-backend.git


5. Go to <PROJECT-HOME>/config folder and open datastores.js file. Add server ip address in 'host' attribute.
   example: host : '123.123.123'.

6. Go to <PROJECT-HOME>/config folder and open security.js file.
      a. Add client secret  address in 'client_secret' attribute.
      b. Add application id in 'client_id' attribute.
            example: client_secret : 'biaCGEZK852$-vjzbAA56|?',
            client_id : 'c4a14f00-01f3-45c6-a5b6-a9dcc794d50e' 

7. Go to project home folder. eg. cd /user/src/tracker-backend

8. Exceute below command to install project, mongodb along with all dependencies.


      docker-compose build

      docker-compose run sails npm install

9. Start the project using below command.

      docker-compose up

10. Go to browser open the application.

Project schema (3 documents)
-----------------------------

1. DGAppointments (to store all distribution group's events )

      id: {type: 'integer', autoIncrement: true },
  
      appointmentId: {type: 'string'},
      
      eventTitle: { type: 'string'  },

      distributionGroupId: {type: 'string'},
      
      distributionGroupName: {  type: 'string'   },

      start: {type: 'string' }, //event start date
  
      end: { type: 'string' }, //event end date
  
      userName: { type: 'string'  },

      crtEventDate: {   type: 'string'  }, // created date of event

      updEventDate: {  type: 'string'  }, // last update date of event

      isAllDay: {   type: 'boolean'   }, // is all day event
      
      type: {   type: 'string'   }, //whether series event or sigle event
      
      bodyPreview: {  type: 'string'   },
      
      location: {    type: 'string'    },

      userId: {    type: 'string'    }
      
2. DeltaAppointments (to store all event's change logs )

      id: {type: 'integer', autoIncrement: true },
  
      appointmentId: {type: 'string'},
      
      eventTitle: { type: 'string'  },

      distributionGroupId: {type: 'string'},
      
      distributionGroupName: {  type: 'string'   },

      start: {type: 'string' }, //event start date
  
      end: { type: 'string' }, //event end date
  
      userName: { type: 'string'  },

      crtEventDate: {   type: 'string'  }, // created date of event

      updEventDate: {  type: 'string'  }, // last update date of event

      isAllDay: {   type: 'boolean'   }, // is all day event
      
      type: {   type: 'string'   }, //whether series event or sigle event
      
      bodyPreview: {  type: 'string'   },
      
      location: {    type: 'string'    },

      userId: {    type: 'string'    }
      
      eventChanges: {  type: 'json', columnType: 'array'  }, // to store change logs
      
3. User (to store username and encrypted password used to authenticate refresh process)
      
       username: {  type: 'string' },

      password: { type: 'string'   },