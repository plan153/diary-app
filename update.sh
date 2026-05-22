#!/bin/bash
# ================================================================
#  Diary App — 빠른 업데이트 (레포 이미 있을 때)
# ================================================================
echo ""
echo "╔══════════════════════════════════════╗"
echo "║   📓 Diary App 업데이트 배포         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 요구사항 확인
command -v node >/dev/null 2>&1 || { echo "❌ Node.js 필요"; exit 1; }
command -v git  >/dev/null 2>&1 || { echo "❌ Git 필요"; exit 1; }

# 저장된 설정 확인
SAVED_USER=$(git config --get user.name 2>/dev/null)
SAVED_REMOTE=$(git remote get-url origin 2>/dev/null)

echo "[1/3] 설정 확인"
if [ -n "$SAVED_REMOTE" ]; then
  echo "  ✅ 원격 저장소: $SAVED_REMOTE"
  GH_TOKEN=$(echo "$SAVED_REMOTE" | sed 's|https://||' | cut -d'@' -f1)
  REPO_PATH=$(echo "$SAVED_REMOTE" | sed 's|.*github.com/||' | sed 's|\.git||')
  GH_USER=$(echo "$REPO_PATH" | cut -d'/' -f1)
  REPO_NAME=$(echo "$REPO_PATH" | cut -d'/' -f2)
else
  echo ""
  echo "  처음 실행이면 setup.sh를 먼저 실행하세요."
  echo "  또는 아래 정보를 입력하세요:"
  read -p "  👤 GitHub 사용자명: " GH_USER
  read -s -p "  🔑 GitHub Token: " GH_TOKEN; echo ""
  read -p "  📁 레포 이름 (기본: diary-app): " REPO_NAME
  REPO_NAME=${REPO_NAME:-diary-app}
fi

echo ""
echo "[2/3] 📦 빌드 중..."
npm install --silent
npm run build --silent && echo "  ✅ 빌드 완료" || { echo "❌ 빌드 실패"; exit 1; }

echo ""
echo "[3/3] 🚀 배포 중 (gh-pages 브랜치)..."
REMOTE="https://$GH_TOKEN@github.com/$GH_USER/$REPO_NAME.git"

cd dist
git init 2>/dev/null
git checkout -b gh-pages 2>/dev/null || git branch -M gh-pages 2>/dev/null
git config user.email "$GH_USER@users.noreply.github.com"
git config user.name "$GH_USER"
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE"
git add .
git commit -m "🔄 Update $(date '+%Y-%m-%d %H:%M')" --quiet
git push origin gh-pages --force --quiet \
  && echo "  ✅ 배포 완료!" \
  || { echo "  ❌ 푸시 실패. 토큰을 확인해주세요."; exit 1; }
cd ..

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  🌐 https://$GH_USER.github.io/$REPO_NAME"
echo "║  ⏱  30초~1분 후 반영됩니다                  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
