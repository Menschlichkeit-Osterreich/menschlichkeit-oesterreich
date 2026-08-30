FROM python:3.12-slim@sha256:09f7da3bc104798d0afb40bc08d23ab2da20a76130cec1f2ef170848f5d85217 AS builder
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app

RUN python -m venv /opt/venv
COPY requirements.txt /app/requirements.txt
# Upgrade pip + setuptools (setuptools <78.1.1 is flagged by the container scan)
RUN /opt/venv/bin/pip install --upgrade pip "setuptools>=78.1.1" && \
    /opt/venv/bin/pip install -r /app/requirements.txt

FROM python:3.12-slim@sha256:09f7da3bc104798d0afb40bc08d23ab2da20a76130cec1f2ef170848f5d85217 AS runner
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"
WORKDIR /app

# Targeted OS security upgrade: pull the newest openssl/libssl3 security fixes
# (e.g. CVE-2026-14456) from the Debian archive that are not yet baked into the
# pinned base layer. Scoped to the affected packages (no blanket dist upgrade),
# no recommends, apt cache removed.
RUN apt-get update && \
    apt-get install -y --no-install-recommends --only-upgrade openssl libssl3 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
COPY . /app

RUN adduser --disabled-password --gecos "" --uid 1001 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/healthz', timeout=3)" || exit 1
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
