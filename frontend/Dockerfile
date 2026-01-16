FROM node:alpine
WORKDIR /usr/src/app

# Install the application dependencies
COPY package* ./
RUN npm ci
# Copy in the source code
COPY . .

# Expose port WIP
EXPOSE 4173
RUN npm run build
CMD [ "npm", "run", "preview"]

#alla oleva buildaa imagen, toimii vain toukon käyttäjällä (ehkä)
# docker build frontend/ -t l0uko/sijoittaja-frontend

#runnin pitäisi toimia kaikilla
# docker run -t -p 4173:4173 l0uko/sijoittaja-frontend:latest 
