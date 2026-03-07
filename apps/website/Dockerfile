FROM node:20-alpine AS build
WORKDIR /app

# Build-time env for Vite
ARG VITE_API_BASE_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_PAYPAL_CLIENT_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY} \
    VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}

COPY package.json package-lock.json* .npmrc* ./
RUN npm ci || npm install
COPY . ./
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

