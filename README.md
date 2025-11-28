# 📋 Airtable-Connected Dynamic Form Builder

A full-stack MERN application that allows users to create custom forms connected to Airtable bases, with conditional logic, real-time validation, and webhook synchronization.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-green.svg)

## ✨ Features

### Core Features

-   ✅ **Airtable OAuth Integration** - Secure login with Airtable account
-   ✅ **Dynamic Form Builder** - Create forms from Airtable bases
-   ✅ **Conditional Logic** - Show/hide fields based on answers
-   ✅ **5 Field Types Supported**:
    -   Single line text
    -   Multi-line text
    -   Single select (dropdown)
    -   Multiple selects (checkboxes)
    -   File attachments
-   ✅ **Dual Storage** - Save to Airtable + MongoDB
-   ✅ **Webhook Sync** - Auto-update when Airtable data changes
-   ✅ **Response Management** - View, delete, and analyze submissions

### Bonus Features

-   📊 **Analytics Dashboard** - Visual insights and distributions
-   📥 **Export** - Download responses as JSON or CSV
-   👁️ **Preview Mode** - Test forms without submitting
-   ✏️ **Edit Forms** - Modify existing form configurations
-   🔗 **Share Links** - Copy public form URLs
-   📈 **Statistics** - Track response rates and trends

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │Dashboard │  │  Form    │  │ Response │  │Analytics││
│  │          │→ │ Builder  │→ │  Viewer  │→ │         ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└────────────────────┬────────────────────────────────────┘
                     │ Axios HTTP
┌────────────────────▼────────────────────────────────────┐
│                  Backend (Express.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │   Auth   │  │  Forms   │  │Responses │  │Webhooks ││
│  │  Routes  │  │  Routes  │  │  Routes  │  │ Routes  ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└────────┬──────────────────────┬──────────────────┬──────┘
         │                      │                  │
    ┌────▼────┐          ┌──────▼──────┐    ┌─────▼─────┐
    │ MongoDB │          │  Airtable   │    │  Airtable │
    │Database │          │     API     │    │  Webhooks │
    └─────────┘          └─────────────┘    └───────────┘
```

## 📊 Data Models

### User Model

```javascript
{
  airtableUserId: String,      // Unique Airtable user ID
  email: String,               // User email
  name: String,                // User display name
  accessToken: String,         // OAuth access token (encrypted)
  refreshToken: String,        // OAuth refresh token
  tokenExpiresAt: Date,        // Token expiration
  lastLogin: Date,             // Last login timestamp
  createdAt: Date,             // Account creation
  updatedAt: Date              // Last update
}
```

### Form Model

```javascript
{
  owner: ObjectId,             // Reference to User
  title: String,               // Form title
  airtableBaseId: String,      // Airtable base ID
  airtableTableId: String,     // Airtable table ID
  isActive: Boolean,           // Form accepting responses
  questions: [
    {
      questionKey: String,     // Internal key (q1, q2, etc.)
      airtableFieldId: String, // Airtable field ID
      label: String,           // Display label
      type: String,            // Field type
      required: Boolean,       // Is required
      options: [String],       // For select fields
      conditionalRules: {      // Visibility rules
        logic: "AND" | "OR",
        conditions: [
          {
            questionKey: String,
            operator: "equals" | "notEquals" | "contains",
            value: Any
          }
        ]
      }
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Response Model

```javascript
{
  formId: ObjectId,            // Reference to Form
  airtableRecordId: String,    // Airtable record ID
  answers: Map,                // Question keys → answers
  deletedInAirtable: Boolean,  // Soft delete flag
  createdAt: Date,             // Submission time
  updatedAt: Date              // Last update (from webhook)
}
```

## 🧠 Conditional Logic Explained

### How It Works

The conditional logic engine determines field visibility based on user answers in real-time.

#### Core Function

```javascript
function shouldShowQuestion(rules, answersSoFar) {
    // If no rules, always show
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
        return true;
    }

    // Evaluate each condition
    const results = rules.conditions.map((condition) => {
        const answer = answersSoFar[condition.questionKey];

        if (answer === undefined || answer === null) {
            return false;
        }

        switch (condition.operator) {
            case "equals":
                return answer === condition.value;
            case "notEquals":
                return answer !== condition.value;
            case "contains":
                if (typeof answer === "string") {
                    return answer.includes(condition.value);
                }
                if (Array.isArray(answer)) {
                    return answer.includes(condition.value);
                }
                return false;
            default:
                return false;
        }
    });

    // Combine results
    if (rules.logic === "AND") {
        return results.every((r) => r === true);
    } else {
        // OR
        return results.some((r) => r === true);
    }
}
```

### Example Scenarios

#### Example 1: Simple Condition

```javascript
// Show GitHub URL only if role is "Engineer"
{
  logic: "AND",
  conditions: [
    {
      questionKey: "q1",  // role field
      operator: "equals",
      value: "Engineer"
    }
  ]
}
```

#### Example 2: Multiple Conditions (AND)

```javascript
// Show team field if role is Engineer AND experience is Senior
{
  logic: "AND",
  conditions: [
    {
      questionKey: "q1",
      operator: "equals",
      value: "Engineer"
    },
    {
      questionKey: "q2",
      operator: "contains",
      value: "Senior"
    }
  ]
}
```

#### Example 3: Multiple Conditions (OR)

```javascript
// Show budget field if role is Manager OR Director
{
  logic: "OR",
  conditions: [
    {
      questionKey: "q1",
      operator: "equals",
      value: "Manager"
    },
    {
      questionKey: "q1",
      operator: "equals",
      value: "Director"
    }
  ]
}
```

### Supported Operators

| Operator    | Description              | Example                                 |
| ----------- | ------------------------ | --------------------------------------- |
| `equals`    | Exact match              | `role === "Engineer"`                   |
| `notEquals` | Not equal                | `role !== "Intern"`                     |
| `contains`  | String or array contains | `"Senior Developer".includes("Senior")` |

### Logic Operators

-   **AND**: All conditions must be true
-   **OR**: At least one condition must be true

## 🔐 Airtable OAuth Setup

### Step 1: Create OAuth Integration

1. Go to **https://airtable.com/create/oauth**
2. Click **"Register new OAuth integration"**

### Step 2: Configure Integration

Fill in the following details:

```
Integration name: Form Builder App

Description: Dynamic form builder with conditional logic

Redirect URLs:
http://localhost:5173/auth/callback
https://yourdomain.com/auth/callback (for production)

Scopes (check these):
☑ data.records:read
☑ data.records:write
☑ schema.bases:read
☑ webhook:manage (optional)
```

### Step 3: Save Credentials

After creation, you'll receive:

-   **Client ID**: Starts with `app` (e.g., `appABC1234567890XY`)
-   **Client Secret**: Click "Generate" to create

⚠️ **Important**:

-   Client ID must start with `app` (not UUID format)
-   Keep Client Secret secure
-   Never commit credentials to git

### Step 4: Configure Environment Variables

**Backend `.env`**

```bash
AIRTABLE_CLIENT_ID=appYOURCLIENTIDHERE
AIRTABLE_CLIENT_SECRET=your_client_secret_here
AIRTABLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

**Frontend `.env`**

```bash
VITE_AIRTABLE_CLIENT_ID=appYOURCLIENTIDHERE
```

## 🪝 Webhook Configuration

### Setup Airtable Webhooks

Webhooks keep your database in sync when Airtable records change.

### Step 1: Expose Local Server (Development)

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 5000
ngrok http 5000

# You'll get a URL like: https://abc123.ngrok.io
```

### Step 2: Configure Webhook in Airtable

1. Go to your Airtable base
2. Click **Automations** → **Create automation**
3. Choose **Webhook** trigger
4. Configure webhook:

```
URL: https://abc123.ngrok.io/api/webhooks/airtable
Method: POST
Include: Record updates, deletions
```

### Step 3: Webhook Payload Structure

Airtable sends this payload:

```json
{
    "base": {
        "id": "appXXXXXXXXXXXXXX"
    },
    "webhook": {
        "changedTablesById": {
            "tblYYYYYYYYYYYYYY": {
                "changedRecordsById": {
                    "recZZZZZZZZZZZZZZ": {
                        "current": {
                            /* updated fields */
                        },
                        "previous": {
                            /* old fields */
                        }
                    }
                },
                "destroyedRecordIds": ["recAAAAAAAAAAAAA"]
            }
        }
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 4: Backend Handler

The backend automatically handles:

-   **Record Updates**: Updates `updatedAt` timestamp
-   **Record Deletions**: Sets `deletedInAirtable: true`

```javascript
// backend/routes/webhooks.js handles this automatically
router.post("/airtable", async (req, res) => {
    // Process webhook
    // Update MongoDB records
    // No manual intervention needed
});
```

### Production Webhook Setup

For production, use your actual domain:

```
Webhook URL: https://yourdomain.com/api/webhooks/airtable
```

## 🚀 Installation & Setup

### Prerequisites

-   **Node.js** ≥ 18.0.0
-   **MongoDB** ≥ 6.0
-   **Airtable Account** with OAuth integration
-   **npm** or **yarn**

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/airtable-form-builder.git
cd airtable-form-builder
```

### Step 2: Install MongoDB

**macOS (Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**

```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from https://www.mongodb.com/try/download/community

**Verify installation:**

```bash
mongosh
# Should connect without errors
```

### Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/airtable-forms

# Replace with your actual Airtable credentials
AIRTABLE_CLIENT_ID=appYOURCLIENTIDHERE
AIRTABLE_CLIENT_SECRET=your_client_secret_here
AIRTABLE_REDIRECT_URI=http://localhost:5173/auth/callback

# Generate with: openssl rand -base64 32
JWT_SECRET=$(openssl rand -base64 32)

FRONTEND_URL=http://localhost:5173
EOL

# Start backend server
npm run dev
```

**Expected output:**

```
✅ Server running on port 5000
✅ MongoDB connected
```

### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOL
VITE_AIRTABLE_CLIENT_ID=appYOURCLIENTIDHERE
EOL

# Start frontend server
npm run dev
```

**Expected output:**

```
VITE ready in 500ms
➜  Local:   http://localhost:5173/
```

### Step 5: Verify Setup

1. Open **http://localhost:5173** in browser
2. Click **"Login with Airtable"**
3. Authorize the application
4. You should be redirected to the dashboard

## 🎯 How to Run the Project

### Development Mode

**Terminal 1 - MongoDB:**

```bash
# Start MongoDB
mongod
# OR
brew services start mongodb-community
```

**Terminal 2 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**

```bash
cd frontend
npm run dev
```

### Production Mode

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## 📖 Usage Guide

### 1. Create a Form

1. **Login** with Airtable
2. Click **"Create New Form"**
3. **Step 1**: Enter form title
4. **Step 2**: Select Airtable Base
5. **Step 3**: Select Table
6. **Step 4**: Configure fields:
    - Select fields to include
    - Rename labels
    - Mark as required
    - Add conditional logic
7. Click **"Create Form"**

### 2. Add Conditional Logic

```
Example: Show GitHub URL only for Engineers

1. In field configuration, click "+ Add conditional logic"
2. Select logic operator: "AND" or "OR"
3. Add condition:
   - If "Role" (dropdown)
   - equals "Engineer"
4. The GitHub field will now show/hide based on role selection
```

### 3. Preview Form

1. From dashboard, click **"Preview"** on any form
2. Test the form (submissions won't be saved)
3. Verify conditional logic works correctly

### 4. Share Form

1. Click **"Copy Share Link"** on form card
2. Share the link: `http://localhost:5173/form/[formId]`
3. Recipients can fill the form without logging in

### 5. View Responses

1. Click **"Responses"** on form card
2. See all submissions in table format
3. Click **"View"** to see individual response details
4. Click **"Analytics"** for visual insights
5. Click **"Export"** to download as JSON or CSV

### 6. Edit Form

1. Click **"Edit"** on form card
2. Modify title, fields, or conditional logic
3. Click **"Save Changes"**

⚠️ **Note**: Editing a form doesn't affect existing responses

## 📁 Project Structure

```
airtable-form-builder/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Form.js
│   │   └── Response.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── forms.js
│   │   ├── responses.js
│   │   ├── webhooks.js
│   │   └── analytics.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── airtable.js
│   │   └── conditionalLogic.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormBuilder/
│   │   │   │   ├── BaseSelector.jsx
│   │   │   │   ├── TableSelector.jsx
│   │   │   │   ├── FieldSelector.jsx
│   │   │   │   └── ConditionalLogic.jsx
│   │   │   ├── FormViewer/
│   │   │   │   ├── FormRenderer.jsx
│   │   │   │   └── QuestionField.jsx
│   │   │   ├── FormCard.jsx
│   │   │   ├── ResponseStats.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── AuthCallback.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateForm.jsx
│   │   │   ├── EditForm.jsx
│   │   │   ├── FormPreview.jsx
│   │   │   ├── FillForm.jsx
│   │   │   ├── ViewResponses.jsx
│   │   │   ├── ViewSingleResponse.jsx
│   │   │   ├── ExportResponses.jsx
│   │   │   └── FormAnalytics.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔒 Security Best Practices

1. **Never commit `.env` files**

    ```bash
    # Add to .gitignore
    .env
    .env.local
    .env.*.local
    ```

2. **Use environment variables**

    - All secrets in `.env`
    - Different values for dev/prod

3. **Rotate tokens periodically**

    - Regenerate client secret every 3-6 months
    - Update in both Airtable and `.env`

4. **Use HTTPS in production**

    - Required by Airtable OAuth
    - Use Let's Encrypt for free SSL

5. **Validate all inputs**
    - Backend validates all form submissions
    - Frontend validates before submission

## 🙏 Acknowledgments

-   [Airtable API](https://airtable.com/developers/web/api) - For the excellent API
-   [React](https://react.dev/) - Frontend framework
-   [Express.js](https://expressjs.com/) - Backend framework
-   [MongoDB](https://www.mongodb.com/) - Database
-   [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**Built with ❤️ using the MERN Stack**

⭐ Star this repo if you find it helpful!
