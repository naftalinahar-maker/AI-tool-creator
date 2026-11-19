#!/usr/bin/env python3
"""Add the vertical sample videos (reels) to a static build of the site.

The videos are hosted with the site itself (no Google Drive sharing needed):
every <name>.mp4 in <media-dir>/videos (with an optional <name>.jpg poster) is
copied to <site-dir>/videos/ and shown as a row of vertical players at the end
of the "סרטונים לדוגמה" section.

Usage: python3 add-reels.py <site-dir> <media-dir>
"""
import shutil
import sys
from pathlib import Path


def main(site, media):
    site, media = Path(site), Path(media)
    src = media / "videos"
    videos = sorted(src.glob("*.mp4"))
    if not videos:
        print("no videos in", src)
        return

    dest = site / "videos"
    dest.mkdir(exist_ok=True)
    cards = []
    for v in videos:
        shutil.copy2(v, dest / v.name)
        poster = v.with_suffix(".jpg")
        poster_attr = ""
        if poster.is_file():
            shutil.copy2(poster, dest / poster.name)
            poster_attr = f' poster="videos/{poster.name}"'
        cards.append(
            '\t\t\t\t<figure class="reel reveal">'
            f'<video src="videos/{v.name}"{poster_attr} controls playsinline preload="none"></video>'
            "</figure>"
        )

    block = (
        '\t\t\t<div class="reels">\n' + "\n".join(cards) + "\n\t\t\t</div>\n"
    )

    index = site / "index.html"
    html = index.read_text(encoding="utf-8")
    start = html.index('id="videos"')
    end = html.index("</section>", start)
    # Insert just before the section's container closes.
    close = html.rindex("\t\t</div>\n\t</section>", start, end + len("</section>"))
    html = html[:close] + block + html[close:]
    index.write_text(html, encoding="utf-8")
    print(f"added {len(videos)} reels to {index}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
