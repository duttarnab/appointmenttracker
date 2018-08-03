# application setup ubuntu 
FROM node:8.9.4

WORKDIR /sails

EXPOSE 1337
CMD ["npm", "start"]
