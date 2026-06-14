# Ginger Bros Homelab

Complete self-hosted infrastructure running on Intel N100 (4 cores, 10GB RAM, 238GB NVMe + 477GB HDD).

## Architecture

```
Internet → Cloudflare (TLS termination) → cloudflared tunnel → Caddy (port 80) → backend services
```

- **DNS:** AdGuardHome with split-horizon DNS (LAN traffic bypasses Cloudflare)
- **Auth:** Authentik SSO (OIDC + forward auth)
- **Storage:** NVMe for system/containers, HDD for media
- **Network:** Tailscale for remote access, Cloudflare tunnel for public services

## Services

### Media Stack
| Service | URL | Description | Credentials |
|---------|-----|-------------|-------------|
| Reiverr | https://watch.gingerbrosshop.com | Movie/TV discovery & streaming | First login creates admin |
| Jackett | https://indexer.gingerbrosshop.com | Torrent indexer aggregation | API key: `usk4hge3c7wlpc9ned95qwgv4ydw5iw3` |
| qBittorrent | https://qbittorrent.gingerbrosshop.com | Download client | admin / adminadmin |
| Calibre-Web | https://books.gingerbrosshop.com | Book library & management | admin / admin123 |

### Infrastructure
| Service | URL | Description | Auth |
|---------|-----|-------------|------|
| Authentik | https://auth.gingerbrosshop.com | SSO & Identity provider | gingerbros.brew@gmail.com, dang, pang |
| Nextcloud | https://cloud.gingerbrosshop.com | File storage, sync, collaboration | Authentik SSO |
| Immich | https://immich.gingerbrosshop.com | Photo management & backup | Authentik SSO |
| AdGuard Home | https://adguardhome.gingerbrosshop.com | DNS & ad blocking | - |

### Tools
| Service | URL | Description |
|---------|-----|-------------|
| SearXNG | https://search.gingerbrosshop.com | Privacy meta-search engine (aggregates Google, Bing, DuckDuckGo without tracking) |
| Collabora | https://office.gingerbrosshop.com | Online document editing (integrates with Nextcloud) |
| Dashboard | https://dash.gingerbrosshop.com | Service overview & quick links |

### What Each Service Does

**SearXNG** - A free internet metasearch engine that aggregates results from 70+ search services. Users are neither tracked nor profiled. It queries multiple search engines and combines results without storing your search history.

**Collabora Online** - LibreOffice-based online document editor. It has an admin interface at `/browser/dist/admin/admin.html` but it's disabled by default. Currently used through Nextcloud integration only (no standalone web UI).

**Caddy** - Reverse proxy with automatic HTTPS. No web UI - configured via Caddyfile at `/etc/caddy/Caddyfile`.

## Setup Instructions

### Reiverr (Watch Movies/TV)
1. Visit https://watch.gingerbrosshop.com
2. Create account (first login = admin)
3. Go to Settings → Media Sources
4. Add "torrent" plugin:
   - Jackett URL: `http://indexer.gingerbrosshop.com`
   - API Key: `usk4hge3c7wlpc9ned95qwgv4ydw5iw3`
5. Visit https://indexer.gingerbrosshop.com → Add Indexers
6. Select: 1337x, YTS, EZTV, ThePirateBay, TorrentGalaxy
7. Back to Reiverr → search → click "Watch" or "Download"

### Books (Calibre-Web)
1. Visit https://books.gingerbrosshop.com
2. Login: admin / admin123
3. Upload books or configure OPDS for syncing

## Credentials

All credentials stored in `~/authentik-user-credentials.txt` (chmod 600).

| Service | Username | Password/Key |
|---------|----------|--------------|
| Reiverr | (first login) | Set on first login |
| Jackett | (none) | API: usk4hge3c7wlpc9ned95qwgv4ydw5iw3 |
| qBittorrent | admin | adminadmin |
| Calibre-Web | admin | admin123 |
| Authentik | gingerbros.brew@gmail.com | (in credentials file) |
| Nextcloud | Authentik SSO | - |
| Immich | Authentik SSO | - |

## Network Configuration

### DNS Rewrites (AdGuardHome)
LAN traffic to `.gingerbrosshop.com` domains bypasses Cloudflare and hits Caddy directly:
- `cloud.gingerbrosshop.com` → 192.168.1.102
- `office.gingerbrosshop.com` → 192.168.1.102
- `auth.gingerbrosshop.com` → 192.168.1.102
- `immich.gingerbrosshop.com` → 192.168.1.102
- `watch.gingerbrosshop.com` → 192.168.1.102
- `indexer.gingerbrosshop.com` → 192.168.1.102
- `dash.gingerbrosshop.com` → 192.168.1.102
- `books.gingerbrosshop.com` → 192.168.1.102

### Ports
| Port | Service |
|------|---------|
| 80 | Caddy (HTTP) |
| 443 | Caddy (HTTPS, LAN only) |
| 3000 | Reiverr |
| 3001 | Homepage Dashboard |
| 8082 | qBittorrent |
| 9117 | Jackett |
| 9000 | Authentik |
| 8123 | Home Assistant (removed) |
| 2283 | Immich (LXC) |
| 8096 | Jellyfin (removed) |
| 5000 | Frigate (removed) |

## Management Commands

```bash
# Service management
sudo systemctl reload caddy              # Apply Caddyfile changes
sudo systemctl restart AdGuardHome       # Restart DNS
sudo docker restart <container>          # Restart container

# Logs
sudo docker logs <container> --tail=50 -f
journalctl -u caddy -f

# LXC containers
lxc list                               # List containers
lxc exec <name> -- bash                # Shell into LXC

# Authentik
cd /opt/authentik && sudo docker compose restart server
```

## Removed Services
- Home Assistant
- Frigate NVR
- WebSSH
- Jellyseerr
- Sonarr
- Radarr
- Jellyfin
- Stremio

## Hardware
- **CPU:** Intel N100 (4 cores)
- **RAM:** 10GB
- **Storage:** 238GB NVMe + 477GB HDD
- **OS:** Ubuntu 25.10
- **Location:** 192.168.1.102

## GitHub
https://github.com/jamesperenchio1
