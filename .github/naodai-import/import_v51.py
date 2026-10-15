#!/usr/bin/env python3
"""One-time, hash-pinned import of the already public Naodai v51 static site.

Only Python's standard library is used. Downloaded files are never executed.
Credentials are handled by the pinned official checkout action, not this fetcher.
"""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

SOURCE_BASE = "https://naodai-plus-demo-408.hayes06191231.chatgpt.site/"
SOURCE_COMMIT = "8758fd3f32e393d675a6a709c3db8e385a73558d"
REPOSITORY = "OuOing/naodai-plus-demo"
ORIGIN_URLS = {"https://github.com/OuOing/naodai-plus-demo", "https://github.com/OuOing/naodai-plus-demo.git"}
FILE_COUNT = 2839
TOTAL_BYTES = 136455348
MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_WORKERS = 8
ATTEMPTS = 3
REQUEST_TIMEOUT = 20
ASSET_DEADLINE = 60
TOTAL_DEADLINE = 17 * 60
HTML_OVERRIDES = ("index.html", "math.html")


class ImportFailure(RuntimeError):
    pass


def validate_path(value):
    if not isinstance(value, str) or not value or "\\" in value or "%" in value:
        raise ImportFailure("Invalid manifest path")
    parts = value.split("/")
    if any(not part or part in (".", "..") or part.startswith(".") for part in parts):
        raise ImportFailure("Unsafe manifest path")
    if any(ord(c) < 32 or ord(c) == 127 for c in value) or ":" in value:
        raise ImportFailure("Invalid manifest path character")
    if PurePosixPath(value).is_absolute() or PurePosixPath(value).as_posix() != value:
        raise ImportFailure("Non-canonical manifest path")
    return value


def origin(value):
    p = urllib.parse.urlsplit(value)
    if p.username or p.password or p.scheme != "https" or not p.hostname or p.port not in (None, 443):
        raise ImportFailure("Only the fixed HTTPS source origin is permitted")
    return p.scheme, p.hostname, p.port or 443


class SameOriginRedirect(urllib.request.HTTPRedirectHandler):
    def __init__(self, source_base):
        self.allowed_origin = origin(source_base)

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if origin(newurl) != self.allowed_origin:
            raise ImportFailure("Cross-origin redirect refused")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def load_manifest(path, expected_sha256):
    raw = Path(path).read_bytes()
    if not re.fullmatch(r"[0-9a-f]{64}", expected_sha256 or ""):
        raise ImportFailure("A pinned manifest SHA-256 is required")
    if hashlib.sha256(raw).hexdigest() != expected_sha256:
        raise ImportFailure("Manifest SHA-256 mismatch")
    manifest = json.loads(raw)
    if manifest.get("schema") != 1 or manifest.get("source_base") != SOURCE_BASE:
        raise ImportFailure("Unexpected manifest schema or source origin")
    if manifest.get("source_commit") != SOURCE_COMMIT:
        raise ImportFailure("Unexpected source version")
    rows = manifest.get("files")
    if not isinstance(rows, list) or len(rows) != FILE_COUNT or manifest.get("file_count") != FILE_COUNT:
        raise ImportFailure("Unexpected manifest file count")
    paths = set()
    for row in rows:
        if not isinstance(row, dict) or set(row) != {"path", "bytes", "sha256"}:
            raise ImportFailure("Invalid manifest file record")
        path = validate_path(row["path"])
        if path in paths:
            raise ImportFailure("Duplicate manifest path")
        paths.add(path)
        if type(row["bytes"]) is not int or not 0 <= row["bytes"] <= MAX_FILE_BYTES:
            raise ImportFailure("Invalid expected file size")
        if not isinstance(row["sha256"], str) or not re.fullmatch(r"[0-9a-f]{64}", row["sha256"]):
            raise ImportFailure("Invalid expected file hash")
    if sum(row["bytes"] for row in rows) != TOTAL_BYTES or manifest.get("total_bytes") != TOTAL_BYTES:
        raise ImportFailure("Unexpected total byte count")
    if manifest.get("sentinels") != ["index.html", "app.js", "photos/article-c04133cc11cd.jpg"]:
        raise ImportFailure("Unexpected sentinel list")
    if not set(manifest["sentinels"]) <= paths:
        raise ImportFailure("Missing sentinel")
    return manifest


def checked_destination(root, relative):
    # Refuse existing symlinks anywhere along a destination path.
    target = Path(root)
    for part in PurePosixPath(relative).parts:
        target = target / part
        if target.is_symlink():
            raise ImportFailure("Symlink destination refused")
    if not target.resolve().is_relative_to(Path(root).resolve()):
        raise ImportFailure("Destination escapes staging directory")
    return target


def validate_payload(row, payload, content_type=""):
    path = validate_path(row["path"])
    if not path.endswith(".html"):
        prefix = payload[:1024].lstrip().lower()
        if "text/html" in content_type.lower() or prefix.startswith((b"<!doctype html", b"<html")):
            raise ImportFailure("Unexpected HTML response for " + path)
    if len(payload) != row["bytes"]:
        raise ImportFailure("Size mismatch for " + path)
    if hashlib.sha256(payload).hexdigest() != row["sha256"]:
        raise ImportFailure("SHA-256 mismatch for " + path)


def fetch_once(row, stage, deadline, opener=None):
    path = validate_path(row["path"])
    url = SOURCE_BASE + urllib.parse.quote(path, safe="/")
    if origin(url) != origin(SOURCE_BASE):
        raise ImportFailure("Unexpected request origin")
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise ImportFailure("Import deadline exceeded")
    opener = opener or urllib.request.build_opener(SameOriginRedirect(SOURCE_BASE))
    req = urllib.request.Request(url, headers={
        "User-Agent": "Naodai-v51-GitHub-Pages-Import/1.0",
        "Accept-Encoding": "identity",
        "Cache-Control": "no-cache",
    })
    local_deadline = min(deadline, time.monotonic() + ASSET_DEADLINE)
    with opener.open(req, timeout=min(REQUEST_TIMEOUT, remaining)) as response:
        if response.status != 200 or origin(response.geturl()) != origin(SOURCE_BASE):
            raise ImportFailure("Unexpected HTTP response for " + path)
        if response.headers.get("Content-Encoding", "identity").lower() not in ("identity", ""):
            raise ImportFailure("Unexpected response encoding for " + path)
        content_length = response.headers.get("Content-Length")
        if content_length is not None and int(content_length) != row["bytes"]:
            raise ImportFailure("Content-Length mismatch for " + path)
        chunks = []
        size = 0
        while True:
            if time.monotonic() >= local_deadline:
                raise ImportFailure("Asset deadline exceeded for " + path)
            chunk = response.read(min(65536, row["bytes"] + 1 - size))
            if not chunk:
                break
            chunks.append(chunk)
            size += len(chunk)
            if size > row["bytes"]:
                raise ImportFailure("Oversized response for " + path)
        payload = b"".join(chunks)
        validate_payload(row, payload, response.headers.get("Content-Type", ""))
    target = checked_destination(stage, path)
    target.parent.mkdir(parents=True, exist_ok=True)
    # No unverified bytes are written into the output tree.
    target.write_bytes(payload)
    return path


def fetch_with_retries(row, stage, deadline):
    for attempt in range(ATTEMPTS):
        try:
            return fetch_once(row, stage, deadline)
        except urllib.error.HTTPError as exc:
            # Access denials, challenges, missing files, and wrong source bytes
            # stop immediately. Retry only ordinary transient service responses.
            if exc.code not in {429, 500, 502, 503, 504}:
                raise ImportFailure("HTTP " + str(exc.code) + " for " + row["path"] + "; no retry") from None
            delay = 2 ** attempt
            try:
                delay = max(delay, min(30, int(exc.headers.get("Retry-After", "0"))))
            except (TypeError, ValueError):
                pass
            reason = "HTTP " + str(exc.code)
        except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
            delay = 2 ** attempt
            reason = type(exc).__name__
        # ImportFailure (hash/size/HTML/redirect) is deliberately not retried.
        if attempt + 1 == ATTEMPTS or time.monotonic() >= deadline:
            raise ImportFailure("Fetch failed for " + row["path"] + " (" + reason + ")") from None
        print("Transient " + reason + "; retry " + str(attempt + 1) + "/2 for " + row["path"], flush=True)
        time.sleep(min(delay, max(0, deadline - time.monotonic())))
    raise ImportFailure("Unreachable retry state")


def verify_tree(manifest, directory):
    expected = {row["path"] for row in manifest["files"]}
    actual = set()
    for p in Path(directory).rglob("*"):
        if p.is_symlink():
            raise ImportFailure("Symlink in downloaded tree")
        if p.is_file():
            actual.add(p.relative_to(directory).as_posix())
    if actual != expected:
        raise ImportFailure("Downloaded tree does not match the exact manifest")
    for row in manifest["files"]:
        validate_payload(row, checked_destination(directory, row["path"]).read_bytes())


def install_html_overrides(manifest, stage, override_directory):
    """Use exact local-source HTML, still verified by the unchanged manifest."""
    rows = {row["path"]: row for row in manifest["files"]}
    payloads = []
    directory = Path(override_directory)
    if directory.is_symlink():
        raise ImportFailure("HTML override directory must not be a symlink")
    # Validate both overrides before writing either one. No network fallback.
    for path in HTML_OVERRIDES:
        source = checked_destination(directory, path)
        if path not in rows or not source.is_file():
            raise ImportFailure("Missing pinned HTML override: " + path)
        payload = source.read_bytes()
        validate_payload(rows[path], payload)
        payloads.append((path, payload))
    for path, payload in payloads:
        target = checked_destination(stage, path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)
        print("Pinned HTML override verified: " + path, flush=True)
    return set(HTML_OVERRIDES)


def download_all(manifest, stage, override_directory):
    deadline = time.monotonic() + TOTAL_DEADLINE
    rows = {row["path"]: row for row in manifest["files"]}
    completed = install_html_overrides(manifest, stage, override_directory)
    for path in manifest["sentinels"]:
        if path not in completed:
            fetch_with_retries(rows[path], stage, deadline)
            completed.add(path)
        print("Sentinel verified: " + path, flush=True)
    pending = [row for row in manifest["files"] if row["path"] not in completed]
    done = len(completed)
    pool = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS)
    futures = [pool.submit(fetch_with_retries, row, stage, deadline) for row in pending]
    try:
        for future in concurrent.futures.as_completed(futures):
            future.result()
            done += 1
            if done % 200 == 0 or done == len(rows):
                print("Verified " + str(done) + "/" + str(len(rows)) + " files", flush=True)
    finally:
        pool.shutdown(wait=True, cancel_futures=True)
    verify_tree(manifest, stage)


def git(repo, *args, input_bytes=None):
    result = subprocess.run(["git", "-C", str(repo), *args], input=input_bytes,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode:
        # Avoid emitting potentially credential-bearing remote messages.
        raise ImportFailure("Git command failed: " + args[0])
    return result.stdout


def remote_head(repo):
    rows = git(repo, "ls-remote", "--exit-code", "origin", "refs/heads/main").decode().strip().splitlines()
    if len(rows) != 1:
        raise ImportFailure("Unexpected main reference")
    sha, ref = rows[0].split()
    if ref != "refs/heads/main" or not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ImportFailure("Invalid remote main reference")
    return sha


def assert_expected_head(repo, expected_head, require_clean=False):
    if not re.fullmatch(r"[0-9a-f]{40}", expected_head or ""):
        raise ImportFailure("An exact expected bootstrap commit is required")
    if git(repo, "rev-parse", "HEAD").decode().strip() != expected_head:
        raise ImportFailure("Local HEAD changed")
    if git(repo, "remote", "get-url", "origin").decode().strip() not in ORIGIN_URLS:
        raise ImportFailure("Unexpected repository origin")
    if remote_head(repo) != expected_head:
        raise ImportFailure("Remote main changed; refusing to overwrite new work")
    if require_clean and git(repo, "status", "--porcelain", "--untracked-files=all"):
        raise ImportFailure("Checkout is not clean")


def install_verified(manifest, stage, repo):
    verify_tree(manifest, stage)
    # Validate every destination before writing any site file.
    for row in manifest["files"]:
        dest = checked_destination(repo, row["path"])
        if dest.exists() and not dest.is_file():
            raise ImportFailure("Destination is not a regular file")
    marker = checked_destination(repo, ".nojekyll")
    if marker.exists() and not marker.is_file():
        raise ImportFailure("Invalid .nojekyll destination")
    for row in manifest["files"]:
        dest = checked_destination(repo, row["path"])
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(Path(stage) / row["path"], dest)
        dest.chmod(0o644)
        validate_payload(row, dest.read_bytes())
    marker.write_bytes(b"")
    marker.chmod(0o644)


def commit_and_push(manifest, repo, expected_head):
    assert_expected_head(repo, expected_head)
    allowed = {row["path"] for row in manifest["files"]} | {".nojekyll"}
    pathspec = b"".join(path.encode("utf-8") + b"\0" for path in sorted(allowed))
    git(repo, "--literal-pathspecs", "add", "--pathspec-from-file=-", "--pathspec-file-nul", input_bytes=pathspec)
    staged = {x.decode("utf-8") for x in git(repo, "diff", "--cached", "--name-only", "-z").split(b"\0") if x}
    if not staged or not staged <= allowed:
        raise ImportFailure("Empty or out-of-scope staged change set")
    if git(repo, "diff", "--cached", "--diff-filter=D", "--name-only"):
        raise ImportFailure("Import must not delete tracked files")
    git(repo, "config", "user.name", "github-actions[bot]")
    git(repo, "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
    git(repo, "commit", "-m", "Publish verified Naodai v51 static site", "-m", "Source: " + SOURCE_COMMIT)
    imported_head = git(repo, "rev-parse", "HEAD").decode().strip()
    if git(repo, "rev-parse", "HEAD^").decode().strip() != expected_head:
        raise ImportFailure("Unexpected import commit parent")
    if remote_head(repo) != expected_head:
        raise ImportFailure("Remote main changed before push; no push attempted")
    # Deliberately no force, lease override, reset, rebase, or merge.
    git(repo, "push", "origin", "HEAD:refs/heads/main")
    if remote_head(repo) != imported_head:
        raise ImportFailure("Pushed commit could not be verified")
    print("Verified import commit: " + imported_head, flush=True)
    return imported_head


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--manifest-sha256", required=True)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--expected-head", required=True)
    parser.add_argument("--publish", action="store_true")
    args = parser.parse_args()
    manifest = load_manifest(args.manifest, args.manifest_sha256)
    if os.environ.get("GITHUB_ACTIONS") != "true" or os.environ.get("GITHUB_REPOSITORY") != REPOSITORY:
        raise ImportFailure("This entrypoint only runs in the intended repository's GitHub Actions job")
    if os.environ.get("GITHUB_EVENT_NAME") != "push" or os.environ.get("GITHUB_REF") != "refs/heads/main":
        raise ImportFailure("Only the intended main-branch push event is supported")
    if args.expected_head != os.environ.get("GITHUB_SHA"):
        raise ImportFailure("Expected HEAD is not the triggering commit")
    repo = Path(args.repo).resolve()
    if repo != Path(os.environ["GITHUB_WORKSPACE"]).resolve():
        raise ImportFailure("Repository is not the checkout workspace")
    assert_expected_head(repo, args.expected_head, require_clean=True)
    with tempfile.TemporaryDirectory(prefix="naodai-v51-", dir=os.environ.get("RUNNER_TEMP")) as temporary:
        stage = Path(temporary)
        if stage.is_relative_to(repo):
            raise ImportFailure("Download stage must be outside the checkout")
        download_all(manifest, stage, Path(__file__).resolve().parent / "html")
        assert_expected_head(repo, args.expected_head, require_clean=True)
        if not args.publish:
            print("All source assets verified; no repository files changed", flush=True)
            return
        install_verified(manifest, stage, repo)
        commit_and_push(manifest, repo, args.expected_head)
    print("Imported 2,839 verified source files and .nojekyll. Remove this temporary workflow to trigger Pages.", flush=True)


if __name__ == "__main__":
    try:
        main()
    except (ImportFailure, OSError, ValueError, KeyError) as exc:
        print("Import stopped: " + str(exc), file=sys.stderr, flush=True)
        sys.exit(1)
