import os
import re

html_path = 'index.html'
out_html_path = 'index_clean.html'
css_path = 'styles/main.css'
js_path = 'scripts/main.js'

os.makedirs('styles', exist_ok=True)
os.makedirs('scripts', exist_ok=True)

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract Styles
# Find all <style>...</style> blocks
style_pattern = re.compile(r'<style[^>]*>(.*?)</style>', re.DOTALL | re.IGNORECASE)
styles = style_pattern.findall(content)

with open(css_path, 'w', encoding='utf-8') as f:
    for s in styles:
        f.write(s + '\n')

# Replace the first style block with the link tag, remove the rest
first_style = True
def style_repl(match):
    global first_style
    if first_style:
        first_style = False
        return '<link rel="stylesheet" href="styles/main.css">'
    return ''

content = style_pattern.sub(style_repl, content)

# 2. Extract Scripts (only inline ones, without src=)
# Match <script> tags that DO NOT have a src attribute
script_pattern = re.compile(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', re.DOTALL | re.IGNORECASE)
scripts = script_pattern.findall(content)

with open(js_path, 'w', encoding='utf-8') as f:
    for s in scripts:
        f.write(s + '\n')

# Remove inline scripts
content = script_pattern.sub('', content)

# Insert the main.js script tag before </body>
script_tag = '\n<script src="scripts/main.js"></script>\n</body>'
content = re.sub(r'</body>', script_tag, content, flags=re.IGNORECASE)

with open(out_html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Extraction complete! CSS size: {os.path.getsize(css_path)}, JS size: {os.path.getsize(js_path)}, Clean HTML size: {os.path.getsize(out_html_path)}")
