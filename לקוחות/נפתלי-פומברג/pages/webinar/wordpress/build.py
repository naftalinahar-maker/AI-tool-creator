"""בונה את הגרסה לוורדפרס של דף הוובינר.

מה הוא מייצר:
  ../wp.css               עיצוב הדף, תחום בתוך .fw כדי לא להתנגש בתבנית של האתר (עולה לנטליפיי)
  landing-snippet.html    קטע להדבקה בווידג'ט HTML באלמנטור, בעמוד /webinar
  thank-you-snippet.html  קטע להדבקה בעמוד /webinar-thanks

הקבצים (עיצוב, גופנים, תמונות, סקריפט הטופס) נשארים בנטליפיי, והטופס שולח לפונקציה שם.
הרצה: python3 build.py
"""
import re, pathlib

BASE = 'https://fomberg-webinar.netlify.app/'
ENDPOINT = BASE + '.netlify/functions/subscribe'
THANK_YOU = '/webinar-thanks/'
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent

# כללי בסיס: מנטרלים עיצובים של התבנית שעלולים לדרוס את הדף
RESET = """.fw{direction:rtl;text-align:right}
.fw h1,.fw h2,.fw h3,.fw p,.fw li,.fw a,.fw label,.fw input,.fw button,.fw figure,.fw figcaption,.fw span,.fw b,.fw em,.fw strong{font-family:inherit;letter-spacing:normal;text-transform:none}
.fw h1,.fw h2,.fw h3{color:inherit;font-size:inherit;line-height:inherit;font-weight:inherit}
.fw a{text-decoration:none}
.fw img{height:auto;border:0;box-shadow:none}
.fw ul,.fw ol{margin:0;padding:0}
.fw input,.fw button{box-shadow:none;min-height:0;line-height:normal}
"""


def scope_selector(sel):
    out = []
    for part in sel.split(','):
        p = part.strip()
        if not p:
            continue
        if p in (':root', 'html', 'body'):
            out.append('.fw')
        elif p.startswith('body'):
            out.append('.fw' + p[4:])
        elif p == '*':
            out.append('.fw,.fw *')
        else:
            out.append('.fw ' + p)
    return ','.join(out)


def scope_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    res, i = [], 0
    while i < len(css):
        j = css.find('{', i)
        if j < 0:
            break
        head = css[i:j].strip()
        depth, k = 1, j + 1
        while depth:
            depth += {'{': 1, '}': -1}.get(css[k], 0)
            k += 1
        body = css[j + 1:k - 1]
        if head.startswith('@media') or head.startswith('@supports'):
            res.append(head + '{' + scope_css(body) + '}')
        elif head.startswith('@font-face') or head.startswith('@keyframes'):
            res.append(head + '{' + body + '}')
        else:
            sc = scope_selector(head)
            if 'scroll-behavior' in body and sc == '.fw':
                body = body.replace('scroll-behavior:smooth', '').replace('scroll-behavior:auto', '')
            res.append(sc + '{' + body + '}')
        i = k
    return '\n'.join(res)


def absolutize(html):
    html = re.sub(r'(src|href)="(img/|event\.ics|style\.css|form\.js)', lambda m: f'{m.group(1)}="{BASE}{m.group(2)}', html)
    return html


def body_of(html):
    return re.search(r'<body[^>]*>(.*)</body>', html, re.S).group(1)


# 1. wp.css: העיצוב הראשי והעיצוב של עמוד התודה, תחומים
style = (ROOT / 'style.css').read_text(encoding='utf-8')
ty = (ROOT / 'thank-you.html').read_text(encoding='utf-8')
ty_style = re.search(r'<style>(.*?)</style>', ty, re.S).group(1)
(ROOT / 'wp.css').write_text('/* נוצר אוטומטית מ־style.css על ידי wordpress/build.py */\n' + RESET + scope_css(style) + '\n' + scope_css(ty_style) + '\n', encoding='utf-8')

head = (f'<link rel="preload" href="{BASE}fonts/heebo-hebrew-800-normal.woff2" as="font" type="font/woff2" crossorigin>\n'
        f'<link rel="stylesheet" href="{BASE}wp.css">\n')

# 2. דף הנחיתה
idx = (ROOT / 'index.html').read_text(encoding='utf-8')
b = absolutize(body_of(idx))
b = re.sub(r'<noscript>.*?</noscript>\s*', '', b, flags=re.S)
b = b.replace(f'<script src="{BASE}form.js"></script>',
              f'<script>window.WEBINAR_ENDPOINT="{ENDPOINT}";window.WEBINAR_THANK_YOU="{THANK_YOU}";</script>\n<script src="{BASE}form.js"></script>')
(HERE / 'landing-snippet.html').write_text(
    '<!-- דף נחיתה: להשפיע בענק על העולם. נוצר אוטומטית על ידי build.py. הפיקסל של מטא כבר נטען באתר. -->\n'
    + head + '<div class="fw">\n' + b.strip() + '\n</div>\n', encoding='utf-8')

# 3. עמוד התודה, עם אירועי ההמרה (פיקסל מטא ו־Google Ads; שני התגים כבר נטענים באתר)
tb = absolutize(body_of(ty))
tb = re.sub(r'<noscript>.*?</noscript>\s*', '', tb, flags=re.S)
tb = re.sub(r'<script>\s*// המרה של Google Ads.*?</script>\s*', '', tb, flags=re.S)
tb = re.sub(r'<script>\s*try\{var n=sessionStorage.*?</script>', '', tb, flags=re.S)
lead = """<script>
(function(){try{var n=sessionStorage.getItem('reg_name');if(n){document.getElementById('hi').textContent=n;}}catch(_){}
var done=false;function lead(){if(done)return;if(window.fbq){done=true;fbq('track','Lead',{content_name:'webinar-27-12'});}}
lead();window.addEventListener('load',lead);setTimeout(lead,2500);
// המרה של Google Ads: להכניס כאן את תווית ההמרה (Conversion label)
var GADS_CONVERSION_LABEL='';
function gads(){if(GADS_CONVERSION_LABEL&&window.gtag){gtag('event','conversion',{send_to:'AW-480132115/'+GADS_CONVERSION_LABEL});return true;}}
if(!gads())window.addEventListener('load',gads);})();
</script>"""
(HERE / 'thank-you-snippet.html').write_text(
    '<!-- עמוד תודה לוובינר. נוצר אוטומטית על ידי build.py -->\n'
    + head + '<div class="fw"><div class="dark" style="min-height:100vh">\n' + tb.strip() + '\n</div></div>\n' + lead + '\n', encoding='utf-8')

print('ok', len((ROOT / 'wp.css').read_text(encoding='utf-8')), 'bytes css')
