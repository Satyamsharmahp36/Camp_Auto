import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const webhookTriggers = [];
const campaigns = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/sheets/analyze', async (req, res) => {
  try {
    const { sheetUrl } = req.body;
    
    const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return res.status(400).json({ error: 'Invalid Google Sheets URL' });
    }
    
    const sheetId = sheetIdMatch[1];
    
    let gidMatch = sheetUrl.match(/gid=(\d+)/);
    let gid = gidMatch ? gidMatch[1] : '0';
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
    
    try {
      const response = await fetch(csvUrl, {
        headers: {
          'Accept': 'text/csv'
        },
        redirect: 'follow'
      });
      
      const csvText = await response.text();
      
      if (csvText.includes('API key') || csvText.includes('<!DOCTYPE') || csvText.includes('<html')) {
        throw new Error('Sheet not accessible');
      }
      const rows = csvText.split('\n').map(row => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let char of row) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      });
      
      const headers = rows[0] || [];
      const sampleData = rows.slice(1, 6);
      
      const columnAnalysis = headers.map((header, index) => {
        const values = sampleData.map(row => row[index]).filter(Boolean);
        const isNumeric = values.length > 0 && values.every(v => !isNaN(parseFloat(v)));
        return {
          name: header,
          index,
          type: isNumeric ? 'number' : 'text',
          sampleValues: values.slice(0, 3)
        };
      });
      
      res.json({
        sheetId,
        title: 'Inventory Feed',
        sheets: ['Sheet1'],
        columns: columnAnalysis,
        rowCount: rows.length - 1,
        headers
      });
      
    } catch (fetchError) {
      const mockColumns = [
        { name: 'ID', index: 0, type: 'number', sampleValues: ['1', '2', '3'] },
        { name: 'ProductName', index: 1, type: 'text', sampleValues: ['Widget A', 'Widget B', 'Gadget X'] },
        { name: 'Category', index: 2, type: 'text', sampleValues: ['Electronics', 'Home', 'Electronics'] },
        { name: 'Price', index: 3, type: 'number', sampleValues: ['29.99', '49.99', '99.99'] },
        { name: 'Stock', index: 4, type: 'number', sampleValues: ['150', '3', '25'] },
        { name: 'Discount', index: 5, type: 'number', sampleValues: ['10', '0', '15'] },
        { name: 'Rating', index: 6, type: 'number', sampleValues: ['4.5', '4.2', '4.8'] },
        { name: 'Availability', index: 7, type: 'text', sampleValues: ['In Stock', 'Low Stock', 'In Stock'] }
      ];
      
      res.json({
        sheetId,
        title: 'Inventory Feed (Demo Mode)',
        sheets: ['Feed', 'Archive'],
        columns: mockColumns,
        rowCount: 150,
        headers: mockColumns.map(c => c.name),
        demoMode: true,
        note: 'Using demo data. To use real data, share your sheet as "Anyone with link can view"'
      });
    }
  } catch (error) {
    console.error('Sheet analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaign/create', async (req, res) => {
  try {
    const { 
      title, 
      sheetId, 
      sheetUrl,
      columns, 
      filters, 
      thresholdCondition,
      webhookUrl 
    } = req.body;
    
    const campaign = {
      id: `camp_${Date.now()}`,
      title,
      sheetId,
      sheetUrl,
      columns,
      filters,
      thresholdCondition,
      webhookUrl: webhookUrl || `${req.protocol}://${req.get('host')}/api/webhook/trigger`,
      createdAt: new Date().toISOString(),
      status: 'active',
      triggerCount: 0
    };
    
    campaigns.push(campaign);
    
    res.json({ 
      success: true, 
      campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/generate-query', async (req, res) => {
  try {
    const { columns, filters, thresholdCondition } = req.body;
    
    const prompt = `You are an expert at Google Sheets formulas. Generate a Google Sheets formula that will check inventory conditions.

Given these columns: ${JSON.stringify(columns)}

User wants to monitor these conditions:
${filters.map(f => `- ${f.column} ${f.operator} ${f.value}`).join('\n')}

Threshold condition: ${thresholdCondition}

Generate:
1. A COUNTIFS or FILTER formula that counts/identifies rows matching these conditions
2. A threshold check formula that returns TRUE when action is needed
3. Brief explanation of what the formula does

Respond in this exact JSON format:
{
  "countFormula": "=COUNTIFS(...)",
  "filterFormula": "=FILTER(...)",
  "thresholdFormula": "=IF(countFormula > threshold, TRUE, FALSE)",
  "explanation": "Brief explanation",
  "triggerCondition": "When to trigger the webhook"
}`;

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a Google Sheets formula expert. Always respond with valid JSON only, no markdown.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    res.json(parsed);
  } catch (error) {
    console.error('AI query generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/generate-apps-script', async (req, res) => {
  try {
    const { sheetId, columns, filters, thresholdFormula, webhookUrl } = req.body;
    
    // Build column index variables
    const columnIndexVars = filters.map((f, i) => {
      return `  var col${i} = headers.indexOf('${f.column}');`;
    }).join('\n');
    
    // Build filter conditions for checking
    const filterConditions = filters.map((f, i) => {
      const colVar = `col${i}`;
      if (f.operator === '=' || f.operator === '==') {
        return `String(row[${colVar}]).trim() === '${f.value}'`;
      } else if (f.operator === '!=' || f.operator === '<>') {
        return `String(row[${colVar}]).trim() !== '${f.value}'`;
      } else if (f.operator === 'contains') {
        return `String(row[${colVar}]).toLowerCase().indexOf('${f.value.toLowerCase()}') !== -1`;
      } else {
        return `parseFloat(row[${colVar}]) ${f.operator} ${f.value}`;
      }
    }).join(' && ');
    
    const conditionDescription = filters.map(f => `${f.column} ${f.operator} ${f.value}`).join(', ');
    const monitoredColumns = filters.map(f => f.column);
    
    // For relevance check - use first filter as subject identifier
    const subjectFilter = filters[0];
    const subjectCondition = `String(row[col0]).trim() === '${subjectFilter.value}'`;
    
    const script = `var WEBHOOK_URL = 'https://brooks-incondite-jabberingly.ngrok-free.dev/api/webhook/trigger';
var SHEET_ID = '${sheetId}';
var CONDITION_DESCRIPTION = '${conditionDescription}';
var MONITORED_COLUMNS = [${monitoredColumns.map(c => `'${c}'`).join(', ')}];
var DEBOUNCE_MS = 3000;

function handleEdit(e) {
  if (!e || !e.source || !e.range) return;
  
  var now = new Date().getTime();
  var props = PropertiesService.getScriptProperties();
  var lastTrigger = parseInt(props.getProperty('lastTriggerTime') || '0');
  
  if (now - lastTrigger < DEBOUNCE_MS) return;
  
  var sheet = e.source.getActiveSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var editedCol = e.range.getColumn();
  var editedColName = headers[editedCol - 1];
  var editedRow = e.range.getRow();
  
  var isMonitoredColumn = MONITORED_COLUMNS.indexOf(editedColName) !== -1;
  
  if (isMonitoredColumn && editedRow > 1) {
    props.setProperty('lastTriggerTime', String(now));
    checkStateChange(sheet, headers, editedRow, e.oldValue, e.value);
  }
}

function checkStateChange(sheet, headers, editedRow, oldValue, newValue) {
  var row = sheet.getRange(editedRow, 1, 1, sheet.getLastColumn()).getValues()[0];
${columnIndexVars}
  var isRelevantRow = ${subjectCondition};
  if (!isRelevantRow) return;
  var conditionMet = ${filterConditions};
  var props = PropertiesService.getScriptProperties();
  var stateKey = 'row_' + editedRow + '_state';
  var previousState = props.getProperty(stateKey);
  var currentState = conditionMet ? 'healthy' : 'broken';
  props.setProperty(stateKey, currentState);
  if (previousState && previousState !== currentState) {
    var changeType = currentState === 'broken' ? 'CONDITION BROKE' : 'CONDITION RESTORED';
    var productName = row[headers.indexOf('ProductName')] || row[1] || 'Row ' + editedRow;
    sendWebhook([{
      rowNumber: editedRow,
      productName: productName,
      changeType: changeType,
      oldValue: oldValue,
      newValue: newValue,
      reason: changeType + ' for ' + productName
    }], changeType);
  } else if (!previousState) {
    props.setProperty(stateKey, currentState);
  }
}

function sendWebhook(affectedRows, alertType) {
  var payload = {
    sheetId: SHEET_ID,
    triggeredAt: new Date().toISOString(),
    conditionsMet: alertType + ': ' + CONDITION_DESCRIPTION,
    affectedRows: affectedRows.length,
    rows: affectedRows
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    UrlFetchApp.fetch(WEBHOOK_URL, options);
    Logger.log('Webhook sent (' + alertType + '): ' + affectedRows.length + ' rows');
  } catch (e) {
    Logger.log('Webhook error: ' + e);
  }
}

function setup() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger('handleEdit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  initializeStates();
  Logger.log('Setup complete. Condition: ' + CONDITION_DESCRIPTION);
}

function initializeStates() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var data = sheet.getDataRange().getValues();
  var props = PropertiesService.getScriptProperties();
  var allProps = props.getProperties();
  for (var key in allProps) {
    if (key.indexOf('row_') === 0) props.deleteProperty(key);
  }
${columnIndexVars}
  var count = 0;
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var isRelevantRow = ${subjectCondition};
    if (!isRelevantRow) continue;
    var conditionMet = ${filterConditions};
    var stateKey = 'row_' + (i + 1) + '_state';
    props.setProperty(stateKey, conditionMet ? 'healthy' : 'broken');
    count++;
  }
  Logger.log('Initialized ' + count + ' rows');
}

function testWebhook() {
  sendWebhook([{ rowNumber: 1, productName: 'Test', reason: 'Manual test' }], 'TEST');
}`;

    res.json({ script });
  } catch (error) {
    console.error('Apps Script generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhook/trigger', (req, res) => {
  const { sheetId, triggeredAt, conditionsMet, affectedRows, campaignId } = req.body;
  
  const trigger = {
    id: `trig_${Date.now()}`,
    sheetId,
    campaignId,
    triggeredAt: triggeredAt || new Date().toISOString(),
    conditionsMet,
    affectedRows,
    receivedAt: new Date().toISOString(),
    status: 'received'
  };
  
  webhookTriggers.push(trigger);
  
  const campaign = campaigns.find(c => c.sheetId === sheetId || c.id === campaignId);
  if (campaign) {
    campaign.triggerCount++;
    campaign.lastTriggered = trigger.receivedAt;
  }
  
  console.log('Webhook triggered:', trigger);
  
  res.json({ 
    success: true, 
    triggerId: trigger.id,
    message: 'Trigger received, campaign update initiated'
  });
});

app.get('/api/campaigns', (req, res) => {
  res.json(campaigns);
});

app.get('/api/campaigns/:id', (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(campaign);
});

app.get('/api/triggers', (req, res) => {
  res.json(webhookTriggers.slice(-50).reverse());
});

app.delete('/api/campaigns/:id', (req, res) => {
  const index = campaigns.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  campaigns.splice(index, 1);
  res.json({ success: true, message: 'Campaign deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
