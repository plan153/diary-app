#!/bin/bash
# ================================================================
#  Diary App — GitHub Pages 직접 배포 (workflow 권한 불필요)
# ================================================================

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   📓 Diary App — GitHub Pages 배포       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── [1/5] 요구사항 확인 ─────────────────────────────────────
echo "[1/5] 요구사항 확인 중..."
MISSING=0
command -v node   >/dev/null 2>&1 && echo "  ✅ Node.js $(node -v)" || { echo "  ❌ Node.js → https://nodejs.org"; MISSING=1; }
command -v git    >/dev/null 2>&1 && echo "  ✅ Git 있음"            || { echo "  ❌ Git 없음"; MISSING=1; }
command -v curl   >/dev/null 2>&1 && echo "  ✅ curl 있음"           || { echo "  ❌ curl 없음"; MISSING=1; }
command -v python3>/dev/null 2>&1 && echo "  ✅ Python3 있음"        || { echo "  ❌ Python3 없음"; MISSING=1; }
[ $MISSING -eq 1 ] && echo "" && echo "위 항목 설치 후 다시 실행하세요." && exit 1

# ── [2/5] 정보 입력 ─────────────────────────────────────────
echo ""
echo "[2/5] GitHub 정보 입력"
echo ""
echo "  💡 Token 필요 권한: repo 만 체크하면 됩니다"
echo "     github.com/settings/tokens/new"
echo "     → Generate new token (classic)"
echo "     → ✅ repo 체크 (workflow 불필요)"
echo ""
read -p "  👤 GitHub 사용자명: " GH_USER
[ -z "$GH_USER" ] && echo "사용자명 필요" && exit 1

read -s -p "  🔑 GitHub Token (ghp_...): " GH_TOKEN
echo ""
[ -z "$GH_TOKEN" ] && echo "토큰 필요" && exit 1
GH_TOKEN=$(echo "$GH_TOKEN" | tr -d '[:space:]')

read -p "  📁 레포지토리 이름 (기본: diary-app): " REPO_NAME
REPO_NAME=${REPO_NAME:-diary-app}

# ── 토큰 확인 ───────────────────────────────────────────────
echo ""
echo "  → 토큰 확인 중..."
HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: token $GH_TOKEN" \
  "https://api.github.com/user")
if [ "$HTTP" = "401" ]; then
  echo ""
  echo "  ❌ 토큰 인증 실패 — 토큰을 새로 발급해주세요"
  echo "  👉 github.com/settings/tokens/new"
  echo "     → Generate new token (classic)"
  echo "     → ✅ repo 체크 → Generate → 복사"
  echo ""
  exit 1
fi
echo "  ✅ 토큰 인증 성공"

# ── [3/5] 레포지토리 생성 ───────────────────────────────────
echo ""
echo "[3/5] 🗂  GitHub 레포지토리 생성 중..."

HTTP=$(curl -s -o /tmp/gh_resp.json -w "%{http_code}" \
  -X POST "https://api.github.com/user/repos" \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"AI Diary App\",\"private\":false,\"auto_init\":false}")

if   [ "$HTTP" = "201" ]; then
  URL=$(python3 -c "import json; print(json.load(open('/tmp/gh_resp.json'))['html_url'])")
  echo "  ✅ 레포지토리 생성: $URL"
elif [ "$HTTP" = "422" ]; then
  echo "  ⚠️  이미 존재 → 계속 진행"
else
  MSG=$(python3 -c "import json; print(json.load(open('/tmp/gh_resp.json')).get('message','오류'))" 2>/dev/null)
  echo "  ❌ 실패 (HTTP $HTTP): $MSG"
  exit 1
fi

# ── [4/5] 빌드 ──────────────────────────────────────────────
echo ""
echo "[4/5] 📦 의존성 설치 & 빌드 중..."

# .github 폴더 없이 진행 (workflow 권한 불필요)
rm -rf .github

npm install --silent
npm run build --silent && echo "  ✅ 빌드 완료 → dist/ 폴더 생성" || { echo "  ❌ 빌드 실패"; exit 1; }

# ── [5/5] gh-pages 브랜치로 배포 ────────────────────────────
echo ""
echo "[5/5] 🚀 GitHub Pages에 배포 중..."

REMOTE="https://$GH_TOKEN@github.com/$GH_USER/$REPO_NAME.git"

# 소스 코드를 main으로 push
echo "  → 소스 코드 업로드 (main 브랜치)..."
git init 2>/dev/null
git checkout -b main 2>/dev/null || git branch -M main 2>/dev/null
git config user.email "$GH_USER@users.noreply.github.com"
git config user.name "$GH_USER"
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE"
git add .
git commit -m "📦 Diary App source" --quiet 2>/dev/null
git push origin main --force --quiet && echo "  ✅ 소스 코드 업로드 완료"

# dist/ 폴더를 gh-pages 브랜치로 push
echo "  → 빌드 결과물 배포 (gh-pages 브랜치)..."
cd dist
git init 2>/dev/null
git checkout -b gh-pages 2>/dev/null || git branch -M gh-pages 2>/dev/null
git config user.email "$GH_USER@users.noreply.github.com"
git config user.name "$GH_USER"
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE"
git add .
git commit -m "🚀 Deploy to GitHub Pages" --quiet 2>/dev/null
git push origin gh-pages --force --quiet && echo "  ✅ 배포 완료" || { echo "  ❌ 배포 실패"; exit 1; }
cd ..

# GitHub Pages 소스를 gh-pages 브랜치로 설정
echo "  → GitHub Pages 설정 중..."
curl -s -o /dev/null -X POST \
  "https://api.github.com/repos/$GH_USER/$REPO_NAME/pages" \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}'

# 이미 있으면 PUT으로 업데이트
curl -s -o /dev/null -X PUT \
  "https://api.github.com/repos/$GH_USER/$REPO_NAME/pages" \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}'

# ── 완료 ────────────────────────────────────────────────────
echo ""
echo "╔═════════════════════════════════════════════════════╗"
echo "║  ✅ 배포 완료!                                      ║"
echo "╠═════════════════════════════════════════════════════╣"
echo "║  📦 소스  : github.com/$GH_USER/$REPO_NAME"
echo "║  🌐 웹앱  : https://$GH_USER.github.io/$REPO_NAME"
echo "║                                                     ║"
echo "║  ⏱  GitHub Pages 활성화: 약 1-2분 소요             ║"
echo "║                                                     ║"
echo "║  🔑 앱 실행 시 Anthropic API Key 입력 필요          ║"
echo "║     → console.anthropic.com/keys 에서 발급         ║"
echo "╚═════════════════════════════════════════════════════╝"
echo ""
