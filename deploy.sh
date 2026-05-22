#!/bin/bash

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Diary App — GitHub 자동 배포       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check requirements
command -v node >/dev/null 2>&1 || { echo "❌ Node.js가 필요합니다: https://nodejs.org"; exit 1; }
command -v git >/dev/null 2>&1  || { echo "❌ Git이 필요합니다"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "❌ curl이 필요합니다"; exit 1; }

# Get user info
read -p "📌 GitHub 사용자명 (username): " GH_USER
read -p "🔑 GitHub Personal Access Token: " GH_TOKEN
read -p "📁 레포지토리 이름 (기본: diary-app): " REPO_NAME
REPO_NAME=${REPO_NAME:-diary-app}

echo ""
echo "⏳ 1/5  GitHub 레포지토리 생성 중..."
RESPONSE=$(curl -s -X POST "https://api.github.com/user/repos" \
  -H "Authorization: token $GH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"AI Diary App - ECHO DAYLY MEMOIR\",\"private\":false,\"auto_init\":false}")

if echo "$RESPONSE" | grep -q '"full_name"'; then
  echo "   ✅ 레포지토리 생성: github.com/$GH_USER/$REPO_NAME"
else
  echo "   ⚠️  레포지토리가 이미 있거나 오류. 계속 진행..."
fi

echo "⏳ 2/5  의존성 설치 중..."
npm install --silent

echo "⏳ 3/5  빌드 중..."
npm run build --silent
echo "   ✅ 빌드 완료"

echo "⏳ 4/5  Git 설정 & 커밋..."
git init -b main 2>/dev/null || git init && git checkout -b main 2>/dev/null
git config user.email "$GH_USER@users.noreply.github.com"
git config user.name "$GH_USER"
git remote remove origin 2>/dev/null
git remote add origin "https://$GH_TOKEN@github.com/$GH_USER/$REPO_NAME.git"
git add .
git commit -m "🚀 Initial deploy: Diary App Phase 5" --quiet

echo "⏳ 5/5  GitHub에 푸시 중..."
git push -u origin main --force --quiet && echo "   ✅ 푸시 완료"

echo ""
echo "⏳ GitHub Pages 활성화 중..."
curl -s -X POST "https://api.github.com/repos/$GH_USER/$REPO_NAME/pages" \
  -H "Authorization: token $GH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}' > /dev/null 2>&1

# Enable Pages via API (workflow approach)
curl -s -X PUT "https://api.github.com/repos/$GH_USER/$REPO_NAME/actions/permissions" \
  -H "Authorization: token $GH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"allowed_actions":"all"}' > /dev/null 2>&1

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ 배포 완료!                                   ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  📦 GitHub: github.com/$GH_USER/$REPO_NAME"
echo "║  🌐 웹사이트: $GH_USER.github.io/$REPO_NAME"
echo "║                                                  ║"
echo "║  ⏱  GitHub Actions 빌드 완료까지 2-3분 소요     ║"
echo "║  👉 Actions 탭에서 진행상황 확인 가능            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
