// 원본 옵시디언 볼트를 이 저장소의 vault/ 로 복사한다 (푸시 전에 실행)
import fs from 'fs'

const SRC = process.env.BIBLE_SRC ?? 'C:/Temp/coding_test/BIBLE'
fs.rmSync('vault', { recursive: true, force: true })
fs.cpSync(SRC, 'vault', {
  recursive: true,
  preserveTimestamps: true,
  filter: (p) => !/[\/]\.(obsidian|trash)([\/]|$)/.test(p),
})
console.log(`${SRC} -> vault/ 복사 완료`)
