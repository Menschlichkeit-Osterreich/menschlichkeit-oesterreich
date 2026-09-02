FROM alpine:3.21.3

RUN apk add --no-cache --update bash docker openjdk8

WORKDIR /workdir

COPY --chown=root:root cli/target/universal/stage /workdir

RUN adduser -D -u 1000 appuser && chown -R 1000:1000 /workdir
USER 1000

ENTRYPOINT ["/workdir/bin/codacy-analysis-cli"]

CMD []