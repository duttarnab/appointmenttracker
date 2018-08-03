/**
 * DeltaAppointments.js : Model to store changelogs
 * 
 */


module.exports = {

    attributes: {
  
      id: {
        type: 'integer', autoIncrement: true 
      },
  
      appointmentId: {
        type: 'string'
      },

      distributionGroupId: {
        type: 'string'
      },

      start: {
        type: 'string'
      },
  
      end: {
        type: 'string'
      },
  
      eventTitle: {
        type: 'string'
      },
  
      distributionGroupName: {
        type: 'string'
      },
      
      userName: {
        type: 'string'
      },

      status: {
        type: 'string'
      },
      
      crtEventDate: {
        type: 'string'
      },

      updEventDate: {
        type: 'string'
      },

      isAllDay: {
        type: 'string'
      },
      type: {
        type: 'string'
      },
      bodyPreview: {
        type: 'string'
      },
      location: {
        type: 'string'
      },
      eventChanges: {
        type: 'json', columnType: 'array'
      },
      userId: {
        type: 'string'
      },
  }
  
  };
  