const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { WebClient } = require('@slack/web-api');

const argv = yargs(process.argv.slice(2)).argv;
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL;
const repo = process.env.GITHUB_REPOSITORY;
const runId = process.env.GITHUB_RUN_ID;

// Dynamic Allure report folder
const allureReportDir = argv.allureDir 
  ? path.resolve(argv.allureDir) 
  : path.resolve(__dirname, '../playwright-tests/allure-report');

const summaryFile = path.join(allureReportDir, 'summary.json');

if (!fs.existsSync(summaryFile)) {
  console.error('Allure summary.json missing at', allureReportDir);
  process.exit(1);
}

// Read Allure summary
const summaryData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));
const { total, passed, failed, broken, skipped } = summaryData.statistic;
const startTime = new Date(summaryData.time.start);
const endTime = new Date(summaryData.time.stop);
const duration = formatTimestampToTime(summaryData.time.duration);

// Format dates
const startTimeParsed = startTime.toLocaleString("en-US", { hour12: true });
const stopTimeParsed = endTime.toLocaleString("en-US", { hour12: true });

// Dashboard & Allure URLs
const dashboardURL = `https://<your-org>.github.io/triage-dashboard/`;
const allureURL = `https://<your-org>.github.io/time-automation/`;

// Email body
const emailBody = `
Hello,

The automation test run for Time is complete. Here's the summary:
- Total Tests: ${total}
- ✅ Passed: ${passed}
- ❌ Failed: ${failed}
- 💔 Broken: ${broken}
- ⚠️ Skipped: ${skipped}

- Start Time: ${startTimeParsed}
- Stop Time: ${stopTimeParsed}
- Duration: ${duration}

Full execution report (Allure) is available at: ${allureURL}
Triage Dashboard: ${dashboardURL}

Workflow link: https://github.com/${repo}/actions/runs/${runId}

Best regards,  
Automation Team
`;

fs.writeFileSync('email-body.txt', emailBody);
console.log('Email body created successfully.');

// Slack visual summary
if (SLACK_TOKEN && CHANNEL_ID) {
  const slackClient = new WebClient(SLACK_TOKEN);

  const totalBlocks = 20;
  const passedBlocks = Math.round((passed / total) * totalBlocks);
  const failedBlocks = Math.round((failed / total) * totalBlocks);
  const brokenBlocks = Math.round((broken / total) * totalBlocks);
  const skippedBlocks = totalBlocks - passedBlocks - failedBlocks - brokenBlocks;
  const bar = '🟩'.repeat(passedBlocks) + '🟥'.repeat(failedBlocks) + '🟧'.repeat(brokenBlocks) + '⬜'.repeat(skippedBlocks);

  const slackMessage = {
    channel: CHANNEL_ID,
    text: `Automation Run Completed`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `*Automation Test Summary*` } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Total Tests:*\n${total}` },
          { type: "mrkdwn", text: `*✅ Passed:*\n${passed}` },
          { type: "mrkdwn", text: `*❌ Failed:*\n${failed}` },
          { type: "mrkdwn", text: `*💔 Broken:*\n${broken}` },
          { type: "mrkdwn", text: `*⚠️ Skipped:*\n${skipped}` },
          { type: "mrkdwn", text: `*Duration:*\n${duration}` }
        ]
      },
      { type: "section", text: { type: "mrkdwn", text: `*Visual Summary:*\n${bar}` } },
      {
        type: "actions",
        elements: [
          { type: "button", text: { type: "plain_text", text: "Allure Report" }, url: allureURL },
          { type: "button", text: { type: "plain_text", text: "Dashboard" }, url: dashboardURL }
        ]
      },
      { type: "context", elements: [{ type: "mrkdwn", text: `Workflow link: https://github.com/${repo}/actions/runs/${runId}` }] }
    ]
  };

  slackClient.chat.postMessage(slackMessage)
    .then(() => console.log('Slack message sent successfully!'))
    .catch(err => console.error('Error sending Slack message:', err));
} else {
  console.warn('Slack token or channel missing. Skipping Slack notification.');
}

// Helper function
function formatTimestampToTime(timestamp) {
  const totalSeconds = Math.floor(timestamp / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map(n => String(n).padStart(2, '0')).join(':');
}
