# Gunakan image Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json dan install dependencies
COPY package.json ./
RUN npm install

# Copy semua source code
COPY . .

# Expose port 4000
EXPOSE 4000

# Jalankan aplikasi
CMD ["npm", "start"]