# 성경 해석 노트 사이트 (Quartz)

옵시디언 볼트(`C:/Temp/coding_test/BIBLE`)를 정적 사이트로 만듭니다.

```bash
node build-site.mjs           # 볼트 동기화 + 카테고리 목차 생성 + 빌드 -> public/
node build-site.mjs --serve   # 위 작업 후 http://localhost:8080 에서 미리보기
```

- 볼트 위치를 바꾸려면 환경변수 `BIBLE_VAULT`를 지정합니다.
- `content/`는 빌드할 때마다 볼트에서 새로 복사되므로 직접 수정하지 마세요.
- 배포 시 `quartz.config.ts`의 `baseUrl`을 실제 도메인으로 바꾸세요.
- 카테고리 설명은 `build-site.mjs`의 `DESCRIPTIONS`에서 고칩니다.
