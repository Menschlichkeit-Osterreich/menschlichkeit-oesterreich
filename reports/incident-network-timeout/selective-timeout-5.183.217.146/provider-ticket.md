# Provider Ticket Draft

## Subject

[NETWORK] Selective connect timeouts to 5.183.217.146 (plesk7.digimagical.com) on 22/443/8443

## Problem Summary

- Failing source IPs observed so far: `81.217.7.174`
- Control-path source IPs: still pending; add LTE or VPN capture before sending if available.
- `plesk7.digimagical.com` resolves consistently to `5.183.217.146`; reverse PTR points back to `plesk7.digimagical.com`; no AAAA record is present in the current captures.
- A prior packet capture taken inside WSL2/NAT is excluded from causal interpretation because it does not prove packet arrival on the target host or edge firewall.

## Requested Checks

- Please inspect source-IP-based filtering, edge ACLs, DDoS/WAF policies, or routing asymmetries between the listed failing source IPs and `5.183.217.146`.
- Please run a host- or edge-side capture during the supplied repro window:
  `tcpdump -ni any -vv 'src host <aktuelle_quell_ip> and (tcp port 22 or 443 or 8443)'`
- If the SYN packets are visible, please verify host-local controls such as Fail2Ban, IP bans, or local firewall layers. If no SYN packets are visible, please investigate upstream filtering before the host.

## Attached Evidence

- `20260329T194913Z-current-shell` (`current-shell`, public IP `81.217.7.174`)
  - `runs/20260329T194913Z-current-shell/dns-a.txt`
  - `runs/20260329T194913Z-current-shell/dns-ptr.txt`
  - `runs/20260329T194913Z-current-shell/dns-aaaa.txt`
  - `runs/20260329T194913Z-current-shell/curl-direct-443.txt`
  - `runs/20260329T194913Z-current-shell/curl-sni-443.txt`
  - `runs/20260329T194913Z-current-shell/curl-direct-8443.txt`
  - `runs/20260329T194913Z-current-shell/ssh-direct-22.txt`
- `20260329T195425Z-current-shell` (`current-shell`, public IP `81.217.7.174`)
  - `runs/20260329T195425Z-current-shell/dns-a.txt`
  - `runs/20260329T195425Z-current-shell/dns-ptr.txt`
  - `runs/20260329T195425Z-current-shell/dns-aaaa.txt`
  - `runs/20260329T195425Z-current-shell/curl-direct-443.txt`
  - `runs/20260329T195425Z-current-shell/curl-sni-443.txt`
  - `runs/20260329T195425Z-current-shell/curl-direct-8443.txt`
  - `runs/20260329T195425Z-current-shell/ssh-direct-22.txt`
