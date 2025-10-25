const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { WebClient } = require('@slack/web-api');

const argv = yargs(hideBin(process.argv)).argv;
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL;

const allureReportDir = argv.allureDir || 'playwright-tests/allure-report';
const summaryFile = path.join(allureReportDir, 'widgets', 'summary.json'); // updated path

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
const endTime = new Date(summaryData.time.stop);
const duration = Math.floor(summaryData.time.duration / 1000);

function formatTimestampToHHMMSS(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const startTimeParsed = startTime.toLocaleString("en-US", { hour12: true });
const stopTimeParsed = endTime.toLocaleString("en-US", { hour12: true });
const durationFormatted = formatTimestampToHHMMSS(duration);

const workflowUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

const emailBody = `
Hello,

The automation test run for Time is complete. Here's the summary:
- Total Tests: ${totalTests}
- ✅ Passed: ${passedTests}
- ❌ Failed: ${failedTests}
- 💔 Broken: ${brokenTests}
- ⚠️ Skipped: ${skippedTests}

- Start Time: ${startTimeParsed}
- Stop Time: ${stopTimeParsed}
- Duration: ${durationFormatted}

Full execution report of this run is available at:
https://gunashekarryml.github.io/time-automation/

Debug this run using the workflow link:
${workflowUrl}

Best regards,
Automation Team
`;

// Write email body to file
fs.writeFileSync('email-body.txt', emailBody);

// Export to GitHub Actions env
console.log(`email_body<<EOF
${emailBody}
EOF`);

// -------------------- Slack --------------------
if (SLACK_TOKEN && CHANNEL_ID) {
  const slackClient = new WebClient(SLACK_TOKEN);
  (async () => {
    try {
      await slackClient.chat.postMessage({
        channel: CHANNEL_ID,
        text: emailBody
      });
      console.log('Slack message sent successfully.');
    } catch (err) {
      console.error('Error sending Slack message:', err);
    }
  })();
}

console.log('Email body created successfully.');
