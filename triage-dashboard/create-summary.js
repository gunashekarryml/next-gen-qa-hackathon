const fs = require('fs');
const path = require('path');
const { WebClient } = require('@slack/web-api');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;
const allureDir = argv.allureDir || './playwright-tests/allure-report';
const dashboardUrl = argv.dashboardUrl;
const allureUrl = argv.allureUrl;

const summaryFile = path.join(allureDir, 'widgets', 'summary.json');

if (!fs.existsSync(summaryFile)) {
    console.error(`Allure summary.json missing at ${summaryFile}`);
    process.exit(1);
}

const summaryData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));
const totalTests = summaryData.statistic.total;
const passedTests = summaryData.statistic.passed;
const failedTests = summaryData.statistic.failed;
const brokenTests = summaryData.statistic.broken;
const skippedTests = summaryData.statistic.skipped;

const startTime = new Date(summaryData.time.start);
const stopTime = new Date(summaryData.time.stop);
const durationSeconds = summaryData.time.duration;

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

const duration = formatDuration(durationSeconds);

// Workflow URL
const repo = process.env.GITHUB_REPOSITORY;
const runId = process.env.GITHUB_RUN_ID;
const workflowUrl = `https://github.com/${repo}/actions/runs/${runId}`;

const EMAIL_BODY = `
Hello,

The automation test run for Hackathon is complete. Here's the summary:
- Total Tests: ${totalTests}
- ✅ Passed: ${passedTests}
- ❌ Failed: ${failedTests}
- 💔 Broken: ${brokenTests}
- ⚠️ Skipped: ${skippedTests}

- Start Time: ${startTime.toLocaleString()}
- Stop Time: ${stopTime.toLocaleString()}
- Duration: ${duration}

Full execution report (Dashboard) is available at:
${dashboardUrl}

Allure detailed report is available at:
${allureUrl}

Debug this run using the workflow link:
${workflowUrl}

Best regards,
NextGen QA Team
`;

// Save to GitHub ENV for email
fs.writeFileSync('email-body.txt', EMAIL_BODY);
fs.appendFileSync(process.env.GITHUB_ENV, `email_body<<EOF\n${EMAIL_BODY}\nEOF\n`);
console.log('Email body created successfully.');

// Send Slack if configured
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL;

if (SLACK_TOKEN && SLACK_CHANNEL) {
    (async () => {
        try {
            const client = new WebClient(SLACK_TOKEN);
            await client.chat.postMessage({
                channel: SLACK_CHANNEL,
                text: EMAIL_BODY
            });
            console.log('Slack message sent successfully.');
        } catch (err) {
            console.error('Error sending Slack message:', err);
        }
    })();
} else {
    console.log('Slack token or channel not provided; skipping Slack notification.');
}
