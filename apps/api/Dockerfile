FROM python:3.12-slim@sha256:0bbd3d5f3abb2024c1b92ce69e8bdfefa17c248999827c34e2ed52ba0772da1b AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

# Non-root user (CIS Docker Benchmark 4.1)
RUN adduser --disabled-password --gecos "" --uid 1001 appuser
USER appuser

EXPOSE 8001
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
