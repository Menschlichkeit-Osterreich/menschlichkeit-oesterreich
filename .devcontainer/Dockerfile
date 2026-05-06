FROM mcr.microsoft.com/devcontainers/universal:2

# Workaround: remove stale Yarn APT source that breaks apt-get update during feature installs.
RUN rm -f /etc/apt/sources.list.d/yarn.list \
    && rm -f /etc/apt/sources.list.d/yarn*.list
