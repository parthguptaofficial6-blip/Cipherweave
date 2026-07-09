# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package.json ./
RUN npm install

# Copy configuration and React code files
COPY . .

# Compile and bundle Vite production assets
RUN npm run build

# Serve Stage
FROM nginx:alpine

# Copy compiled SPA static files from build stage to Nginx public root
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
