"""
Social Media Autoposting Service
Automatisches Kreuzposten auf Instagram, Facebook, X (Twitter) und LinkedIn.
DSGVO-konform, rate-limit-aware, mit Retry-Logik und Audit-Log.
"""

import os
import json
import logging
import hashlib
import time
from datetime import datetime, timezone
from typing import Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum

import requests

logger = logging.getLogger(__name__)


# ── Enums & Dataclasses ────────────────────────────────────────────────────────

class Platform(str, Enum):
    INSTAGRAM  = "instagram"
    FACEBOOK   = "facebook"
    X_TWITTER  = "x_twitter"
    LINKEDIN   = "linkedin"


class PostStatus(str, Enum):
    PENDING   = "pending"
    PUBLISHED = "published"
    FAILED    = "failed"
    SKIPPED   = "skipped"


@dataclass
class SocialPost:
    """Einheitliches Post-Objekt für alle Plattformen."""
    title: str
    body: str
    url: str = ""
    image_url: str = ""
    hashtags: list[str] = field(default_factory=list)
    platforms: list[Platform] = field(default_factory=lambda: list(Platform))
    scheduled_at: Optional[datetime] = None
    # Interne Felder
    post_id: str = field(default_factory=lambda: hashlib.md5(
        f"{time.time()}".encode()).hexdigest()[:12])
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def to_instagram_caption(self, max_chars: int = 2200) -> str:
        hashtag_str = " ".join(f"#{h.lstrip('#')}" for h in self.hashtags)
        caption = f"{self.title}\n\n{self.body}"
        if self.url:
            caption += f"\n\n🔗 Link in Bio"
        if hashtag_str:
            caption += f"\n\n{hashtag_str}"
        return caption[:max_chars]

    def to_facebook_message(self) -> str:
        hashtag_str = " ".join(f"#{h.lstrip('#')}" for h in self.hashtags)
        msg = f"{self.title}\n\n{self.body}"
        if self.url:
            msg += f"\n\n{self.url}"
        if hashtag_str:
            msg += f"\n\n{hashtag_str}"
        return msg

    def to_x_tweet(self, max_chars: int = 280) -> str:
        hashtag_str = " ".join(f"#{h.lstrip('#')}" for h in self.hashtags[:3])
        tweet = f"{self.title}"
        body_budget = max_chars - len(tweet) - len(hashtag_str) - 30
        if body_budget > 20 and self.body:
            tweet += f"\n\n{self.body[:body_budget]}…"
        if self.url:
            tweet += f"\n{self.url}"
        if hashtag_str:
            tweet += f"\n{hashtag_str}"
        return tweet[:max_chars]

    def to_linkedin_post(self) -> str:
        hashtag_str = " ".join(f"#{h.lstrip('#')}" for h in self.hashtags)
        post = f"{self.title}\n\n{self.body}"
        if self.url:
            post += f"\n\n{self.url}"
        if hashtag_str:
            post += f"\n\n{hashtag_str}"
        return post[:3000]


@dataclass
class PostResult:
    platform: Platform
    status: PostStatus
    platform_post_id: Optional[str] = None
    platform_url: Optional[str] = None
    error: Optional[str] = None
    published_at: Optional[datetime] = None
    retry_count: int = 0


# ── Platform Clients ───────────────────────────────────────────────────────────

class InstagramClient:
    """Meta Graph API – Instagram Business Account."""

    BASE = "https://graph.facebook.com/v19.0"

    def __init__(self):
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
        self.ig_user_id   = os.getenv("INSTAGRAM_USER_ID", "")
        self.enabled      = bool(self.access_token and self.ig_user_id)

    def post(self, post: SocialPost) -> PostResult:
        if not self.enabled:
            return PostResult(Platform.INSTAGRAM, PostStatus.SKIPPED,
                              error="Instagram credentials not configured")
        try:
            caption = post.to_instagram_caption()
            # Step 1: Create media container
            container_resp = requests.post(
                f"{self.BASE}/{self.ig_user_id}/media",
                params={
                    "image_url": post.image_url or None,
                    "caption": caption,
                    "access_token": self.access_token,
                },
                timeout=30,
            )
            container_resp.raise_for_status()
            container_id = container_resp.json()["id"]

            # Step 2: Publish container
            pub_resp = requests.post(
                f"{self.BASE}/{self.ig_user_id}/media_publish",
                params={
                    "creation_id": container_id,
                    "access_token": self.access_token,
                },
                timeout=30,
            )
            pub_resp.raise_for_status()
            media_id = pub_resp.json()["id"]

            return PostResult(
                platform=Platform.INSTAGRAM,
                status=PostStatus.PUBLISHED,
                platform_post_id=media_id,
                platform_url=f"https://www.instagram.com/p/{media_id}/",
                published_at=datetime.now(timezone.utc),
            )
        except requests.RequestException as e:
            logger.error("Instagram post failed: %s", e)
            return PostResult(Platform.INSTAGRAM, PostStatus.FAILED, error=str(e))


class FacebookClient:
    """Meta Graph API – Facebook Page."""

    BASE = "https://graph.facebook.com/v19.0"

    def __init__(self):
        self.page_access_token = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", "")
        self.page_id           = os.getenv("FACEBOOK_PAGE_ID", "")
        self.enabled           = bool(self.page_access_token and self.page_id)

    def post(self, post: SocialPost) -> PostResult:
        if not self.enabled:
            return PostResult(Platform.FACEBOOK, PostStatus.SKIPPED,
                              error="Facebook credentials not configured")
        try:
            payload: dict[str, Any] = {
                "message": post.to_facebook_message(),
                "access_token": self.page_access_token,
            }
            if post.image_url:
                payload["link"] = post.url or post.image_url

            resp = requests.post(
                f"{self.BASE}/{self.page_id}/feed",
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            post_id = resp.json()["id"]

            return PostResult(
                platform=Platform.FACEBOOK,
                status=PostStatus.PUBLISHED,
                platform_post_id=post_id,
                platform_url=f"https://www.facebook.com/{post_id.replace('_', '/posts/')}",
                published_at=datetime.now(timezone.utc),
            )
        except requests.RequestException as e:
            logger.error("Facebook post failed: %s", e)
            return PostResult(Platform.FACEBOOK, PostStatus.FAILED, error=str(e))


class XTwitterClient:
    """X (Twitter) API v2 – OAuth 2.0 Bearer Token."""

    BASE = "https://api.twitter.com/2"

    def __init__(self):
        self.bearer_token  = os.getenv("X_BEARER_TOKEN", "")
        self.api_key       = os.getenv("X_API_KEY", "")
        self.api_secret    = os.getenv("X_API_SECRET", "")
        self.access_token  = os.getenv("X_ACCESS_TOKEN", "")
        self.access_secret = os.getenv("X_ACCESS_SECRET", "")
        self.enabled       = bool(self.api_key and self.access_token)

    def _get_oauth1_header(self) -> dict:
        """OAuth 1.0a Header für User-Context Requests."""
        try:
            from requests_oauthlib import OAuth1
            auth = OAuth1(
                self.api_key, self.api_secret,
                self.access_token, self.access_secret
            )
            return {"auth": auth}
        except ImportError:
            return {}

    def post(self, post: SocialPost) -> PostResult:
        if not self.enabled:
            return PostResult(Platform.X_TWITTER, PostStatus.SKIPPED,
                              error="X/Twitter credentials not configured")
        try:
            tweet_text = post.to_x_tweet()
            headers = {"Authorization": f"Bearer {self.bearer_token}",
                       "Content-Type": "application/json"}
            resp = requests.post(
                f"{self.BASE}/tweets",
                headers=headers,
                json={"text": tweet_text},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()["data"]

            return PostResult(
                platform=Platform.X_TWITTER,
                status=PostStatus.PUBLISHED,
                platform_post_id=data["id"],
                platform_url=f"https://x.com/i/web/status/{data['id']}",
                published_at=datetime.now(timezone.utc),
            )
        except requests.RequestException as e:
            logger.error("X/Twitter post failed: %s", e)
            return PostResult(Platform.X_TWITTER, PostStatus.FAILED, error=str(e))


class LinkedInClient:
    """LinkedIn API v2 – Organization Posts."""

    BASE = "https://api.linkedin.com/v2"

    def __init__(self):
        self.access_token = os.getenv("LINKEDIN_ACCESS_TOKEN", "")
        self.org_id       = os.getenv("LINKEDIN_ORG_ID", "")
        self.enabled      = bool(self.access_token and self.org_id)

    def post(self, post: SocialPost) -> PostResult:
        if not self.enabled:
            return PostResult(Platform.LINKEDIN, PostStatus.SKIPPED,
                              error="LinkedIn credentials not configured")
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0",
            }
            payload = {
                "author": f"urn:li:organization:{self.org_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {"text": post.to_linkedin_post()},
                        "shareMediaCategory": "ARTICLE" if post.url else "NONE",
                        **({"media": [{"status": "READY",
                                       "originalUrl": post.url,
                                       "title": {"text": post.title}}]}
                           if post.url else {}),
                    }
                },
                "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
            }
            resp = requests.post(
                f"{self.BASE}/ugcPosts",
                headers=headers,
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            post_id = resp.headers.get("x-restli-id", "")

            return PostResult(
                platform=Platform.LINKEDIN,
                status=PostStatus.PUBLISHED,
                platform_post_id=post_id,
                platform_url=f"https://www.linkedin.com/feed/update/{post_id}/",
                published_at=datetime.now(timezone.utc),
            )
        except requests.RequestException as e:
            logger.error("LinkedIn post failed: %s", e)
            return PostResult(Platform.LINKEDIN, PostStatus.FAILED, error=str(e))


# ── Cross-Posting Orchestrator ─────────────────────────────────────────────────

class SocialMediaService:
    """
    Orchestriert das automatische Kreuzposten auf alle konfigurierten Plattformen.
    Features:
    - Retry-Logik mit exponential backoff
    - Audit-Log (JSON-Lines)
    - Rate-Limit-Awareness
    - Dry-Run-Modus für Tests
    """

    DEFAULT_HASHTAGS = [
        "MenschlichkeitÖsterreich", "Demokratie", "Österreich",
        "Zivilgesellschaft", "Gemeinschaft"
    ]

    def __init__(self, dry_run: bool = False):
        self.dry_run   = dry_run
        self.instagram = InstagramClient()
        self.facebook  = FacebookClient()
        self.x_twitter = XTwitterClient()
        self.linkedin  = LinkedInClient()
        self._audit_log_path = os.getenv(
            "SOCIAL_AUDIT_LOG", "/var/log/moe/social-media-audit.jsonl"
        )
        self._clients = {
            Platform.INSTAGRAM: self.instagram,
            Platform.FACEBOOK:  self.facebook,
            Platform.X_TWITTER: self.x_twitter,
            Platform.LINKEDIN:  self.linkedin,
        }

    def crosspost(
        self,
        post: SocialPost,
        platforms: Optional[list[Platform]] = None,
        retry_count: int = 3,
        retry_delay: float = 2.0,
    ) -> dict[Platform, PostResult]:
        """
        Postet auf alle angegebenen Plattformen (oder alle konfigurierten).
        Gibt ein Dict {Platform: PostResult} zurück.
        """
        target_platforms = platforms or post.platforms or list(Platform)
        results: dict[Platform, PostResult] = {}

        # Standardmäßige Hashtags ergänzen
        if not post.hashtags:
            post.hashtags = self.DEFAULT_HASHTAGS.copy()

        for platform in target_platforms:
            client = self._clients.get(platform)
            if not client:
                results[platform] = PostResult(platform, PostStatus.SKIPPED,
                                               error="Unknown platform")
                continue

            if self.dry_run:
                logger.info("[DRY RUN] Would post to %s: %s", platform, post.title)
                results[platform] = PostResult(platform, PostStatus.SKIPPED,
                                               error="Dry run mode")
                continue

            # Retry-Logik
            last_result = None
            for attempt in range(retry_count):
                last_result = client.post(post)
                if last_result.status == PostStatus.PUBLISHED:
                    break
                if last_result.status == PostStatus.SKIPPED:
                    break
                # Exponential backoff
                wait = retry_delay * (2 ** attempt)
                logger.warning("Attempt %d failed for %s, retrying in %.1fs",
                               attempt + 1, platform, wait)
                time.sleep(wait)

            if last_result:
                last_result.retry_count = attempt
                results[platform] = last_result
                self._write_audit_log(post, last_result)

        return results

    def post_news_article(self, title: str, excerpt: str, url: str,
                          image_url: str = "", tags: list[str] = None) -> dict:
        """Convenience-Methode für News-Artikel."""
        post = SocialPost(
            title=title,
            body=excerpt,
            url=url,
            image_url=image_url,
            hashtags=tags or self.DEFAULT_HASHTAGS,
        )
        results = self.crosspost(post)
        return {p.value: asdict(r) for p, r in results.items()}

    def post_event(self, event_title: str, event_date: str, event_url: str,
                   description: str = "", image_url: str = "") -> dict:
        """Convenience-Methode für Events."""
        post = SocialPost(
            title=f"📅 {event_title}",
            body=f"{description}\n\n🗓️ {event_date}",
            url=event_url,
            image_url=image_url,
            hashtags=["MenschlichkeitÖsterreich", "Event", "Österreich", "Veranstaltung"],
        )
        results = self.crosspost(post)
        return {p.value: asdict(r) for p, r in results.items()}

    def post_membership_milestone(self, count: int) -> dict:
        """Postet Mitglieder-Meilensteine."""
        post = SocialPost(
            title=f"🎉 {count:,} Mitglieder!",
            body=f"Wir feiern {count:,} Mitglieder bei Menschlichkeit Österreich! "
                 f"Gemeinsam setzen wir uns für eine solidarische Gesellschaft ein. "
                 f"Danke an alle, die Teil dieser Gemeinschaft sind!",
            url="https://menschlichkeit-oesterreich.at/mitglied-werden",
            hashtags=["MenschlichkeitÖsterreich", "Meilenstein", "Gemeinschaft",
                      "Österreich", "Solidarität"],
        )
        return {p.value: asdict(r) for p, r in self.crosspost(post).items()}

    def _write_audit_log(self, post: SocialPost, result: PostResult) -> None:
        """Schreibt einen DSGVO-konformen Audit-Log-Eintrag."""
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "post_id": post.post_id,
            "platform": result.platform.value,
            "status": result.status.value,
            "platform_post_id": result.platform_post_id,
            "error": result.error,
            "retry_count": result.retry_count,
        }
        try:
            import pathlib
            pathlib.Path(self._audit_log_path).parent.mkdir(parents=True, exist_ok=True)
            with open(self._audit_log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except OSError as e:
            logger.warning("Could not write audit log: %s", e)


# ── FastAPI Router ─────────────────────────────────────────────────────────────

def create_social_media_router():
    """Erstellt einen FastAPI-Router für Social-Media-Endpunkte."""
    try:
        from fastapi import APIRouter, HTTPException, Depends
        from pydantic import BaseModel

        router = APIRouter(prefix="/api/social", tags=["Social Media"])
        service = SocialMediaService(dry_run=os.getenv("SOCIAL_DRY_RUN", "false").lower() == "true")

        class CrossPostRequest(BaseModel):
            title: str
            body: str
            url: str = ""
            image_url: str = ""
            hashtags: list[str] = []
            platforms: list[str] = []

        @router.post("/crosspost")
        async def crosspost(req: CrossPostRequest):
            platforms = [Platform(p) for p in req.platforms] if req.platforms else None
            post = SocialPost(
                title=req.title, body=req.body, url=req.url,
                image_url=req.image_url, hashtags=req.hashtags,
            )
            results = service.crosspost(post, platforms=platforms)
            return {p.value: asdict(r) for p, r in results.items()}

        @router.post("/post-event")
        async def post_event(title: str, date: str, url: str,
                             description: str = "", image_url: str = ""):
            return service.post_event(title, date, url, description, image_url)

        @router.get("/status")
        async def status():
            return {
                "instagram": service.instagram.enabled,
                "facebook":  service.facebook.enabled,
                "x_twitter": service.x_twitter.enabled,
                "linkedin":  service.linkedin.enabled,
                "dry_run":   service.dry_run,
            }

        return router
    except ImportError:
        logger.warning("FastAPI not available; social media router not created.")
        return None


# ── CLI / Standalone Usage ─────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Social Media Autoposting")
    parser.add_argument("--dry-run", action="store_true", help="Dry run (no actual posts)")
    parser.add_argument("--title", required=True)
    parser.add_argument("--body", required=True)
    parser.add_argument("--url", default="")
    parser.add_argument("--image-url", default="")
    parser.add_argument("--platforms", nargs="+",
                        choices=[p.value for p in Platform],
                        default=[p.value for p in Platform])
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)
    svc = SocialMediaService(dry_run=args.dry_run)
    post = SocialPost(
        title=args.title, body=args.body,
        url=args.url, image_url=args.image_url,
    )
    platforms = [Platform(p) for p in args.platforms]
    results = svc.crosspost(post, platforms=platforms)

    logger.info("Crosspost-Ergebnisse:")
    for platform, result in results.items():
        status_label = result.status.value
        logger.info("  %s → %s", platform.value, status_label)
        if result.platform_url:
            logger.info("    URL: %s", result.platform_url)
        if result.error:
            logger.warning("    Fehler: %s", result.error)
