import sys, os, re, glob
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml.ns import qn

ROOT = sys.argv[1]
CH = os.path.join(ROOT, 'chapters')
KFONT = '맑은 고딕'

def set_font(run, size=11, bold=False, italic=False, color=None):
    run.font.name = 'Malgun Gothic'
    run._element.rPr.rFonts.set(qn('w:eastAsia'), KFONT)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    if color: run.font.color.rgb = RGBColor(*color)

def new_doc():
    d = Document()
    st = d.styles['Normal']
    st.font.name = 'Malgun Gothic'
    st.element.rPr.rFonts.set(qn('w:eastAsia'), KFONT)
    st.font.size = Pt(11)
    for s in d.sections:
        s.top_margin = Cm(2.5); s.bottom_margin = Cm(2.5)
        s.left_margin = Cm(2.5); s.right_margin = Cm(2.5)
    return d

def add_par(d, text, size=11, bold=False, italic=False, align=None, indent=True, space_after=6, color=None):
    p = d.add_paragraph()
    if align: p.alignment = align
    pf = p.paragraph_format
    pf.space_after = Pt(space_after)
    pf.line_spacing = 1.6
    if indent and not align: pf.first_line_indent = Cm(0.5)
    r = p.add_run(text)
    set_font(r, size, bold, italic, color)
    return p

def parse_md(path):
    lines = open(path, encoding='utf-8').read().splitlines()
    title = ''; subtitle = ''; body = []
    for ln in lines:
        if ln.startswith('# '):
            title = ln[2:].strip()
        elif ln.startswith('*') and ln.endswith('*') and not subtitle and ln != '* * *':
            subtitle = ln.strip('*').strip()
        else:
            body.append(ln)
    paras = []
    buf = []
    for ln in body:
        if ln.strip() == '':
            if buf: paras.append(' '.join(buf)); buf = []
        else:
            buf.append(ln.strip())
    if buf: paras.append(' '.join(buf))
    return title, subtitle, paras

def render_chapter(d, title, subtitle, paras, heading_size=18):
    add_par(d, title, size=heading_size, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=4)
    if subtitle:
        add_par(d, subtitle, size=10, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=18, color=(90,90,90))
    for ptxt in paras:
        if ptxt == '* * *':
            add_par(d, '* * *', align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=12)
        elif ptxt.startswith('*') and ptxt.endswith('*'):
            add_par(d, ptxt.strip('*'), italic=True, indent=False)
        elif ptxt.startswith('—') or ptxt.startswith('- 끝'):
            add_par(d, ptxt, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
        else:
            add_par(d, ptxt)

files = sorted(glob.glob(os.path.join(CH, '*.md')))
chapters = []
for f in files:
    title, subtitle, paras = parse_md(f)
    chapters.append((f, title, subtitle, paras))
    d = new_doc()
    render_chapter(d, title, subtitle, paras)
    out = f[:-3] + '.docx'
    d.save(out)
    print('wrote', os.path.basename(out))

# ---- Combined book ----
d = new_doc()
for _ in range(6): d.add_paragraph()
add_par(d, '노인의 시대', size=32, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=10)
add_par(d, '장편소설 · 초고 완본', size=14, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=6)
add_par(d, '원작 트리트먼트 · 안상욱', size=12, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=6)
add_par(d, '프롤로그 + 제1장~제18장 + 에필로그 (전 20장)', size=11, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=6, color=(90,90,90))
total = sum(len("\n".join(p for p in c[3])) for c in chapters)
add_par(d, f'본문 약 {total:,}자 (공백 포함) · 200자 원고지 약 {round(total/200):,}매', size=10, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, color=(90,90,90))
d.add_page_break()

add_par(d, '서문', size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=18)
pre = [
 '영화 5부작은 그 세계의 카메라에 찍힌 5개의 기록 테이프이며, 이 소설은 카메라 밖에 존재했던 90년의 완전한 진실이다.',
 '카메라는 2060년 이후만을 찍었다. 카메라는 2024년 2월 29일 바이오리온 연구실의 하얀 복도를 찍지 못했고, 쓰레기 더미 위에서 죽은 여자의 목에 입을 대던 늙은 사내의 첫 번째 꿀꺽 소리를 찍지 못했고, 열 살 소녀의 등에 바늘로 새겨진 지도를 찍지 못했고, 38년 뒤 열 살의 몸으로 쇠파이프를 든 마흔 살 아들의 눈을 찍지 못했다. 이 책은 그 찍히지 않은 것들의 기록이다.',
 '영화 속에서 안나의 피는 "빼앗은 피는 독이 되고 내어준 피는 약이 된다"는 한 문장의 절제된 기록으로 남는다. 이 책에서 안나는 자기 목을 내밀며 말한다. "단테, 제발 나를, 날 잡아먹어." 두 매체는 같은 순간을 다르게 본다. 둘 다 진실이다. 사람은 둘 다다. 언제나.',
 '원작 트리트먼트에서 아버지 아틀라스는 두 번 죽는다. 이 책에서 그는 세 번 무릎을 꿇고 한 번 죽는다. 그 한 번이 2075년 분노의 마을 옥타곤이다. 2070년 처형장의 폭탄은 가슴 두 개만큼만 터졌고, 가슴이 열린 채 숨이 붙어 있던 사내는 닥터 K의 메스 아래로 보내졌다. 그 5년이 이 책이 트리트먼트에 더한 가장 큰 어둠이다.',
 '독자는 이 책을 읽은 뒤 영화관에서 다섯 개의 테이프를 볼 것이고, 관객은 다섯 개의 테이프를 본 뒤 이 책에서 카메라가 비추지 않은 자리를 찾을 것이다. 그 자리에서 두 사람이 만나기를 바란다.',
]
for s in pre: add_par(d, s)
d.add_page_break()

add_par(d, '차례', size=18, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False, space_after=18)
acts = {0:'', 1:'제1막 — 핏빛 세례, 늙은 포식자의 탄생 (起)', 5:'제2막 — 일곱 개의 원(地獄), 그리고 사냥당하는 청춘 (承)', 10:'제3막 — 핏빛 콜로세움과 일그러진 진실 (轉)', 15:'제4막 — 영생의 피, 그리고 무너지는 지옥 (結)'}
for i, (f, title, sub, paras) in enumerate(chapters):
    if i in acts and acts[i]:
        add_par(d, acts[i], size=11, bold=True, indent=False, space_after=2, color=(120,30,30))
    add_par(d, title, size=11, indent=False, space_after=2)
d.add_page_break()

for i, (f, title, sub, paras) in enumerate(chapters):
    if i in acts and acts[i]:
        for _ in range(8): d.add_paragraph()
        add_par(d, acts[i], size=20, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
        d.add_page_break()
    render_chapter(d, title, sub, paras)
    if i < len(chapters)-1: d.add_page_break()
d.save(os.path.join(ROOT, '노인의시대_장편소설_초고_완본.docx'))
print('wrote 노인의시대_장편소설_초고_완본.docx', total)
