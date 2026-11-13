# md 문서 3종(매뉴얼·비교분석·채점표)을 Word로 변환하고 전체 묶음 zip을 만든다. 사용: python3 tools/build_docs.py .
import re,sys,os,zipfile
from docx import Document
from docx.shared import Pt
ROOT=sys.argv[1] if len(sys.argv)>1 else '.'
def md_to_docx(src,dst,title):
    doc=Document(); st=doc.styles['Normal']; st.font.name='Malgun Gothic'; st.font.size=Pt(10.5)
    doc.add_heading(title,0)
    lines=open(os.path.join(ROOT,src),encoding='utf-8').read().split('\n'); i=0
    while i<len(lines):
        l=lines[i]
        if l.startswith('|') and i+1<len(lines) and lines[i+1].startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].startswith('|'):
                cells=[x.strip() for x in lines[i].strip('|').split('|')]
                if not all(set(x)<=set('-: ') for x in cells): rows.append(cells)
                i+=1
            if rows:
                t=doc.add_table(rows=len(rows),cols=max(len(r) for r in rows)); t.style='Table Grid'
                for r,row in enumerate(rows):
                    for k,cell in enumerate(row): t.cell(r,k).text=re.sub(r'\*\*','',cell)
            continue
        if l.startswith('#'): doc.add_heading(l.lstrip('#').strip(),min(len(l)-len(l.lstrip('#')),3))
        elif l.startswith('> '): doc.add_paragraph(re.sub(r'\*\*','',l[2:]),style='Intense Quote')
        elif l.startswith('- ') or re.match(r'^\d+\. ',l): doc.add_paragraph(re.sub(r'\*\*|`','',re.sub(r'^(- |\d+\. )','',l)),style='List Bullet')
        elif l.strip() and l.strip()!='---': doc.add_paragraph(re.sub(r'\*\*|`','',l))
        i+=1
    doc.save(os.path.join(ROOT,dst))
md_to_docx('CLAUDE.md','노인의시대_집필매뉴얼_설정바이블.docx','『노인의 시대』 집필 매뉴얼 및 설정 바이블')
md_to_docx('노인의시대_감독원고_vs_소설초고_비교분석.md','노인의시대_감독원고_vs_소설초고_비교분석.docx','감독 원고 vs 소설 초고 비교 분석')
md_to_docx('노인의시대_결말_혈연반전_시뮬레이션_및_채점.md','노인의시대_채점표_및_검토기록.docx','채점표 및 검토 기록')
names=['노인의시대_장편소설_초고_완본.docx','노인의시대_공연낭독대본_4선.docx','노인의시대_감독원고_vs_소설초고_비교분석.docx','노인의시대_감독원고_vs_소설초고_비교분석.md','노인의시대_집필매뉴얼_설정바이블.docx','CLAUDE.md','노인의시대_채점표_및_검토기록.docx','노인의시대_결말_혈연반전_시뮬레이션_및_채점.md','노시_트리트먼트_24p.pdf']
with zipfile.ZipFile(os.path.join(ROOT,'노인의시대_전체파일.zip'),'w',zipfile.ZIP_DEFLATED) as z:
    for n in names:
        if os.path.exists(os.path.join(ROOT,n)): z.write(os.path.join(ROOT,n),n)
    for d in ['chapters','tools']:
        for b,_,fs in os.walk(os.path.join(ROOT,d)):
            for f in fs:
                p=os.path.join(b,f); z.write(p,os.path.relpath(p,ROOT))
print('docs and zip ok')
