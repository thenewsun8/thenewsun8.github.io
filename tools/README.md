# 원고 도구

감독의 육성 퇴고 뒤에 아래 순서로 실행하면 글자수 검수와 docx가 다시 만들어진다. (python-docx 필요: `pip install python-docx`)

```
python3 tools/count.py                # 챕터별 글자수(하한 5,300 / 상한 6,800) 검수
python3 tools/build_docx.py .         # chapters/*.docx + 노인의시대_장편소설_초고_완본.docx
python3 tools/build_script.py .       # 노인의시대_공연낭독대본_4선.docx (1·7·16·19장에서 발췌)
```

채점표와 지적 내역은 `노인의시대_결말_혈연반전_시뮬레이션_및_채점.md`, 설정 바이블은 `CLAUDE.md`.
