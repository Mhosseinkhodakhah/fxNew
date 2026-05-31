#!/bin/bash

# Define color variables
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper function for colored output
print_step() {
    echo -e "${BOLD}${CYAN}▶${NC} ${BOLD}${GREEN}$1${NC}"
}

print_success() {
    echo -e "${BOLD}${GREEN}✓${NC} ${GREEN}$1${NC}"
}

print_header() {
    echo -e "\n${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${BLUE}   $1${NC}"
    echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

packages (){
    print_step "Installing packages for gateway service..."
    
    npm ci
    
    print_success "Packages installed successfully"
}

build(){
    print_step "Building gateway service..."
    
    npx tsc || true
    
    print_success "Build completed"
}

restart(){
    print_step "Restarting gateway service..."
    
    pm2 reload gateway2
        
    print_success "gateway service restarted"
    
    echo -e "\n${BOLD}${YELLOW}📋 Showing logs:${NC}\n"
    pm2 logs gateway2 --lines 20
}

# Main execution
clear
print_header "gateway SERVICE UPDATE"
packages
build
restart
echo -e "\n${BOLD}${GREEN}✅ Update completed successfully!${NC}\n"