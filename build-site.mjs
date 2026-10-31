// 옵시디언 볼트 → Quartz content 동기화, 카테고리 목차 생성, 빌드
// 사용법: node build-site.mjs [--serve]
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

const VAULT = path.resolve(process.env.BIBLE_VAULT ?? 'vault')
const CONTENT = path.resolve('content')

const DESCRIPTIONS = {
  '01 연대기·역법': '창조부터 신약까지의 연도 계산, 유대력과 바벨론력, 70년·70이레 예언의 계산을 모았습니다.',
  '02 절기·성막·제사': '일곱 절기와 안식일·안식년, 성막과 성전, 레위기의 제사와 정결 의식을 다룹니다.',
  '03 구약 본문·인물': '모세오경과 선지서, 욥기·에스더 등 구약의 책별 해설과 인물, 창세기 6장 논쟁을 정리했습니다.',
  '04 신약 본문·인물': '복음서와 로마서·히브리서, 신약 인물, 예수 탄생과 십자가 사건의 배경을 다룹니다.',
  '05 원어·핵심용어·상징': '히브리어·헬라어 낱말 연구와 속죄 관련 용어, 40·70 같은 숫자의 상징을 모았습니다.',
  '06 조직신학': '삼위일체, 성령, 죄와 원죄, 구원론, 하나님의 형상 등 교리 주제를 정리했습니다.',
  '07 종말론·예언·내세': '말세의 징조, 요한계시록과 다니엘서, 부활과 심판, 낙원·스올·게헨나, 예언의 성취 논쟁을 다룹니다.',
  '08 고대근동·고고학': '메소포타미아 신화와 성경의 비교, 성전 발굴, 사해사본, 바벨론·페르시아의 역사 배경을 모았습니다.',
  '09 정경·본문비평·역사적예수': '본문비평과 외경, Q 자료, 역사적 예수 연구와 비판학자들의 주장 및 변증을 정리했습니다.',
  '10 교회사·교파': '초대교회와 교부, 근본주의, 밀러주의와 재림교 등 교회사와 교파를 다룹니다.',
  '11 이스라엘·유대인·언약신학': '대체신학과 세대주의, 이스라엘 12지파, 유대인이 예수를 받아들이지 않은 이유와 반유대주의를 다룹니다.',
  '12 신앙과 과학·세계관·윤리': '빅뱅·양자역학·생명의 기원과 신앙, 세계관, 음주 같은 실천 문제를 다룹니다.',
  '99 미분류': '여러 주제가 섞여 있어 분할 후 재배치가 필요한 노트입니다.',
}

const q = (s) => `"${s.replace(/"/g, '\\"')}"`
const read = (p) => fs.readFileSync(p, 'utf8')
const write = (p, s) => fs.writeFileSync(p, s, 'utf8')

// 1. 볼트를 content로 복사 (.obsidian 제외, 기존 content 비움)
fs.rmSync(CONTENT, { recursive: true, force: true })
fs.mkdirSync(CONTENT, { recursive: true })
fs.cpSync(VAULT, CONTENT, {
  recursive: true,
  preserveTimestamps: true,
  filter: (src) => !/[\\/]\.obsidian([\\/]|$)/.test(src) && !/[\\/]\.trash([\\/]|$)/.test(src),
})

// 1-1. 히브리어가 든 수식($$..\text{히브리어}..$$)은 KaTeX에서 깨지므로 사본에서만 일반 텍스트로 바꾼다
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name)
    return e.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : []
  })
for (const f of walk(CONTENT)) {
  const src = read(f)
  const out = src.replace(/\$\$([^$\n]*?)\$\$/g, (m, inner) =>
    /[֐-׿]/.test(inner) ? inner.replace(/\\text\{([^}]*)\}/g, '$1') : m,
  )
  if (out !== src) write(f, out)
}

// 2. 카테고리별 목차 페이지
const dirs = fs
  .readdirSync(CONTENT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort((a, b) => a.localeCompare(b, 'ko'))

const listOf = (dir) =>
  fs
    .readdirSync(path.join(CONTENT, dir))
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .map((f) => f.replace(/\.md$/, ''))
    .sort((a, b) => a.localeCompare(b, 'ko'))

let total = 0
const homeRows = []
for (const dir of dirs) {
  const notes = listOf(dir)
  total += notes.length
  const label = dir.replace(/^\d+\s+/, '')
  const desc = DESCRIPTIONS[dir] ?? ''
  const body = [
    '---',
    `title: ${q(label)}`,
    `description: ${q(desc)}`,
    '---',
    '',
    desc,
    '',
    `총 **${notes.length}**개의 노트`,
    '',
    ...notes.map((n) => `- [[${n}]]`),
    '',
  ].join('\n')
  write(path.join(CONTENT, dir, 'index.md'), body)
  homeRows.push(`| [[${dir}/index\\|${label}]] | ${desc} | ${notes.length} |`)
}

// 3. 홈
write(
  path.join(CONTENT, 'index.md'),
  [
    '---',
    'title: "성경 해석 노트"',
    'description: "성경 해석에 관한 옵시디언 노트 모음"',
    '---',
    '',
    `성경 해석에 관한 노트 ${total}개를 주제별로 정리했습니다. 왼쪽 탐색기에서 카테고리를 고르거나, 검색창(\`Ctrl\`+\`K\`)으로 찾아보세요. 각 노트 아래의 **백링크**에서 서로 연결된 노트를 따라갈 수 있습니다.`,
    '',
    '## 카테고리',
    '',
    '| 카테고리 | 설명 | 노트 수 |',
    '| --- | --- | ---: |',
    ...homeRows,
    '',
  ].join('\n'),
)

console.log(`content 준비 완료: ${total}개 노트, ${dirs.length}개 카테고리`)

// 4. 빌드
const args = ['quartz/bootstrap-cli.mjs', 'build', ...(process.argv.includes('--serve') ? ['--serve'] : [])]
const r = spawnSync('node', args, { stdio: 'inherit' })
process.exit(r.status ?? 1)
