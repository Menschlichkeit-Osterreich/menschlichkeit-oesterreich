# Provider Ticket Report: Source-IP-dependent connectivity to `5.183.217.146`

**Prepared:** March 29, 2026  
**Prepared for:** digimagical / hosting or upstream network support  
**Primary target:** `plesk7.digimagical.com` / `5.183.217.146`

## Suggested subject

`[NETWORK] Source-IP-dependent connectivity to 5.183.217.146: 22/443 selective, 8443 still timing out`

## Executive summary

We observed reproducible, source-IP-dependent behavior when connecting to `5.183.217.146`.

- From public source IP `81.217.7.174`, connections to `22`, `443`, and `8443` time out.
- From public source IP `46.125.130.131` over an iPhone hotspot, `443` is reachable and returns a valid HTTP response, and `22` reaches the SSH service far enough to return `Permission denied`.
- `8443` times out on both source IPs and should be treated as a separate issue from the selective `22`/`443` behavior.
- DNS is not a plausible primary cause for the `443` problem, because the failing test also times out against the raw IP and with `--resolve` forcing hostname/SNI without DNS lookup.

This strongly suggests source-IP-specific filtering or path-dependent filtering for `22` and `443`, while `8443` appears to have an additional general reachability/filtering problem.

## DNS findings

As captured on March 29, 2026:

- `plesk7.digimagical.com` resolves to `5.183.217.146`
- Reverse PTR for `5.183.217.146` points back to `plesk7.digimagical.com`
- No `AAAA` record is present for `plesk7.digimagical.com`

Conclusion:

- DNS is internally consistent.
- The failing direct-IP test on `443` already bypasses DNS completely.
- The failing `--resolve` test on `443` also bypasses DNS resolution while preserving hostname/SNI.

## Reproduction evidence

### 1. Failing path

**Timestamp:** March 29, 2026 19:49:35 UTC  
**Run:** `20260329T194913Z-current-shell`  
**Public source IP:** `81.217.7.174`

Observed behavior:

- `curl -vk --connect-timeout 5 https://5.183.217.146/`
  - TCP connect to `5.183.217.146:443` times out after about 5 seconds
- `curl -vk --connect-timeout 5 --resolve plesk7.digimagical.com:443:5.183.217.146 https://plesk7.digimagical.com/`
  - Same timeout to `5.183.217.146:443` after about 5 seconds
- `ssh -o ConnectTimeout=5 -o BatchMode=yes dmpl20230054@5.183.217.146 exit`
  - `ssh: connect to host 5.183.217.146 port 22: Connection timed out`
- `curl -vk --connect-timeout 5 https://5.183.217.146:8443/`
  - TCP connect to `5.183.217.146:8443` times out after about 5 seconds

Representative raw output:

```text
* Trying 5.183.217.146:443...
* Connection timed out after 5006 milliseconds
curl: (28) Connection timed out after 5006 milliseconds
```

```text
ssh: connect to host 5.183.217.146 port 22: Connection timed out
```

### 2. Working control path

**Timestamp:** March 29, 2026 20:10:56 UTC  
**Run:** `20260329T201048Z-iphone-hotspot-active`  
**Public source IP:** `46.125.130.131`  
**Local route during test:** Windows default route via `WLAN` to gateway `172.20.10.1` (iPhone hotspot)

Observed behavior:

- `curl -vk --connect-timeout 5 https://5.183.217.146/`
  - TCP/TLS connection succeeds
  - HTTP response: `303 See Other`
  - `Location: https://5.183.217.146:443/login.php`
- `curl -vk --connect-timeout 5 --resolve plesk7.digimagical.com:443:5.183.217.146 https://plesk7.digimagical.com/`
  - TCP/TLS connection succeeds
  - HTTP response: `303 See Other`
  - `Location: https://plesk7.digimagical.com:443/login.php`
- `ssh -o ConnectTimeout=5 -o BatchMode=yes dmpl20230054@5.183.217.146 exit`
  - SSH service is reached
  - Response: `Permission denied (publickey,password)`
- `curl -vk --connect-timeout 5 https://5.183.217.146:8443/`
  - Still times out after about 5 seconds

Representative raw output:

```text
* Established connection to 5.183.217.146 (5.183.217.146 port 443)
< HTTP/1.1 303 See Other
< Location: https://5.183.217.146:443/login.php
```

```text
dmpl20230054@5.183.217.146: Permission denied (publickey,password).
```

## Technical interpretation

### What is strongly supported by the evidence

- `443` is not generally down.
  The control path reaches it successfully.
- DNS is not the primary cause of the `443` failure.
  The failing path times out both against the raw IP and with `--resolve`.
- `22` also behaves differently by source IP.
  One source IP times out; another reaches the SSH daemon and gets an authentication failure.

### Most likely explanation for `22` and `443`

The strongest current explanation is source-IP-specific or path-specific filtering affecting source IP `81.217.7.174` on at least ports `22` and `443`.

Possible locations:

- host-local security layer on or near the server:
  Fail2Ban, Plesk IP ban, local firewall, host-adjacent filtering
- upstream of the host:
  provider firewall, edge ACL, WAF, DDoS filtering, routing asymmetry

### Separate issue: `8443`

Port `8443` timed out from both:

- `81.217.7.174`
- `46.125.130.131`

This suggests `8443` should be investigated separately and not be used as the main discriminator for the selective `22`/`443` problem.

### Evidence that should not be overinterpreted

A previous packet capture inside WSL2/NAT is not sufficient to prove packet arrival or non-arrival on the actual target host or provider edge. It should not be used as the decisive packet-level proof.

## Requested provider actions

Please investigate the following:

1. Check for source-IP-based filtering or path-based filtering between source IP `81.217.7.174` and target `5.183.217.146` on ports `22` and `443`.
2. Check provider-edge ACLs, WAF/DDoS policies, routing asymmetry, and any host-adjacent filtering that could affect `81.217.7.174`.
3. Independently verify why `8443` is timing out from both tested source IPs.
4. During a coordinated reproduction window, run a packet capture on the actual host or provider edge:

```bash
tcpdump -ni any -vv 'src host 81.217.7.174 and (tcp port 22 or 443 or 8443)'
```

Interpretation of that capture:

- If SYN packets are visible on the host or edge capture, the block is likely host-local or host-adjacent.
- If no SYN packets are visible, the block is likely upstream before the host.

## Evidence file locations

Primary summary:

- `reports/incident-network-timeout/selective-timeout-5.183.217.146/SUMMARY.md`
- `reports/incident-network-timeout/selective-timeout-5.183.217.146/latest-run-metadata.json`

Representative failing raw evidence:

- `quality-reports/incident-network-timeout/selective-timeout-5.183.217.146/runs/20260329T194913Z-current-shell/curl-direct-443.txt`
- `quality-reports/incident-network-timeout/selective-timeout-5.183.217.146/runs/20260329T194913Z-current-shell/curl-sni-443.txt`
- `quality-reports/incident-network-timeout/selective-timeout-5.183.217.146/runs/20260329T194913Z-current-shell/ssh-direct-22.txt`

Representative control-path raw evidence:

- `quality-reports/incident-network-timeout/selective-timeout-5.183.217.146/runs/20260329T201048Z-iphone-hotspot-active/curl-direct-443.txt`
- `quality-reports/incident-network-timeout/selective-timeout-5.183.217.146/runs/20260329T201048Z-iphone-hotspot-active/curl-sni-443.txt`
- `quality-reports/incident-network-timeout/selective-timeout-5.183.217.146/runs/20260329T201048Z-iphone-hotspot-active/ssh-direct-22.txt`
- `quality-reports/incident-network-timeout/selective-timeout-5.183.217.146/runs/20260329T201048Z-iphone-hotspot-active/curl-direct-8443.txt`

## Ticket-ready short version

We can reproduce source-IP-dependent connectivity to `5.183.217.146`.

- From `81.217.7.174`, ports `22`, `443`, and `8443` time out.
- From `46.125.130.131` over an iPhone hotspot, port `443` connects successfully and returns `HTTP/1.1 303 See Other`, and port `22` reaches SSH and returns `Permission denied (publickey,password)`.
- Port `8443` still times out from both source IPs.
- DNS is not the primary cause for the `443` issue, because the failing source IP times out both against the raw IP and with `--resolve` forcing hostname/SNI without DNS lookup.

Please investigate source-IP/path-specific filtering for `81.217.7.174` to `5.183.217.146` on `22` and `443`, and separately investigate general reachability of `8443`.
