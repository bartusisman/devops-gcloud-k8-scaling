# ---- base image ----
FROM node:18

# ---- create app directory ----
WORKDIR /app

# ---- install dependencies ----
COPY package*.json ./
RUN npm ci --omit=dev

# ---- copy source ----
COPY . .

# ---- runtime env & start ----
ENV PORT=3000
CMD ["npm","run","start"]
