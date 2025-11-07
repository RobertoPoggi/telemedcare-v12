#!/bin/bash

# 🚀 TeleMedCare V11 - Git Helper Script
# Script helper per semplificare operazioni Git comuni

set -e

REPO_DIR="/home/user/webapp"
MAIN_BRANCH="main"
DEV_BRANCH="genspark_ai_developer"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Ensure we're in the right directory
cd "$REPO_DIR" || {
    print_error "Cannot access $REPO_DIR"
    exit 1
}

# Main menu
show_menu() {
    echo ""
    echo "================================="
    echo "  TeleMedCare V11 - Git Helper"
    echo "================================="
    echo ""
    echo "1)  📊 Status - Vedi stato repository"
    echo "2)  🔄 Sync - Sincronizza con GitHub"
    echo "3)  📥 Pull - Scarica ultime modifiche"
    echo "4)  💾 Commit - Salva modifiche"
    echo "5)  📤 Push - Invia modifiche a GitHub"
    echo "6)  🌿 Branch - Gestione branch"
    echo "7)  🔀 PR Workflow - Prepara Pull Request"
    echo "8)  🧪 Test - Esegui test prima di commit"
    echo "9)  📜 Log - Vedi storico commit"
    echo "10) 🆘 Help - Mostra aiuto"
    echo "0)  ❌ Exit"
    echo ""
    read -p "Scegli opzione (0-10): " choice
    echo ""
    
    case $choice in
        1) git_status ;;
        2) git_sync ;;
        3) git_pull ;;
        4) git_commit ;;
        5) git_push ;;
        6) git_branch_menu ;;
        7) pr_workflow ;;
        8) run_tests ;;
        9) git_log ;;
        10) show_help ;;
        0) exit 0 ;;
        *) print_error "Opzione non valida"; show_menu ;;
    esac
}

# 1. Git Status
git_status() {
    print_info "Controllo stato repository..."
    echo ""
    
    git status
    
    echo ""
    print_info "Branch attuale: $(git branch --show-current)"
    print_info "Ultimo commit: $(git log -1 --oneline)"
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 2. Git Sync
git_sync() {
    print_info "Sincronizzazione con GitHub..."
    
    git fetch origin
    
    CURRENT_BRANCH=$(git branch --show-current)
    BEHIND=$(git rev-list --count HEAD..origin/$CURRENT_BRANCH 2>/dev/null || echo "0")
    AHEAD=$(git rev-list --count origin/$CURRENT_BRANCH..HEAD 2>/dev/null || echo "0")
    
    echo ""
    if [ "$BEHIND" -gt 0 ]; then
        print_warning "Sei $BEHIND commit indietro rispetto a origin/$CURRENT_BRANCH"
        read -p "Vuoi fare pull? (y/n): " do_pull
        if [ "$do_pull" = "y" ]; then
            git pull origin "$CURRENT_BRANCH"
            print_success "Pull completato!"
        fi
    else
        print_success "Sei aggiornato con origin/$CURRENT_BRANCH"
    fi
    
    if [ "$AHEAD" -gt 0 ]; then
        print_warning "Hai $AHEAD commit non pushati"
    fi
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 3. Git Pull
git_pull() {
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Pull da origin/$CURRENT_BRANCH..."
    
    if git diff-index --quiet HEAD --; then
        git pull origin "$CURRENT_BRANCH"
        print_success "Pull completato!"
    else
        print_warning "Hai modifiche non committate"
        read -p "Vuoi fare stash delle modifiche e poi pull? (y/n): " do_stash
        if [ "$do_stash" = "y" ]; then
            git stash
            git pull origin "$CURRENT_BRANCH"
            git stash pop
            print_success "Pull completato e modifiche ripristinate!"
        fi
    fi
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 4. Git Commit
git_commit() {
    print_info "Preparazione commit..."
    echo ""
    
    # Show changed files
    git status --short
    
    echo ""
    read -p "Vuoi committare tutte le modifiche? (y/n): " commit_all
    
    if [ "$commit_all" = "y" ]; then
        git add .
        
        echo ""
        echo "Tipo di commit:"
        echo "1) feat     - Nuova feature"
        echo "2) fix      - Bug fix"
        echo "3) docs     - Documentazione"
        echo "4) refactor - Refactoring"
        echo "5) test     - Test"
        echo "6) chore    - Maintenance"
        read -p "Scegli tipo (1-6): " commit_type
        
        case $commit_type in
            1) TYPE="feat" ;;
            2) TYPE="fix" ;;
            3) TYPE="docs" ;;
            4) TYPE="refactor" ;;
            5) TYPE="test" ;;
            6) TYPE="chore" ;;
            *) TYPE="chore" ;;
        esac
        
        echo ""
        read -p "Descrizione commit: " commit_msg
        
        if [ -n "$commit_msg" ]; then
            git commit -m "$TYPE: $commit_msg"
            print_success "Commit creato!"
            
            read -p "Vuoi pushare subito? (y/n): " do_push
            if [ "$do_push" = "y" ]; then
                git_push
                return
            fi
        else
            print_error "Descrizione vuota, commit annullato"
        fi
    fi
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 5. Git Push
git_push() {
    CURRENT_BRANCH=$(git branch --show-current)
    print_info "Push a origin/$CURRENT_BRANCH..."
    
    # Check if there are commits to push
    AHEAD=$(git rev-list --count origin/$CURRENT_BRANCH..HEAD 2>/dev/null || echo "0")
    
    if [ "$AHEAD" -eq 0 ]; then
        print_warning "Nessun commit da pushare"
    else
        print_info "Pushing $AHEAD commit..."
        
        if git push origin "$CURRENT_BRANCH"; then
            print_success "Push completato!"
        else
            print_warning "Push fallito. Vuoi fare push forzato? (y/n)"
            read -p "> " force_push
            if [ "$force_push" = "y" ]; then
                git push -f origin "$CURRENT_BRANCH"
                print_success "Push forzato completato!"
            fi
        fi
    fi
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 6. Git Branch Menu
git_branch_menu() {
    echo "================================="
    echo "  Gestione Branch"
    echo "================================="
    echo ""
    echo "Branch disponibili:"
    git branch -a
    echo ""
    echo "Branch attuale: $(git branch --show-current)"
    echo ""
    echo "1) Switch a main"
    echo "2) Switch a genspark_ai_developer"
    echo "3) Crea nuovo branch"
    echo "4) Elimina branch locale"
    echo "0) Torna indietro"
    echo ""
    read -p "Scegli opzione: " branch_choice
    
    case $branch_choice in
        1) git checkout main; print_success "Switched to main" ;;
        2) git checkout genspark_ai_developer; print_success "Switched to genspark_ai_developer" ;;
        3) 
            read -p "Nome nuovo branch: " new_branch
            if [ -n "$new_branch" ]; then
                git checkout -b "$new_branch"
                print_success "Branch $new_branch creato!"
            fi
            ;;
        4)
            read -p "Nome branch da eliminare: " del_branch
            if [ -n "$del_branch" ]; then
                git branch -d "$del_branch"
                print_success "Branch eliminato!"
            fi
            ;;
        0) show_menu; return ;;
    esac
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 7. PR Workflow
pr_workflow() {
    print_info "Preparazione Pull Request..."
    echo ""
    
    CURRENT_BRANCH=$(git branch --show-current)
    
    if [ "$CURRENT_BRANCH" = "main" ]; then
        print_error "Non puoi creare PR dal branch main"
        read -p "Premi ENTER per continuare..."
        show_menu
        return
    fi
    
    echo "Step 1: Fetch latest changes..."
    git fetch origin main
    
    echo ""
    echo "Step 2: Rebase on main..."
    read -p "Vuoi fare rebase su main? (y/n): " do_rebase
    
    if [ "$do_rebase" = "y" ]; then
        if git rebase origin/main; then
            print_success "Rebase completato!"
        else
            print_error "Conflitti durante rebase. Risolvi manualmente con:"
            echo "  1. git status (vedi file in conflitto)"
            echo "  2. Edita i file e risolvi conflitti"
            echo "  3. git add <file-risolti>"
            echo "  4. git rebase --continue"
            read -p "Premi ENTER per continuare..."
            show_menu
            return
        fi
    fi
    
    echo ""
    echo "Step 3: Squash commits..."
    read -p "Quanti commit vuoi combinare? (default: tutti): " num_commits
    
    if [ -n "$num_commits" ] && [ "$num_commits" -gt 1 ]; then
        print_info "Squashing $num_commits commits..."
        git reset --soft HEAD~"$num_commits"
        
        read -p "Messaggio commit finale: " final_msg
        git commit -m "$final_msg"
        print_success "Commits squashed!"
    fi
    
    echo ""
    echo "Step 4: Push..."
    read -p "Vuoi pushare ora? (y/n): " do_push
    
    if [ "$do_push" = "y" ]; then
        git push -f origin "$CURRENT_BRANCH"
        print_success "Push completato!"
        echo ""
        print_info "Ora crea la Pull Request su GitHub:"
        echo "https://github.com/RobertoPoggi/telemedcare-v11/compare/$CURRENT_BRANCH"
    fi
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 8. Run Tests
run_tests() {
    print_info "Esecuzione test..."
    echo ""
    
    echo "1) Build test"
    echo "2) Email workflow test"
    echo "3) Tutti i test"
    read -p "Scegli (1-3): " test_choice
    
    case $test_choice in
        1) npm run build ;;
        2) ./test_complete_workflow.py ;;
        3) npm run build && ./test_complete_workflow.py ;;
    esac
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 9. Git Log
git_log() {
    print_info "Ultimi 20 commit..."
    echo ""
    
    git log --oneline --graph -20
    
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# 10. Show Help
show_help() {
    echo "================================="
    echo "  Aiuto - TeleMedCare Git Helper"
    echo "================================="
    echo ""
    echo "📋 WORKFLOW TIPICO:"
    echo ""
    echo "1. Status - Controlla stato"
    echo "2. Branch - Switch a genspark_ai_developer"
    echo "3. Pull - Scarica ultime modifiche"
    echo "4. [Lavora sul codice]"
    echo "5. Test - Esegui test"
    echo "6. Commit - Salva modifiche"
    echo "7. Push - Invia a GitHub"
    echo "8. PR Workflow - Crea Pull Request"
    echo ""
    echo "📚 DOCUMENTAZIONE:"
    echo "- AMBIENTE_SVILUPPO_GITHUB.md - Guida completa"
    echo "- README.md - Panoramica progetto"
    echo ""
    echo "🔗 LINKS:"
    echo "- Repo: https://github.com/RobertoPoggi/telemedcare-v11"
    echo "- Issues: https://github.com/RobertoPoggi/telemedcare-v11/issues"
    echo "- PRs: https://github.com/RobertoPoggi/telemedcare-v11/pulls"
    echo ""
    read -p "Premi ENTER per continuare..."
    show_menu
}

# Start
clear
print_success "TeleMedCare V11 - Git Helper inizializzato!"
show_menu
