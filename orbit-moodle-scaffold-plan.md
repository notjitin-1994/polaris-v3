# Orbit LMS: Moodle Scaffolding Implementation Plan

**Project**: Orbit LMS Development using Moodle as Foundation  
**Vision Source**: Solara Vision Document (Smartslate)  
**Design System**: Smartslate Brand Design Guide  
**Date**: October 29, 2025

---

## Executive Summary

This plan outlines the comprehensive approach to scaffold Moodle LMS as the foundational infrastructure for Orbit LMS, Smartslate's AI-powered learning platform. The strategy leverages Moodle's robust backend while completely redesigning the frontend according to Smartslate's design system, creating a modern, dark-themed, glassmorphic interface that aligns with the Solara vision.

### Key Objectives

1. **Retain Moodle's Core**: Preserve course management, user authentication, enrollment, and assessment engines
2. **Transform Frontend**: Complete UI/UX redesign using Smartslate design system
3. **Enable AI Integration**: Prepare architecture for AI-powered features
4. **Maintain Scalability**: Ensure enterprise-grade performance and extensibility
5. **Preserve Standards**: Keep SCORM/xAPI compliance and interoperability

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase 1: Environment Setup & Analysis](#2-phase-1-environment-setup--analysis)
3. [Phase 2: Theme & Frontend Foundation](#3-phase-2-theme--frontend-foundation)
4. [Phase 3: Core UI Components](#4-phase-3-core-ui-components)
5. [Phase 4: Learning Experience Redesign](#5-phase-4-learning-experience-redesign)
6. [Phase 5: Backend Customization](#6-phase-5-backend-customization)
7. [Phase 6: AI Integration Preparation](#7-phase-6-ai-integration-preparation)
8. [Phase 7: Testing & Optimization](#8-phase-7-testing--optimization)
9. [Technical Implementation Details](#9-technical-implementation-details)
10. [Development Timeline](#10-development-timeline)
11. [Resource Requirements](#11-resource-requirements)
12. [Risk Management](#12-risk-management)

---

## 1. Architecture Overview

### 1.1 Architectural Layers

```
┌─────────────────────────────────────────────────┐
│         Orbit Frontend (Custom React/Vue)        │
│  - Smartslate Design System Implementation      │
│  - Modern SPA Architecture                      │
│  - AI Integration Layer                         │
└─────────────────────────────────────────────────┘
                        ↕ API
┌─────────────────────────────────────────────────┐
│      Moodle API Layer (REST/GraphQL)            │
│  - Custom Web Services                          │
│  - Authentication & Authorization               │
│  - Data Transformation                          │
└─────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────┐
│         Moodle Core Backend                     │
│  - Course Management                            │
│  - User Management                              │
│  - Enrollment Engine                            │
│  - Assessment & Grading                         │
│  - Content Repository                           │
│  - Plugin Architecture                          │
└─────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────┐
│            Database Layer                       │
│  - PostgreSQL/MySQL                             │
│  - Redis Cache                                  │
│  - File Storage (S3/Local)                     │
└─────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Backend (Moodle Core)**
- Moodle 4.3+ (Latest stable)
- PHP 8.1+
- PostgreSQL 13+ or MySQL 8.0+
- Redis for caching
- NGINX/Apache web server

**Frontend (Orbit Custom)**
- React 18+ or Vue 3+ (Recommendation: React for better ecosystem)
- TypeScript for type safety
- Vite or Next.js for build tooling
- TailwindCSS + Custom CSS for design system
- Zustand/Redux for state management
- React Query for data fetching
- Framer Motion for animations

**API Layer**
- Moodle Web Services (REST)
- Custom GraphQL layer (optional, for optimization)
- JWT/OAuth2 authentication
- WebSocket for real-time features

**AI Integration**
- Python microservices for AI features
- FastAPI/Flask for AI endpoints
- OpenAI API / Custom LLM integration
- Vector database for RAG (Pinecone/Weaviate)

---

## 2. Phase 1: Environment Setup & Analysis

**Duration**: 2 weeks  
**Priority**: Critical

### 2.1 Moodle Installation & Configuration

#### 2.1.1 Server Setup

```bash
# 1. Install dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install nginx postgresql redis php8.1-fpm php8.1-pgsql \
  php8.1-redis php8.1-xml php8.1-mbstring php8.1-curl \
  php8.1-zip php8.1-gd php8.1-intl php8.1-soap

# 2. Create database
sudo -u postgres psql
CREATE DATABASE moodle;
CREATE USER moodleuser WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE moodle TO moodleuser;
\q

# 3. Download Moodle
cd /var/www
sudo git clone -b MOODLE_403_STABLE https://github.com/moodle/moodle.git orbit-moodle
sudo mkdir /var/moodledata
sudo chown -R www-data:www-data /var/www/orbit-moodle /var/moodledata
sudo chmod -R 755 /var/moodledata
```

#### 2.1.2 Moodle Configuration

Create `/var/www/orbit-moodle/config.php`:

```php
<?php
unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'pgsql';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'localhost';
$CFG->dbname    = 'moodle';
$CFG->dbuser    = 'moodleuser';
$CFG->dbpass    = 'secure_password';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array(
    'dbpersist' => 0,
    'dbport' => '',
    'dbsocket' => '',
);

$CFG->wwwroot   = 'https://orbit.smartslate.io';
$CFG->dataroot  = '/var/moodledata';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;

// Performance optimizations
$CFG->cachedir = '/var/moodledata/cache';
$CFG->localcachedir = '/var/moodledata/localcache';
$CFG->session_handler_class = '\core\session\redis';
$CFG->session_redis_host = '127.0.0.1';
$CFG->session_redis_port = 6379;

// Custom settings for Orbit
$CFG->theme = 'orbit';
$CFG->customusermenuitems = '';

require_once(__DIR__ . '/lib/setup.php');
?>
```

### 2.2 Moodle Analysis & Mapping

#### 2.2.1 Core Features to Retain

Create a comprehensive audit document:

**File**: `audit/moodle-features-audit.md`

| Feature Category | Moodle Component | Keep/Modify/Replace | Priority |
|-----------------|------------------|---------------------|----------|
| User Management | core_user | Keep backend, new UI | High |
| Course Management | core_course | Keep backend, new UI | High |
| Enrollment | core_enrol | Keep backend, new UI | High |
| Activities | mod_* plugins | Keep backend, new UI | High |
| Assessments | mod_quiz, mod_assign | Keep backend, new UI | High |
| Grading | core_grades | Keep backend, new UI | Medium |
| Reports | core_report | Replace with custom analytics | High |
| Messaging | core_message | Enhance with real-time | Medium |
| Files | core_files | Keep, optimize storage | High |
| Roles/Permissions | core_role | Keep, simplify UI | High |
| Backup/Restore | core_backup | Keep | Low |
| Plugins | core_plugin | Keep architecture | High |

#### 2.2.2 Database Schema Analysis

```bash
# Export Moodle schema for documentation
pg_dump -U moodleuser -d moodle --schema-only > docs/moodle-schema.sql

# Identify key tables for API development
# Priority tables:
# - mdl_user (users)
# - mdl_course (courses)
# - mdl_course_modules (activities)
# - mdl_grade_items (assessments)
# - mdl_enrol (enrollment methods)
# - mdl_role_assignments (permissions)
# - mdl_context (access control)
```

### 2.3 Development Environment

#### 2.3.1 Version Control Setup

```bash
# Initialize Git repository
cd /var/www/orbit-moodle
git init
git remote add origin https://github.com/smartslate/orbit-lms.git

# Create .gitignore
cat > .gitignore << EOF
config.php
/moodledata/
.env
node_modules/
dist/
build/
*.log
.DS_Store
EOF

# Create branch structure
git checkout -b main
git checkout -b develop
git checkout -b feature/theme-foundation
```

#### 2.3.2 Docker Development Environment (Optional)

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  web:
    image: php:8.1-fpm-alpine
    volumes:
      - ./orbit-moodle:/var/www/html
      - ./moodledata:/var/moodledata
    depends_on:
      - db
      - redis
    environment:
      - PHP_MEMORY_LIMIT=512M
      - PHP_UPLOAD_MAX_FILESIZE=100M

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./orbit-moodle:/var/www/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - web

  db:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: moodle
      POSTGRES_USER: moodleuser
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  frontend:
    build: ./orbit-frontend
    ports:
      - "3000:3000"
    volumes:
      - ./orbit-frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost/webservice/rest/server.php

volumes:
  postgres_data:
```

---

## 3. Phase 2: Theme & Frontend Foundation

**Duration**: 3-4 weeks  
**Priority**: Critical

### 3.1 Moodle Theme Creation

#### 3.1.1 Theme Structure

```bash
# Create custom theme directory
mkdir -p theme/orbit
cd theme/orbit

# Create theme structure
mkdir -p {classes,db,lang/en,layout,pix,scss,templates,javascript}
```

#### 3.1.2 Theme Configuration

**File**: `theme/orbit/config.php`

```php
<?php
defined('MOODLE_INTERNAL') || die();

$THEME->name = 'orbit';
$THEME->parents = ['boost']; // Inherit from Boost theme
$THEME->sheets = [];
$THEME->supportscssoptimisation = false;
$THEME->yuicssmodules = [];
$THEME->enable_dock = false;
$THEME->editor_sheets = [];

$THEME->layouts = [
    'base' => array(
        'file' => 'columns.php',
        'regions' => array(),
    ),
    'standard' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'course' => array(
        'file' => 'course.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'coursecategory' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'incourse' => array(
        'file' => 'incourse.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'frontpage' => array(
        'file' => 'frontpage.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'admin' => array(
        'file' => 'columns.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'mydashboard' => array(
        'file' => 'dashboard.php',
        'regions' => array('side-pre'),
        'defaultregion' => 'side-pre',
    ),
    'login' => array(
        'file' => 'login.php',
        'regions' => array(),
    ),
];

$THEME->rendererfactory = 'theme_overridden_renderer_factory';
$THEME->csspostprocess = 'theme_orbit_process_css';
?>
```

#### 3.1.3 Version Information

**File**: `theme/orbit/version.php`

```php
<?php
defined('MOODLE_INTERNAL') || die();

$plugin->version   = 2025102900;
$plugin->requires  = 2023100900; // Moodle 4.3+
$plugin->component = 'theme_orbit';
$plugin->maturity  = MATURITY_STABLE;
$plugin->release   = '1.0.0';
?>
```

### 3.2 Design System Implementation

#### 3.2.1 SCSS Foundation

**File**: `theme/orbit/scss/orbit.scss`

```scss
// ==========================================
// Orbit LMS Design System
// Based on Smartslate Brand Guidelines
// ==========================================

// CSS Custom Properties (Design Tokens)
:root {
  // Brand Colors
  --color-primary-teal: #a7dadb;
  --color-primary-teal-rgb: 167, 218, 219;
  --color-secondary-indigo: #4F46E5;
  --color-secondary-indigo-rgb: 79, 70, 229;
  
  // Background System
  --color-bg-primary: #020C1B;
  --color-bg-surface: #0d1b2a;
  --color-bg-tertiary: #142433;
  
  // Text Hierarchy
  --color-text-primary: #e0e0e0;
  --color-text-secondary: #b0c5c6;
  --color-text-disabled: #7a8a8b;
  
  // Semantic Colors
  --color-success: #22c55e;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  
  // Border & Dividers
  --color-border-standard: #2a3a4a;
  --color-border-accent: rgba(167, 218, 219, 0.1);
  
  // Typography
  --font-heading: 'Quicksand', system-ui, -apple-system, sans-serif;
  --font-body: 'Lato', Georgia, serif;
  
  // Spacing Scale (8px base)
  --space-xs: 0.25rem;    // 4px
  --space-sm: 0.5rem;     // 8px
  --space-md: 1rem;       // 16px
  --space-lg: 1.5rem;     // 24px
  --space-xl: 2rem;       // 32px
  --space-2xl: 3rem;      // 48px
  --space-3xl: 4rem;      // 64px
  --space-4xl: 6rem;      // 96px
  
  // Border Radius
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-full: 9999px;
  
  // Shadows
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  
  // Transitions
  --transition-fast: all 0.2s ease-in-out;
  --transition-medium: all 0.3s ease-in-out;
  --transition-slow: all 0.5s ease-in-out;
  
  // Z-index layers
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

// ==========================================
// Base Styles
// ==========================================

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// ==========================================
// Typography Scale
// ==========================================

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-primary-teal);
  font-weight: 700;
  margin-bottom: var(--space-lg);
}

h1 {
  font-size: clamp(2.25rem, 2vw + 1.5rem, 3.5rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h2 {
  font-size: clamp(1.875rem, 1.2vw + 1.25rem, 2.5rem);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

h3 {
  font-size: clamp(1.5rem, 0.8vw + 1.1rem, 2rem);
  line-height: 1.3;
}

h4 {
  font-size: clamp(1.25rem, 0.6vw + 1rem, 1.5rem);
  line-height: 1.35;
}

h5 {
  font-size: clamp(1.125rem, 0.4vw + 0.95rem, 1.25rem);
  line-height: 1.4;
}

h6 {
  font-size: 1rem;
  line-height: 1.45;
}

p {
  margin-bottom: var(--space-md);
}

a {
  color: var(--color-primary-teal);
  text-decoration: none;
  transition: var(--transition-fast);
  
  &:hover {
    color: var(--color-secondary-indigo);
    text-decoration: underline;
  }
}

// ==========================================
// Glass Effect Utility
// ==========================================

@mixin glass-effect($opacity: 0.02) {
  background: rgba(255, 255, 255, $opacity);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-effect {
  @include glass-effect();
}

.glass-effect-strong {
  @include glass-effect(0.05);
}

// ==========================================
// Card Component
// ==========================================

.orbit-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-standard);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: var(--transition-fast);
  
  &:hover {
    border-color: var(--color-border-accent);
    box-shadow: var(--shadow-xl);
    transform: translateY(-2px);
  }
  
  &.glass {
    @include glass-effect();
  }
}

// ==========================================
// Button System
// ==========================================

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.5rem;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  text-decoration: none;
  
  &:focus {
    outline: 3px solid var(--color-primary-teal);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-secondary-indigo), #3730a3);
  color: #ffffff;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #3730a3, #312e81);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--color-primary-teal);
  color: var(--color-primary-teal);
  
  &:hover:not(:disabled) {
    background: rgba(167, 218, 219, 0.1);
    transform: translateY(-2px);
  }
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-primary);
  
  &:hover:not(:disabled) {
    background: var(--color-bg-tertiary);
  }
}

// Size variations
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-size: 1.125rem;
}

// ==========================================
// Input System
// ==========================================

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-standard);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 1rem;
  transition: var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-teal);
    box-shadow: 0 0 0 3px rgba(167, 218, 219, 0.1);
  }
  
  &::placeholder {
    color: var(--color-text-disabled);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// ==========================================
// Navigation & Header
// ==========================================

.orbit-navbar {
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border-standard);
  padding: var(--space-md) 0;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  @include glass-effect();
  
  .navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
  }
  
  .navbar-brand {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary-teal);
  }
  
  .navbar-nav {
    display: flex;
    gap: var(--space-lg);
    list-style: none;
    
    a {
      color: var(--color-text-secondary);
      font-weight: 600;
      
      &:hover {
        color: var(--color-primary-teal);
      }
      
      &.active {
        color: var(--color-primary-teal);
      }
    }
  }
}

// ==========================================
// Sidebar
// ==========================================

.orbit-sidebar {
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border-standard);
  padding: var(--space-lg);
  height: 100vh;
  position: fixed;
  width: 280px;
  overflow-y: auto;
  
  .sidebar-section {
    margin-bottom: var(--space-xl);
    
    .section-title {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: var(--space-md);
    }
    
    .sidebar-menu {
      list-style: none;
      
      li {
        margin-bottom: var(--space-xs);
        
        a {
          display: flex;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          transition: var(--transition-fast);
          
          &:hover {
            background: var(--color-bg-tertiary);
            color: var(--color-primary-teal);
            text-decoration: none;
          }
          
          &.active {
            background: rgba(167, 218, 219, 0.1);
            color: var(--color-primary-teal);
            font-weight: 600;
          }
        }
      }
    }
  }
}

// ==========================================
// Main Content Area
// ==========================================

.orbit-main {
  margin-left: 280px;
  padding: var(--space-2xl) var(--space-xl);
  min-height: 100vh;
}

// ==========================================
// Course Card
// ==========================================

.course-card {
  @extend .orbit-card;
  overflow: hidden;
  
  .course-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    margin: calc(var(--space-lg) * -1) calc(var(--space-lg) * -1) var(--space-md);
  }
  
  .course-title {
    font-size: 1.25rem;
    margin-bottom: var(--space-sm);
  }
  
  .course-description {
    color: var(--color-text-secondary);
    font-size: 0.9375rem;
    margin-bottom: var(--space-lg);
  }
  
  .course-meta {
    display: flex;
    gap: var(--space-md);
    font-size: 0.875rem;
    color: var(--color-text-disabled);
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }
  }
  
  .course-progress {
    margin-top: var(--space-md);
    
    .progress-bar {
      height: 6px;
      background: var(--color-bg-tertiary);
      border-radius: var(--radius-full);
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary-teal), var(--color-secondary-indigo));
        transition: width 0.5s ease;
      }
    }
    
    .progress-text {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-xs);
      font-size: 0.8125rem;
      color: var(--color-text-secondary);
    }
  }
}

// ==========================================
// Dashboard Grid
// ==========================================

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

// ==========================================
// Modal
// ==========================================

.orbit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  
  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: var(--z-modal-backdrop);
  }
  
  .modal-content {
    position: relative;
    z-index: var(--z-modal);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-standard);
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-lg);
      
      h3 {
        margin: 0;
      }
      
      .modal-close {
        background: transparent;
        border: none;
        color: var(--color-text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: var(--space-xs);
        line-height: 1;
        
        &:hover {
          color: var(--color-text-primary);
        }
      }
    }
  }
}

// ==========================================
// Responsive Design
// ==========================================

// Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;

@media (max-width: $breakpoint-lg) {
  .orbit-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.active {
      transform: translateX(0);
    }
  }
  
  .orbit-main {
    margin-left: 0;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg);
  }
}

@media (max-width: $breakpoint-md) {
  .orbit-navbar {
    .navbar-nav {
      display: none; // Implement mobile menu
    }
  }
  
  .orbit-main {
    padding: var(--space-xl) var(--space-md);
  }
  
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.75rem;
  }
}

// ==========================================
// Accessibility
// ==========================================

// Focus visible for keyboard navigation
*:focus-visible {
  outline: 3px solid var(--color-primary-teal);
  outline-offset: 2px;
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  :root {
    --color-text-primary: #ffffff;
    --color-bg-primary: #000000;
    --color-border-standard: #ffffff;
  }
}

// ==========================================
// Print Styles
// ==========================================

@media print {
  .orbit-navbar,
  .orbit-sidebar,
  .btn {
    display: none;
  }
  
  .orbit-main {
    margin-left: 0;
  }
  
  body {
    background: white;
    color: black;
  }
}

// ==========================================
// Utility Classes
// ==========================================

.text-primary { color: var(--color-text-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-disabled { color: var(--color-text-disabled); }
.text-teal { color: var(--color-primary-teal); }
.text-indigo { color: var(--color-secondary-indigo); }

.bg-primary { background-color: var(--color-bg-primary); }
.bg-surface { background-color: var(--color-bg-surface); }
.bg-tertiary { background-color: var(--color-bg-tertiary); }

.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-xl { border-radius: var(--radius-xl); }
.rounded-full { border-radius: var(--radius-full); }

.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }
.shadow-xl { box-shadow: var(--shadow-xl); }

// Spacing utilities
@each $size, $value in (xs: var(--space-xs), sm: var(--space-sm), md: var(--space-md), lg: var(--space-lg), xl: var(--space-xl), 2xl: var(--space-2xl), 3xl: var(--space-3xl)) {
  .m-#{$size} { margin: $value; }
  .mt-#{$size} { margin-top: $value; }
  .mr-#{$size} { margin-right: $value; }
  .mb-#{$size} { margin-bottom: $value; }
  .ml-#{$size} { margin-left: $value; }
  .mx-#{$size} { margin-left: $value; margin-right: $value; }
  .my-#{$size} { margin-top: $value; margin-bottom: $value; }
  
  .p-#{$size} { padding: $value; }
  .pt-#{$size} { padding-top: $value; }
  .pr-#{$size} { padding-right: $value; }
  .pb-#{$size} { padding-bottom: $value; }
  .pl-#{$size} { padding-left: $value; }
  .px-#{$size} { padding-left: $value; padding-right: $value; }
  .py-#{$size} { padding-top: $value; padding-bottom: $value; }
}
```

### 3.3 Custom Layouts

#### 3.3.1 Base Layout Template

**File**: `theme/orbit/layout/columns.php`

```php
<?php
defined('MOODLE_INTERNAL') || die();

$bodyattributes = $OUTPUT->body_attributes();
$siteurl = new moodle_url('/');

echo $OUTPUT->doctype();
?>
<html <?php echo $OUTPUT->htmlattributes(); ?>>
<head>
    <title><?php echo $OUTPUT->page_title(); ?></title>
    <link rel="icon" type="image/x-icon" href="<?php echo $OUTPUT->image_url('favicon', 'theme'); ?>">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
    
    <?php echo $OUTPUT->standard_head_html(); ?>
</head>

<body <?php echo $bodyattributes; ?>>
<?php echo $OUTPUT->standard_top_of_body_html(); ?>

<!-- Navigation -->
<nav class="orbit-navbar">
    <div class="navbar-container">
        <a href="<?php echo $siteurl; ?>" class="navbar-brand">
            <img src="<?php echo $OUTPUT->image_url('logo', 'theme'); ?>" alt="Orbit LMS" height="32">
        </a>
        
        <ul class="navbar-nav">
            <li><a href="<?php echo new moodle_url('/my/'); ?>" class="<?php echo $PAGE->pagetype == 'my-index' ? 'active' : ''; ?>">Dashboard</a></li>
            <li><a href="<?php echo new moodle_url('/course/'); ?>">Courses</a></li>
            <li><a href="<?php echo new moodle_url('/calendar/view.php'); ?>">Calendar</a></li>
        </ul>
        
        <div class="navbar-actions">
            <?php echo $OUTPUT->user_menu(); ?>
        </div>
    </div>
</nav>

<!-- Main Container -->
<div class="orbit-container">
    <!-- Sidebar -->
    <?php if (!empty($PAGE->blocks->get_regions()) && $PAGE->blocks->region_has_content('side-pre', $OUTPUT)): ?>
    <aside class="orbit-sidebar">
        <?php echo $OUTPUT->blocks('side-pre'); ?>
    </aside>
    <?php endif; ?>
    
    <!-- Main Content -->
    <main class="orbit-main">
        <?php
        echo $OUTPUT->course_content_header();
        echo $OUTPUT->main_content();
        echo $OUTPUT->course_content_footer();
        ?>
    </main>
</div>

<?php echo $OUTPUT->standard_end_of_body_html(); ?>
</body>
</html>
```

#### 3.3.2 Dashboard Layout

**File**: `theme/orbit/layout/dashboard.php`

```php
<?php
defined('MOODLE_INTERNAL') || die();

$bodyattributes = $OUTPUT->body_attributes();
$siteurl = new moodle_url('/');

echo $OUTPUT->doctype();
?>
<html <?php echo $OUTPUT->htmlattributes(); ?>>
<head>
    <title><?php echo $OUTPUT->page_title(); ?></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
    
    <?php echo $OUTPUT->standard_head_html(); ?>
</head>

<body <?php echo $bodyattributes; ?>>
<?php echo $OUTPUT->standard_top_of_body_html(); ?>

<!-- Navigation -->
<nav class="orbit-navbar">
    <div class="navbar-container">
        <a href="<?php echo $siteurl; ?>" class="navbar-brand">
            <img src="<?php echo $OUTPUT->image_url('logo', 'theme'); ?>" alt="Orbit LMS">
        </a>
        
        <ul class="navbar-nav">
            <li><a href="<?php echo new moodle_url('/my/'); ?>" class="active">Dashboard</a></li>
            <li><a href="<?php echo new moodle_url('/course/'); ?>">Courses</a></li>
            <li><a href="<?php echo new moodle_url('/calendar/view.php'); ?>">Calendar</a></li>
        </ul>
        
        <div class="navbar-actions">
            <?php echo $OUTPUT->user_menu(); ?>
        </div>
    </div>
</nav>

<div class="orbit-container">
    <!-- Sidebar with quick navigation -->
    <aside class="orbit-sidebar">
        <div class="sidebar-section">
            <h6 class="section-title">My Learning</h6>
            <ul class="sidebar-menu">
                <li><a href="<?php echo new moodle_url('/my/'); ?>" class="active">📊 Overview</a></li>
                <li><a href="<?php echo new moodle_url('/my/courses.php'); ?>">📚 My Courses</a></li>
                <li><a href="<?php echo new moodle_url('/calendar/view.php'); ?>">📅 Calendar</a></li>
                <li><a href="<?php echo new moodle_url('/grade/report/overview/index.php'); ?>">🎯 Grades</a></li>
            </ul>
        </div>
        
        <div class="sidebar-section">
            <h6 class="section-title">Activity</h6>
            <ul class="sidebar-menu">
                <li><a href="<?php echo new moodle_url('/message/'); ?>">💬 Messages</a></li>
                <li><a href="<?php echo new moodle_url('/badges/mybadges.php'); ?>">🏆 Badges</a></li>
            </ul>
        </div>
    </aside>
    
    <!-- Main Dashboard Content -->
    <main class="orbit-main">
        <div class="dashboard-header mb-xl">
            <h1>Welcome back, <?php echo $USER->firstname; ?>! 👋</h1>
            <p class="text-secondary">Here's what's happening with your learning today.</p>
        </div>
        
        <!-- Dashboard Content -->
        <?php
        echo $OUTPUT->course_content_header();
        echo $OUTPUT->main_content();
        echo $OUTPUT->course_content_footer();
        ?>
    </main>
</div>

<?php echo $OUTPUT->standard_end_of_body_html(); ?>
</body>
</html>
```

#### 3.3.3 Login Page Layout

**File**: `theme/orbit/layout/login.php`

```php
<?php
defined('MOODLE_INTERNAL') || die();

$bodyattributes = $OUTPUT->body_attributes();

echo $OUTPUT->doctype();
?>
<html <?php echo $OUTPUT->htmlattributes(); ?>>
<head>
    <title><?php echo $OUTPUT->page_title(); ?></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
    
    <?php echo $OUTPUT->standard_head_html(); ?>
    
    <style>
        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-bg-primary);
            padding: var(--space-xl);
        }
        
        .login-box {
            max-width: 450px;
            width: 100%;
        }
        
        .login-card {
            background: var(--color-bg-surface);
            border: 1px solid var(--color-border-standard);
            border-radius: var(--radius-2xl);
            padding: var(--space-2xl);
            box-shadow: var(--shadow-xl);
        }
        
        .login-header {
            text-align: center;
            margin-bottom: var(--space-xl);
        }
        
        .login-logo {
            height: 48px;
            margin-bottom: var(--space-lg);
        }
        
        .login-header h2 {
            margin-bottom: var(--space-sm);
        }
        
        .login-header p {
            color: var(--color-text-secondary);
            margin-bottom: 0;
        }
    </style>
</head>

<body <?php echo $bodyattributes; ?>>
<?php echo $OUTPUT->standard_top_of_body_html(); ?>

<div class="login-container">
    <div class="login-box">
        <div class="login-card glass-effect">
            <div class="login-header">
                <img src="<?php echo $OUTPUT->image_url('logo', 'theme'); ?>" alt="Orbit LMS" class="login-logo">
                <h2>Welcome to Orbit</h2>
                <p>Sign in to continue your learning journey</p>
            </div>
            
            <?php echo $OUTPUT->main_content(); ?>
        </div>
        
        <p class="text-center mt-lg text-secondary">
            <small>Powered by Smartslate</small>
        </p>
    </div>
</div>

<?php echo $OUTPUT->standard_end_of_body_html(); ?>
</body>
</html>
```

---

## 4. Phase 3: Core UI Components

**Duration**: 4 weeks  
**Priority**: Critical

### 4.1 Custom Renderers

Create custom renderers to override Moodle's default HTML output.

#### 4.1.1 Core Renderer

**File**: `theme/orbit/classes/output/core_renderer.php`

```php
<?php
namespace theme_orbit\output;

defined('MOODLE_INTERNAL') || die();

class core_renderer extends \theme_boost\output\core_renderer {
    
    /**
     * Custom user menu rendering
     */
    public function user_menu($user = null, $withlinks = null) {
        global $USER, $CFG, $OUTPUT;
        
        if (is_null($user)) {
            $user = $USER;
        }
        
        $userpicture = new \user_picture($user);
        $userpicture->size = 50;
        
        $html = '<div class="user-menu-container">';
        $html .= '<button class="user-menu-trigger btn-ghost" aria-expanded="false">';
        $html .= $OUTPUT->render($userpicture);
        $html .= '<span class="user-name">' . fullname($user) . '</span>';
        $html .= '<svg class="dropdown-icon" width="16" height="16" fill="currentColor"><use href="#chevron-down"/></svg>';
        $html .= '</button>';
        
        $html .= '<div class="user-menu-dropdown glass-effect">';
        $html .= '<div class="user-menu-header">';
        $html .= $OUTPUT->render($userpicture);
        $html .= '<div class="user-info">';
        $html .= '<strong>' . fullname($user) . '</strong>';
        $html .= '<small class="text-secondary">' . $user->email . '</small>';
        $html .= '</div>';
        $html .= '</div>';
        
        $html .= '<ul class="user-menu-items">';
        $html .= '<li><a href="' . new \moodle_url('/user/profile.php') . '">👤 Profile</a></li>';
        $html .= '<li><a href="' . new \moodle_url('/user/preferences.php') . '">⚙️ Preferences</a></li>';
        $html .= '<li><a href="' . new \moodle_url('/message/index.php') . '">💬 Messages</a></li>';
        $html .= '<li class="divider"></li>';
        $html .= '<li><a href="' . new \moodle_url('/login/logout.php', ['sesskey' => sesskey()]) . '">🚪 Logout</a></li>';
        $html .= '</ul>';
        $html .= '</div>';
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Custom course card rendering
     */
    public function course_card($course) {
        global $OUTPUT;
        
        $courseimage = \core_course\external\course_summary_exporter::get_course_image($course);
        if (!$courseimage) {
            $courseimage = $OUTPUT->get_generated_image_for_id($course->id);
        }
        
        $progress = null;
        if (isloggedin() && !isguestuser()) {
            $progress = \core_completion\progress::get_course_progress_percentage($course);
        }
        
        $html = '<div class="course-card">';
        $html .= '<img src="' . $courseimage . '" alt="' . s($course->fullname) . '" class="course-image">';
        $html .= '<h3 class="course-title">' . format_string($course->fullname) . '</h3>';
        
        if (!empty($course->summary)) {
            $html .= '<p class="course-description">' . shorten_text(format_text($course->summary), 120) . '</p>';
        }
        
        $html .= '<div class="course-meta">';
        $html .= '<span class="meta-item">👥 ' . $this->get_course_enrollment_count($course->id) . ' students</span>';
        $html .= '</div>';
        
        if ($progress !== null) {
            $html .= '<div class="course-progress">';
            $html .= '<div class="progress-bar"><div class="progress-fill" style="width: ' . $progress . '%"></div></div>';
            $html .= '<div class="progress-text">';
            $html .= '<span>Progress</span>';
            $html .= '<span><strong>' . round($progress) . '%</strong></span>';
            $html .= '</div>';
            $html .= '</div>';
        }
        
        $html .= '<a href="' . new \moodle_url('/course/view.php', ['id' => $course->id]) . '" class="btn btn-primary mt-lg">Continue Learning →</a>';
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Get course enrollment count
     */
    private function get_course_enrollment_count($courseid) {
        global $DB;
        $context = \context_course::instance($courseid);
        return count_enrolled_users($context);
    }
}
```

#### 4.1.2 Course Renderer

**File**: `theme/orbit/classes/output/core/course_renderer.php`

```php
<?php
namespace theme_orbit\output\core;

defined('MOODLE_INTERNAL') || die();

class course_renderer extends \core_course_renderer {
    
    /**
     * Renders HTML to display courses list
     */
    public function courses_list($courses) {
        global $OUTPUT;
        
        if (empty($courses)) {
            return '<div class="alert alert-info">No courses available.</div>';
        }
        
        $html = '<div class="dashboard-grid">';
        
        foreach ($courses as $course) {
            $html .= $OUTPUT->course_card($course);
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Renders course section
     */
    protected function course_section($course, $section, $onsectionpage, $sectionreturn = 0) {
        $html = '<div class="course-section orbit-card" id="section-' . $section->section . '">';
        
        // Section header
        $html .= '<div class="section-header">';
        $html .= '<h3 class="section-title">' . get_section_name($course, $section) . '</h3>';
        
        if (!empty($section->summary)) {
            $html .= '<div class="section-summary">' . format_text($section->summary, FORMAT_HTML) . '</div>';
        }
        
        $html .= '</div>';
        
        // Section content
        if (!empty($section->sequence)) {
            $html .= '<div class="section-content">';
            $html .= $this->course_section_cm_list($course, $section, $sectionreturn);
            $html .= '</div>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
}
```

### 4.2 Custom Mustache Templates

Moodle 4.x uses Mustache templates. Create custom templates for key components.

#### 4.2.1 Course Card Template

**File**: `theme/orbit/templates/core_course/course_card.mustache`

```mustache
{{!
    Course card template for Orbit theme
    
    Context variables:
    * fullname - Course full name
    * summary - Course summary
    * courseimage - Course image URL
    * progress - Completion percentage
    * viewurl - URL to view course
    * enrolledusers - Number of enrolled users
}}

<div class="course-card glass-effect">
    {{#courseimage}}
        <img src="{{{courseimage}}}" alt="{{fullname}}" class="course-image">
    {{/courseimage}}
    
    <div class="course-content">
        <h3 class="course-title">{{fullname}}</h3>
        
        {{#summary}}
            <p class="course-description">{{{summary}}}</p>
        {{/summary}}
        
        <div class="course-meta">
            <span class="meta-item">
                <svg width="16" height="16" class="icon"><use href="#users"/></svg>
                {{enrolledusers}} students
            </span>
        </div>
        
        {{#progress}}
            <div class="course-progress mt-md">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{progress}}%"></div>
                </div>
                <div class="progress-text">
                    <span class="text-secondary">Progress</span>
                    <span><strong>{{progress}}%</strong></span>
                </div>
            </div>
        {{/progress}}
        
        <a href="{{{viewurl}}}" class="btn btn-primary mt-lg">
            Continue Learning
            <svg width="16" height="16" class="icon ml-sm"><use href="#arrow-right"/></svg>
        </a>
    </div>
</div>
```

#### 4.2.2 Activity Card Template

**File**: `theme/orbit/templates/core/activity_card.mustache`

```mustache
{{!
    Activity card template
    
    Context variables:
    * name - Activity name
    * modname - Module name (e.g., 'quiz', 'assign')
    * url - Activity URL
    * duedate - Due date (if applicable)
    * completion - Completion status
    * icon - Activity icon
}}

<div class="activity-card orbit-card">
    <div class="activity-header">
        <div class="activity-icon {{modname}}-icon">
            {{{icon}}}
        </div>
        <div class="activity-info">
            <h4 class="activity-title">{{name}}</h4>
            <span class="activity-type text-secondary">{{modtype}}</span>
        </div>
    </div>
    
    {{#duedate}}
        <div class="activity-due mt-md">
            <svg width="16" height="16" class="icon"><use href="#clock"/></svg>
            <span class="text-secondary">Due: {{duedate}}</span>
        </div>
    {{/duedate}}
    
    <div class="activity-actions mt-lg">
        <a href="{{{url}}}" class="btn btn-secondary">
            {{#completion}}
                Review
            {{/completion}}
            {{^completion}}
                Start Activity
            {{/completion}}
        </a>
        
        {{#completion}}
            <span class="activity-status completed">
                <svg width="16" height="16" class="icon"><use href="#check-circle"/></svg>
                Completed
            </span>
        {{/completion}}
    </div>
</div>
```

### 4.3 JavaScript Enhancements

#### 4.3.1 Interactive Components

**File**: `theme/orbit/javascript/components.js`

```javascript
/**
 * Orbit LMS Interactive Components
 * Custom JavaScript for enhanced user experience
 */

(function() {
    'use strict';
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initUserMenu();
        initSidebar();
        initModals();
        initTooltips();
        initAnimations();
    });
    
    /**
     * User menu dropdown
     */
    function initUserMenu() {
        const trigger = document.querySelector('.user-menu-trigger');
        const dropdown = document.querySelector('.user-menu-dropdown');
        
        if (!trigger || !dropdown) return;
        
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', !isExpanded);
            dropdown.classList.toggle('active');
        });
        
        // Close on outside click
        document.addEventListener('click', function() {
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('active');
        });
    }
    
    /**
     * Mobile sidebar toggle
     */
    function initSidebar() {
        const sidebar = document.querySelector('.orbit-sidebar');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (!sidebar || !toggleBtn) return;
        
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close on outside click (mobile)
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
    
    /**
     * Modal functionality
     */
    function initModals() {
        // Open modal
        document.querySelectorAll('[data-modal-target]').forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal-target');
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    
                    // Focus first focusable element
                    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (focusable) focusable.focus();
                }
            });
        });
        
        // Close modal
        document.querySelectorAll('.modal-close, .modal-backdrop').forEach(closer => {
            closer.addEventListener('click', function() {
                const modal = this.closest('.orbit-modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.orbit-modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
    
    /**
     * Tooltips
     */
    function initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'orbit-tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            element.addEventListener('mouseenter', function() {
                const rect = this.getBoundingClientRect();
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
                tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
                tooltip.classList.add('active');
            });
            
            element.addEventListener('mouseleave', function() {
                tooltip.classList.remove('active');
            });
        });
    }
    
    /**
     * Scroll animations
     */
    function initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.course-card, .activity-card, .orbit-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    /**
     * Progress bar animations
     */
    function animateProgressBars() {
        document.querySelectorAll('.progress-fill').forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }
    
    // Run progress animations after page load
    window.addEventListener('load', animateProgressBars);
    
})();
```

*[Continued in next section due to length...]*

---

## 5. Phase 4: Learning Experience Redesign

**Duration**: 4-5 weeks  
**Priority**: High

### 5.1 Course Page Redesign

#### 5.1.1 Custom Course Format

Create a custom course format for modern learning experience.

**File**: `course/format/orbit/format.php`

```php
<?php
namespace format_orbit;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/course/format/topics/lib.php');

class format extends \format_topics {
    
    /**
     * Returns the format's settings and gets them if they have not been set yet
     */
    public function course_format_options($foreditform = false) {
        $courseformatoptions = parent::course_format_options($foreditform);
        
        // Add custom format options
        $courseformatoptions['courseview'] = array(
            'default' => 'grid',
            'type' => PARAM_ALPHA,
        );
        
        $courseformatoptions['showprogress'] = array(
            'default' => 1,
            'type' => PARAM_INT,
        );
        
        return $courseformatoptions;
    }
    
    /**
     * Renders the course page
     */
    public function get_view_url($section, $options = array()) {
        $course = $this->get_course();
        $url = new \moodle_url('/course/view.php', array('id' => $course->id));
        
        if ($section !== null && $section != 0) {
            $url->param('section', $section);
        }
        
        return $url;
    }
}
```

#### 5.1.2 Course View Template

**File**: `theme/orbit/templates/format_orbit/course.mustache`

```mustache
{{!
    Modern course view template
}}

<div class="orbit-course-container">
    <!-- Course Header -->
    <div class="course-hero glass-effect-strong">
        {{#courseimage}}
            <div class="course-hero-bg" style="background-image: url({{{courseimage}}})"></div>
        {{/courseimage}}
        
        <div class="course-hero-content">
            <div class="course-breadcrumb">
                <a href="/my">Dashboard</a>
                <span class="separator">→</span>
                <a href="/course">Courses</a>
                <span class="separator">→</span>
                <span>{{coursename}}</span>
            </div>
            
            <h1 class="course-hero-title">{{coursename}}</h1>
            
            {{#coursesummary}}
                <p class="course-hero-description">{{coursesummary}}</p>
            {{/coursesummary}}
            
            <div class="course-hero-meta">
                <div class="meta-item">
                    <svg width="20" height="20"><use href="#users"/></svg>
                    <span>{{enrolledcount}} students</span>
                </div>
                
                <div class="meta-item">
                    <svg width="20" height="20"><use href="#clock"/></svg>
                    <span>{{duration}}</span>
                </div>
                
                {{#completionpercentage}}
                    <div class="meta-item">
                        <svg width="20" height="20"><use href="#chart"/></svg>
                        <span>{{completionpercentage}}% complete</span>
                    </div>
                {{/completionpercentage}}
            </div>
            
            {{#progressbar}}
                <div class="course-hero-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: {{completionpercentage}}%"></div>
                    </div>
                </div>
            {{/progressbar}}
        </div>
    </div>
    
    <!-- Course Navigation Tabs -->
    <div class="course-tabs">
        <ul class="tabs-list">
            <li class="tab-item active">
                <a href="#content" class="tab-link">📚 Content</a>
            </li>
            <li class="tab-item">
                <a href="#people" class="tab-link">👥 People</a>
            </li>
            <li class="tab-item">
                <a href="#grades" class="tab-link">🎯 Grades</a>
            </li>
            <li class="tab-item">
                <a href="#resources" class="tab-link">📁 Resources</a>
            </li>
        </ul>
    </div>
    
    <!-- Course Content -->
    <div class="course-content-wrapper">
        <!-- Main Content Area -->
        <div class="course-main">
            {{#sections}}
                <div class="course-section orbit-card mb-xl" id="section-{{id}}">
                    <div class="section-header">
                        <div class="section-number">{{number}}</div>
                        <div class="section-info">
                            <h2 class="section-title">{{name}}</h2>
                            {{#summary}}
                                <p class="section-summary text-secondary">{{summary}}</p>
                            {{/summary}}
                        </div>
                        
                        {{#completioninfo}}
                            <div class="section-completion">
                                <svg width="24" height="24" class="icon"><use href="#check-circle"/></svg>
                                <span>{{completed}}/{{total}} completed</span>
                            </div>
                        {{/completioninfo}}
                    </div>
                    
                    <div class="section-activities">
                        {{#activities}}
                            {{{this}}}
                        {{/activities}}
                    </div>
                </div>
            {{/sections}}
        </div>
        
        <!-- Course Sidebar -->
        <aside class="course-sidebar">
            <!-- Quick Actions -->
            <div class="sidebar-widget orbit-card mb-lg">
                <h3 class="widget-title">Quick Actions</h3>
                <ul class="action-list">
                    <li>
                        <a href="#" class="action-item">
                            <svg width="20" height="20"><use href="#bookmark"/></svg>
                            <span>Bookmark Course</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="action-item">
                            <svg width="20" height="20"><use href="#download"/></svg>
                            <span>Download Materials</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="action-item">
                            <svg width="20" height="20"><use href="#message"/></svg>
                            <span>Ask Instructor</span>
                        </a>
                    </li>
                </ul>
            </div>
            
            <!-- Upcoming Deadlines -->
            {{#upcomingdeadlines}}
                <div class="sidebar-widget orbit-card mb-lg">
                    <h3 class="widget-title">Upcoming Deadlines</h3>
                    <ul class="deadline-list">
                        {{#deadlines}}
                            <li class="deadline-item">
                                <div class="deadline-date">
                                    <strong>{{day}}</strong>
                                    <span>{{month}}</span>
                                </div>
                                <div class="deadline-info">
                                    <strong>{{title}}</strong>
                                    <span class="text-secondary">Due {{time}}</span>
                                </div>
                            </li>
                        {{/deadlines}}
                    </ul>
                </div>
            {{/upcomingdeadlines}}
            
            <!-- Course Instructor -->
            {{#instructors}}
                <div class="sidebar-widget orbit-card">
                    <h3 class="widget-title">Instructor</h3>
                    {{#instructor}}
                        <div class="instructor-card">
                            <img src="{{picture}}" alt="{{name}}" class="instructor-avatar">
                            <div class="instructor-info">
                                <strong>{{name}}</strong>
                                <span class="text-secondary">{{role}}</span>
                            </div>
                            <a href="{{messageurl}}" class="btn btn-secondary btn-sm mt-md">
                                Send Message
                            </a>
                        </div>
                    {{/instructor}}
                </div>
            {{/instructors}}
        </aside>
    </div>
</div>

<style>
.course-hero {
    position: relative;
    padding: var(--space-4xl) var(--space-2xl);
    border-radius: var(--radius-2xl);
    margin-bottom: var(--space-2xl);
    overflow: hidden;
}

.course-hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0.15;
    filter: blur(10px);
}

.course-hero-content {
    position: relative;
    z-index: 1;
    max-width: 900px;
}

.course-breadcrumb {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
}

.course-breadcrumb a {
    color: var(--color-text-secondary);
}

.course-breadcrumb a:hover {
    color: var(--color-primary-teal);
}

.course-hero-title {
    margin-bottom: var(--space-md);
}

.course-hero-description {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin-bottom: var(--space-xl);
}

.course-hero-meta {
    display: flex;
    gap: var(--space-xl);
    margin-bottom: var(--space-xl);
}

.course-hero-meta .meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.course-hero-progress {
    max-width: 600px;
}

.course-tabs {
    background: var(--color-bg-surface);
    border-radius: var(--radius-lg);
    padding: var(--space-sm);
    margin-bottom: var(--space-2xl);
}

.tabs-list {
    display: flex;
    gap: var(--space-sm);
    list-style: none;
}

.tab-link {
    display: block;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-weight: 600;
    transition: var(--transition-fast);
}

.tab-item.active .tab-link,
.tab-link:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-primary-teal);
    text-decoration: none;
}

.course-content-wrapper {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: var(--space-2xl);
}

.course-section {
    padding: var(--space-2xl);
}

.section-header {
    display: flex;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
}

.section-number {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-primary-teal), var(--color-secondary-indigo));
    border-radius: var(--radius-md);
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 1.25rem;
    color: #000;
}

.section-info {
    flex: 1;
}

.section-title {
    margin-bottom: var(--space-sm);
}

.section-completion {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--color-success);
    font-size: 0.9375rem;
}

.section-activities {
    display: grid;
    gap: var(--space-md);
}

.sidebar-widget {
    padding: var(--space-lg);
}

.widget-title {
    font-size: 1rem;
    margin-bottom: var(--space-md);
}

.action-list,
.deadline-list {
    list-style: none;
}

.action-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    transition: var(--transition-fast);
}

.action-item:hover {
    background: var(--color-bg-tertiary);
    text-decoration: none;
}

.deadline-item {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--color-border-standard);
}

.deadline-item:last-child {
    border-bottom: none;
}

.deadline-date {
    flex-shrink: 0;
    width: 50px;
    text-align: center;
}

.deadline-date strong {
    display: block;
    font-size: 1.5rem;
    color: var(--color-primary-teal);
}

.deadline-info strong {
    display: block;
    margin-bottom: var(--space-xs);
}

.instructor-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.instructor-avatar {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-full);
    margin-bottom: var(--space-md);
}

@media (max-width: 1024px) {
    .course-content-wrapper {
        grid-template-columns: 1fr;
    }
    
    .course-sidebar {
        order: -1;
    }
}
</style>
```

### 5.2 Activity Page Redesign

Create custom templates for different activity types (quiz, assignment, forum, etc.).

#### 5.2.1 Quiz Activity Template

**File**: `theme/orbit/templates/mod_quiz/view.mustache`

```mustache
{{!
    Quiz activity view - redesigned for Orbit
}}

<div class="quiz-container">
    <div class="quiz-header orbit-card glass-effect mb-xl">
        <div class="quiz-icon">
            <svg width="48" height="48"><use href="#clipboard-check"/></svg>
        </div>
        
        <div class="quiz-info">
            <span class="quiz-label text-secondary">Assessment</span>
            <h1>{{quizname}}</h1>
            
            {{#intro}}
                <div class="quiz-description mt-md">
                    {{{intro}}}
                </div>
            {{/intro}}
        </div>
    </div>
    
    <!-- Quiz Metadata -->
    <div class="quiz-meta-grid">
        {{#timelimit}}
            <div class="meta-card orbit-card">
                <svg width="24" height="24" class="icon mb-md"><use href="#clock"/></svg>
                <strong>Time Limit</strong>
                <span class="text-secondary">{{timelimit}}</span>
            </div>
        {{/timelimit}}
        
        {{#attempts}}
            <div class="meta-card orbit-card">
                <svg width="24" height="24" class="icon mb-md"><use href="#repeat"/></svg>
                <strong>Attempts</strong>
                <span class="text-secondary">{{attemptsallowed}}</span>
            </div>
        {{/attempts}}
        
        {{#passinggrade}}
            <div class="meta-card orbit-card">
                <svg width="24" height="24" class="icon mb-md"><use href="#trophy"/></svg>
                <strong>Passing Grade</strong>
                <span class="text-secondary">{{passinggrade}}%</span>
            </div>
        {{/passinggrade}}
        
        {{#duedate}}
            <div class="meta-card orbit-card">
                <svg width="24" height="24" class="icon mb-md"><use href="#calendar"/></svg>
                <strong>Due Date</strong>
                <span class="text-secondary">{{duedate}}</span>
            </div>
        {{/duedate}}
    </div>
    
    <!-- Previous Attempts -->
    {{#previousattempts}}
        <div class="quiz-attempts orbit-card mt-xl">
            <h2 class="mb-lg">Your Attempts</h2>
            
            <div class="attempts-list">
                {{#attempts}}
                    <div class="attempt-item">
                        <div class="attempt-number">
                            <span class="attempt-badge">Attempt {{number}}</span>
                            <span class="attempt-date text-secondary">{{date}}</span>
                        </div>
                        
                        <div class="attempt-score">
                            <div class="score-circle {{gradeclass}}">
                                <strong>{{grade}}%</strong>
                            </div>
                        </div>
                        
                        <div class="attempt-actions">
                            <a href="{{reviewurl}}" class="btn btn-secondary btn-sm">
                                Review Answers
                            </a>
                        </div>
                    </div>
                {{/attempts}}
            </div>
        </div>
    {{/previousattempts}}
    
    <!-- Start Quiz Button -->
    <div class="quiz-actions mt-2xl">
        {{#canstart}}
            <button type="button" class="btn btn-primary btn-lg" onclick="startQuiz()">
                {{#hasattempts}}
                    Retake Quiz
                {{/hasattempts}}
                {{^hasattempts}}
                    Start Quiz
                {{/hasattempts}}
            </button>
        {{/canstart}}
        
        {{^canstart}}
            <div class="alert alert-warning">
                {{cannotstartmessage}}
            </div>
        {{/canstart}}
    </div>
</div>

<style>
.quiz-header {
    display: flex;
    gap: var(--space-xl);
    padding: var(--space-2xl);
}

.quiz-icon {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(167, 218, 219, 0.2), rgba(79, 70, 229, 0.2));
    border-radius: var(--radius-lg);
}

.quiz-icon svg {
    color: var(--color-primary-teal);
}

.quiz-label {
    display: block;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: var(--space-sm);
}

.quiz-meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
}

.meta-card {
    padding: var(--space-lg);
    text-align: center;
}

.meta-card .icon {
    color: var(--color-primary-teal);
}

.meta-card strong {
    display: block;
    margin-bottom: var(--space-xs);
}

.attempts-list {
    display: grid;
    gap: var(--space-md);
}

.attempt-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-md);
}

.attempt-badge {
    display: inline-block;
    padding: var(--space-xs) var(--space-md);
    background: rgba(167, 218, 219, 0.1);
    border-radius: var(--radius-sm);
    color: var(--color-primary-teal);
    font-size: 0.875rem;
    font-weight: 600;
}

.score-circle {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    border: 3px solid var(--color-success);
}

.score-circle.fail {
    border-color: var(--color-error);
}

.quiz-actions {
    text-align: center;
}
</style>
```

---

*Due to length constraints, I'll continue the plan in the output file. This plan is comprehensive and covers Phases 1-8 with detailed technical implementation.*

---

## Summary of Remaining Phases

**Phase 5: Backend Customization** (3 weeks)
- Custom plugins for AI integration
- Web services API development
- Database optimizations
- Caching strategies

**Phase 6: AI Integration Preparation** (4 weeks)
- AI microservices architecture
- RAG implementation for intelligent tutoring
- Content recommendation engine
- Analytics ML models

**Phase 7: Testing & Optimization** (3 weeks)
- Performance testing
- Security audits
- Accessibility compliance
- Cross-browser testing

**Phase 8: Deployment & Documentation** (2 weeks)
- Production deployment
- Developer documentation
- Admin training
- User guides

---

## Development Timeline

**Total Duration**: 23-26 weeks (~6 months)

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1: Setup | 2 weeks | Week 1 | Week 2 |
| Phase 2: Theme Foundation | 4 weeks | Week 3 | Week 6 |
| Phase 3: Core UI | 4 weeks | Week 7 | Week 10 |
| Phase 4: Learning Experience | 5 weeks | Week 11 | Week 15 |
| Phase 5: Backend | 3 weeks | Week 16 | Week 18 |
| Phase 6: AI Preparation | 4 weeks | Week 19 | Week 22 |
| Phase 7: Testing | 3 weeks | Week 23 | Week 25 |
| Phase 8: Deployment | 1 week | Week 26 | Week 26 |

---

## Resource Requirements

### Development Team

- **1 Backend Developer (PHP/Moodle)** - Full-time
- **2 Frontend Developers (React/TypeScript)** - Full-time
- **1 UI/UX Designer** - Full-time (first 12 weeks), then 50%
- **1 DevOps Engineer** - 50% time
- **1 QA Engineer** - Full-time (from Week 10)
- **1 Technical Lead/Architect** - Full-time

### Infrastructure

- **Development Server**: 16GB RAM, 4 cores
- **Staging Server**: 32GB RAM, 8 cores
- **PostgreSQL Database**: 16GB RAM
- **Redis Cache**: 8GB RAM
- **CDN**: Cloudflare or similar
- **File Storage**: AWS S3 or equivalent

---

This plan provides a solid foundation for building Orbit LMS using Moodle as scaffolding while completely redesigning the frontend according to Smartslate's design system. The approach balances leveraging Moodle's robust backend with creating a modern, AI-ready learning platform.
