FROM node:14
WORKDIR /home/usr/src/app

COPY . .
RUN npm install -g typescript
RUN npm install
RUN cd client 
RUN npm install

# COPY startup.sh .
RUN chmod +x /home/usr/src/app/startup.sh
CMD ["/home/usr/src/app/startup.sh"]

EXPOSE 3000
EXPOSE 3001
EXPOSE 1769

