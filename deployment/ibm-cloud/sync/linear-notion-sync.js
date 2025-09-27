// IBM Cloud Functions - Linear ↔ Notion Sync
// Deploy: ibmcloud fn action create sync/linear-notion linear-notion-sync.js --kind nodejs:18

const { CloudantV1 } = require('@ibm-cloud/cloudant');

async function main(params) {
    const { action, type, data } = params;
    
    console.log(`Sync triggered: ${action} ${type}`);
    
    // Initialize Cloudant
    const cloudant = CloudantV1.newInstance({
        url: params.CLOUDANT_URL,
        apikey: params.CLOUDANT_APIKEY
    });
    
    if (type === 'Issue' && ['create', 'update'].includes(action)) {
        return await syncLinearToNotion(data, cloudant, params);
    }
    
    return { statusCode: 200, body: 'Event ignored' };
}

async function syncLinearToNotion(issue, cloudant, params) {
    try {
        // Map Linear issue to Notion format
        const notionData = {
            "Task Name": issue.title,
            "Status": mapStatus(issue.state?.name),
            "Priority": mapPriority(issue.priority),
            "Linear ID": issue.identifier,
            "Linear URL": issue.url,
            "IBM Service": determineIBMService(issue.title),
            "Environment": "Prod",
            "Tags": JSON.stringify(["auto-sync"])
        };
        
        // Check if page exists in Notion
        const mappingId = `linear_${issue.id}`;
        let notionPageId = null;
        
        try {
            const mapping = await cloudant.getDocument({
                db: 'sync_mappings',
                docId: mappingId
            });
            notionPageId = mapping.result.notion_page_id;
        } catch (err) {
            console.log('No existing mapping found');
        }
        
        // Create or update Notion page
        const notionUrl = notionPageId ? 
            `https://api.notion.com/v1/pages/${notionPageId}` :
            'https://api.notion.com/v1/pages';
            
        const notionPayload = notionPageId ? {
            properties: formatNotionProperties(notionData)
        } : {
            parent: { database_id: params.NOTION_DB },
            properties: formatNotionProperties(notionData)
        };
        
        const response = await fetch(notionUrl, {
            method: notionPageId ? 'PATCH' : 'POST',
            headers: {
                'Authorization': `Bearer ${params.NOTION_TOKEN}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify(notionPayload)
        });
        
        const result = await response.json();
        
        // Save mapping
        await cloudant.putDocument({
            db: 'sync_mappings',
            document: {
                _id: mappingId,
                linear_issue_id: issue.id,
                linear_identifier: issue.identifier,
                notion_page_id: result.id,
                last_synced: new Date().toISOString()
            }
        });
        
        return {
            statusCode: 200,
            body: { 
                success: true,
                action: notionPageId ? 'updated' : 'created',
                notion_page_id: result.id
            }
        };
        
    } catch (error) {
        console.error('Sync error:', error);
        return {
            statusCode: 500,
            body: { error: error.message }
        };
    }
}

function mapStatus(status) {
    const mapping = {
        'Todo': 'Backlog',
        'Backlog': 'Backlog',
        'In Progress': 'In Progress',
        'Done': 'Done'
    };
    return mapping[status] || 'Backlog';
}

function mapPriority(priority) {
    const mapping = {
        0: '4 - Low',
        1: '1 - Urgent',
        2: '2 - High', 
        3: '3 - Medium',
        4: '4 - Low'
    };
    return mapping[priority] || '3 - Medium';
}

function determineIBMService(title) {
    if (title.includes('Static') || title.includes('Object Storage')) return '["Object Storage"]';
    if (title.includes('Backend') || title.includes('Code Engine')) return '["Code Engine"]';
    if (title.includes('Functions') || title.includes('Python')) return '["Cloud Functions"]';
    if (title.includes('Database') || title.includes('Cloudant')) return '["Cloudant"]';
    if (title.includes('Setup') || title.includes('CLI')) return '["Toolchain"]';
    return '["General"]';
}

function formatNotionProperties(data) {
    const properties = {};
    
    for (const [key, value] of Object.entries(data)) {
        if (key === "Task Name") {
            properties[key] = { title: [{ text: { content: value } }] };
        } else if (["Status", "Priority", "Environment"].includes(key)) {
            properties[key] = { select: { name: value } };
        } else if (["IBM Service", "Tags"].includes(key)) {
            const options = JSON.parse(value || "[]");
            properties[key] = { multi_select: options.map(name => ({ name })) };
        } else if (key.includes("URL")) {
            properties[key] = { url: value };
        } else {
            properties[key] = { rich_text: [{ text: { content: value || "" } }] };
        }
    }
    
    return properties;
}

exports.main = main;