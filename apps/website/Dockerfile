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

# Runtime: nginx-unprivileged runs as non-root (UID 101) and listens on 8080 by
# default, matching EXPOSE 8080. This resolves Trivy DS-0002 ("Image user should
# not be 'root'") without a fragile root-nginx reconfiguration.
FROM nginxinc/nginx-unprivileged:alpine@sha256:901e944d1f4fc2bd077e8f5568b98c1f6f8cdacf6b97a87747c43134a339b9a7 AS runner
USER root
COPY --from=build /app/dist /usr/share/nginx/html
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
