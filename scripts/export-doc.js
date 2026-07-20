const fs = require('fs');
const path = require('path');

const mdPath = 'C:\\Users\\manh.nguyen\\.gemini\\antigravity-ide\\brain\\c40515b0-5037-4ca6-a593-28f751bd536d\\huong_dan_su_dung_admin.md';
const desktopPath = path.join(__dirname, '../huong_dan_su_dung_admin.doc');

function mdToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inCode = false;
  let inUl = false;
  let inOl = false;

  for (let line of lines) {
    // Code block
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html += '</code></pre>\n';
        inCode = false;
      } else {
        html += '<pre><code>';
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      html += line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
      continue;
    }

    // List close checks
    if (!line.trim().startsWith('*') && !line.trim().startsWith('-') && !/^\d+\./.test(line.trim())) {
      if (inUl) {
        html += '</ul>\n';
        inUl = false;
      }
      if (inOl) {
        html += '</ol>\n';
        inOl = false;
      }
    }

    // Horizontal rule
    if (line.trim() === '---') {
      html += '<hr />\n';
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      html += `<h1>${parseInline(line.substring(2))}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      html += `<h2>${parseInline(line.substring(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      html += `<h3>${parseInline(line.substring(4))}</h3>\n`;
      continue;
    }

    // Lists
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      if (!inUl) {
        html += '<ul>\n';
        inUl = true;
      }
      html += `<li>${parseInline(line.trim().substring(2))}</li>\n`;
      continue;
    }

    const olMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (!inOl) {
        html += '<ol>\n';
        inOl = true;
      }
      html += `<li>${parseInline(olMatch[2])}</li>\n`;
      continue;
    }

    // Paragraph
    if (line.trim() === '') {
      continue;
    }

    html += `<p>${parseInline(line)}</p>\n`;
  }

  if (inUl) html += '</ul>\n';
  if (inOl) html += '</ol>\n';

  return html;
}

function parseInline(text) {
  let res = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Strong
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Inline code
  res = res.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Links
  res = res.replace(/\[(.*?)\]\((.*?)\)/g, (match, label, url) => {
    if (url.startsWith('file:///')) {
      return label;
    }
    return `<a href="${url}">${label}</a>`;
  });

  return res;
}

try {
  const md = fs.readFileSync(mdPath, 'utf8');
  const bodyHtml = mdToHtml(md);
  
  const docHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>Hướng dẫn Sử dụng Admin - FreshFood</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; padding: 40px; color: #333333; }
h1 { color: #16a34a; font-size: 24pt; border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-top: 30px; font-weight: bold; }
h2 { color: #15803d; font-size: 18pt; margin-top: 25px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; font-weight: bold; }
h3 { color: #16a34a; font-size: 14pt; margin-top: 20px; font-weight: bold; }
p { font-size: 11pt; margin-bottom: 12px; text-align: justify; }
ul, ol { margin-left: 20px; margin-bottom: 12px; }
li { font-size: 11pt; margin-bottom: 6px; }
code { font-family: Consolas, monospace; background-color: #f3f4f6; padding: 2px 6px; font-size: 10pt; border-radius: 4px; color: #b91c1c; }
pre { background-color: #f3f4f6; padding: 15px; border-left: 4px solid #16a34a; font-family: Consolas, monospace; font-size: 10pt; border-radius: 4px; overflow-x: auto; margin: 15px 0; }
hr { border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0; }
a { color: #16a34a; text-decoration: none; font-weight: 500; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;

  fs.writeFileSync(desktopPath, docHtml, 'utf8');
  console.log('Successfully exported to Desktop!');
} catch (e) {
  console.error(e);
}
