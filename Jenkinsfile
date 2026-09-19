pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    parameters {
        gitParameter(
            name: 'BRANCH',
            type: 'PT_BRANCH',
            branchFilter: 'origin/(.*)',
            defaultValue: 'dev',
            selectedValue: 'DEFAULT',
            sortMode: 'ASCENDING_SMART',
            quickFilterEnabled: true,
            listSize: '10',
            useRepository: 'https://(gitee\\.com/lv-chengye|github\\.com/xzmybyg)/blog\\.git',
            description: '选择要构建的远程分支'
        )
        string(name: 'PM2_APP_NAME', defaultValue: 'blog', description: 'PM2 应用名称')
    }

    environment {
        HUSKY = '0'
        CI = 'true'
        NODE_OPTIONS = '--max-old-space-size=1280'
        SOURCE_ROOT = "${WORKSPACE}\\source"
        DEPLOY_ROOT = 'C:\\dev\\blog'
        PM2_HOME = 'C:\\Users\\Administrator\\.pm2'
        PM2_CMD = 'C:\\Users\\Administrator\\AppData\\Local\\pnpm\\pm2.CMD'
        PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}\\.playwright-browsers"
    }

    stages {
        stage('Checkout') {
            steps {
                dir('source') {
                    script {
                        env.CHECKOUT_REPOSITORY = '尚未拉取'
                        deleteDir()
                        try {
                            echo "尝试从 Gitee 拉取分支：${params.BRANCH}"
                            git(
                                branch: params.BRANCH,
                                changelog: false,
                                poll: false,
                                url: 'https://gitee.com/lv-chengye/blog.git'
                            )
                            env.CHECKOUT_REPOSITORY = 'Gitee'
                        } catch (giteeError) {
                            echo "Gitee 拉取失败：${giteeError.message}"
                            deleteDir()
                            try {
                                git(
                                    branch: params.BRANCH,
                                    changelog: false,
                                    poll: false,
                                    url: 'https://github.com/xzmybyg/blog.git'
                                )
                                env.CHECKOUT_REPOSITORY = 'GitHub'
                            } catch (githubError) {
                                echo "GitHub 拉取失败：${githubError.message}"
                                error('Gitee 和 GitHub 均拉取失败，流水线终止。')
                            }
                        }
                    }

                    bat encoding: 'UTF-8', script: '''
@echo off
chcp 65001 >nul
echo Checkout repository: %CHECKOUT_REPOSITORY%
git branch --show-current
if errorlevel 1 exit /b 1
git log -1 --oneline
if errorlevel 1 exit /b 1
'''
                }
            }
        }

        stage('Install dependencies') {
            steps {
                dir('source') {
                    bat encoding: 'UTF-8', script: '''
@echo off
chcp 65001 >nul
call pnpm install --no-frozen-lockfile
if errorlevel 1 exit /b 1
call pnpm --dir blog-web exec playwright install chromium
if errorlevel 1 exit /b 1
'''
                }
            }
        }

        stage('Code quality and tests') {
            steps {
                dir('source') {
                    bat encoding: 'UTF-8', script: '''
@echo off
chcp 65001 >nul
call pnpm lint
if errorlevel 1 exit /b 1
call pnpm test:ci
if errorlevel 1 exit /b 1
'''
                }
            }
        }

        stage('Build frontend') {
            steps {
                dir('source') {
                    bat encoding: 'UTF-8', script: '''
@echo off
chcp 65001 >nul
call pnpm --filter blog-web run build
if errorlevel 1 exit /b 1
if not exist "blog-web\\blog\\index.html" exit /b 2
'''
                }
            }
        }

        stage('Browser E2E') {
            steps {
                dir('source') {
                    bat encoding: 'UTF-8', script: '''
@echo off
chcp 65001 >nul
set "NODE_OPTIONS=--max-old-space-size=384"
call pnpm test:e2e
if errorlevel 1 exit /b 1
'''
                }
            }
        }

        stage('Deploy and verify') {
            steps {
                bat encoding: 'UTF-8', script: '''
@echo off
chcp 65001 >nul
if not exist "%PM2_CMD%" (
    echo ERROR: PM2 executable was not found: %PM2_CMD%
    exit /b 2
)

set "RELEASE_SHA="
for /f %%I in ('git -C "%SOURCE_ROOT%" rev-parse HEAD') do set "RELEASE_SHA=%%I"
if not defined RELEASE_SHA (
    echo ERROR: Unable to determine the checked out commit.
    exit /b 3
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SOURCE_ROOT%\\scripts\\deploy-windows.ps1" -WorkspaceRoot "%SOURCE_ROOT%" -DeployRoot "%DEPLOY_ROOT%" -ReleaseSha "%RELEASE_SHA%" -Pm2Command "%PM2_CMD%" -PnpmCommand "pnpm.cmd" -AppName "%PM2_APP_NAME%" -Port 8080
if errorlevel 1 (
    echo ERROR: Protected deployment or verification failed.
    exit /b 1
)
'''
            }
        }
    }

    post {
        success {
            echo '构建和部署成功。'
            echo "代码仓库：${env.CHECKOUT_REPOSITORY}"
            echo "构建分支：${params.BRANCH}"
            echo "PM2 应用：${params.PM2_APP_NAME}"
        }
        failure {
            echo '构建或部署失败，请检查控制台中第一个出现 ERROR 的阶段。'
            echo "最后尝试的代码仓库：${env.CHECKOUT_REPOSITORY}"
            echo "构建分支：${params.BRANCH}"
            echo "PM2 应用：${params.PM2_APP_NAME}"
        }
        always {
            junit allowEmptyResults: true, testResults: 'source/reports/*.xml'
            archiveArtifacts allowEmptyArchive: true, artifacts: 'source/reports/**/*'
            echo '流水线执行结束。'
        }
    }
}
