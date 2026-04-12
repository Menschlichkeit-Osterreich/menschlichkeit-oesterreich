FROM node:20-alpine@sha256:42d1d5b07c84257b55d409f4e6e3be3b55d42867afce975a5648a3f231bf7e81 AS build
WORKDIR /app

# Build-time env for Vite
ARG VITE_API_BASE_URL
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_PAYPAL_CLIENT_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY} \
    VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}

COPY package.json package-lock.json* .npmrc* ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:alpine@sha256:7e89aa6cabfc80f566b1b77b981f4bb98413bd2d513ca9a30f63fe58b4af6903 AS runner
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

