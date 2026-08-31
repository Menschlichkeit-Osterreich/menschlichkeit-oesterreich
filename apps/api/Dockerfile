FROM python:3.12-slim@sha256:09f7da3bc104798d0afb40bc08d23ab2da20a76130cec1f2ef170848f5d85217 AS builder
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app

RUN python -m venv /opt/venv
COPY requirements.txt /app/requirements.txt
RUN /opt/venv/bin/pip install --upgrade pip "setuptools>=78.1.1" && \
    /opt/venv/bin/pip install -r /app/requirements.txt

FROM python:3.12-slim@sha256:09f7da3bc104798d0afb40bc08d23ab2da20a76130cec1f2ef170848f5d85217 AS runner
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"
WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY . /app

# Sicherheitsupdates der Distribution einspielen. Das Basis-Image wird von
# upstream nicht bei jedem Debian-Security-Release neu gebaut und hinkt daher
# punktuell hinterher (z. B. openssl/libssl3t64 3.5.6 statt 3.5.7).
# Zusaetzlich das setuptools der SYSTEM-Python-Installation aktualisieren
# (CVE-2025-47273): die Anwendung laeuft zwar aus /opt/venv, das Image enthaelt
# unter /usr/local aber eine zweite, vom Basis-Image mitgelieferte Kopie.
RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/* && \
    /usr/local/bin/python -m pip install --no-cache-dir --upgrade "setuptools>=78.1.1"

RUN adduser --disabled-password --gecos "" --uid 1001 appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/healthz', timeout=3)" || exit 1
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
