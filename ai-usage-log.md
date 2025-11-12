#### **AI Assistance Disclosure**
**Tool**: ChatGPT  
**Scope**: Generated basic Markdown design for this log.  
**Author review**: Edited for style.  

---

# AI Usage Log
This document compiles all the use of AI throughout the project as specified by the file-header attribution at the top of each AI-influenced file.

Each use case is described by the AI tool used, scope of the prompt and any revisions made by the author.

---

## db

### init-mongo.sh
**Tool**: ChatGPT

**Scope**: Debugged to ensure successful MongoDB connection and proper replica set initialisation.

**Author review**: Validated correctness.

---

## UI

### READEME.md
**Tool**: Microsoft Copilot  

**Scope**:
- Generated service description.
- Generated list of installation steps.
- Generated basic Markdown design.

**Author review**:
- Validated correctness of service description and installation steps.
- Edited for style.

---

### questions/page.tsx
**Tool**: ChatGPT

**Scope**:
- Generated initial HTML code.
- Generated code implementation for several functions.  
- Debugged several parts in function implementations.

**Author review**:
- Validated correctness.
- Modified HTML code and tailwind styles.

---

### users/page.tsx
**Tool**: Microsoft Copilot

**Scope**:
- Generated initial HTML code.
- Generated code implementation for several functions.  
- Debugged several parts in function implementations.

**Author review**:
- Validated correctness.
- Modified HTML code and tailwind styles.
- Added boundary checks for search data.

---

### login/page.tsx
**Tool**: Microsoft Copilot

**Scope**: Generated initial HTML code.

**Author review**:
- Validated correctness.
- Modified HTML code and styling.

---

### collaboration/page.tsx
**Tool**: ChatGPT

**Scope**:
- Generated initial HTML and Socket.IO code.
- Generated code implementation for Yjs retrieval and injection.  
- Discovering library for compilation functionality.
- Debugged several parts in function implementation.

**Author review**:
- Validated correctness.
- Modified generated HTML code and styling.
- Added room creation and closure logic.
- Added user interaction logic.

---

### matching/page.tsx
**Tool**: ChatGPT, Microsoft Copilot

**Scope**:
- Generated initial HTML code.
- Generated initial code implementation for match handling via Socket.IO.  
- Debugged several parts in match handling logic.

**Author review**:
- Validated correctness.
- Designed HTML code for different screens depending on current states.
- Modified generated HTML code and styling.

---

### profile/page.tsx
**Tool**: Microsoft Copilot

**Scope**:
- Generated initial HTML code.
- Generated code implementation for several functions.

**Author review**:
- Validated correctness.
- Modified HTML code and tailwind styles.

---

### Header.tsx
**Tool**: Microsoft Copilot

**Scope**: Generated initial HTML code consisting of title section, user avatar and logout button.

**Author review**:
- Validated correctness.
- Edited tailwind styles. 
- Modified user info to fit with our schema.
- Added admin link and gear icon.

---

### Spinner.tsx
**Tool**: Microsoft Copilot

**Scope**:
- Generated initial HTML code.
- Generated size and color classes.

**Author review**:  
- Validated correctness.
- Edited tailwind styles.  
- Modified classes.
- Added fullScreen alternative.

---

### question.ts
**Tool**: Microsoft Copilot

**Scope**: Generated schema for matching criterias based on requirements.

**Author review**: Validated correctness.

---

### AuthContext.tsx
**Tool**: Microsoft Copilot

**Scope**: Debugged useCallback function.

**Author review**: Validated correctness.

---

## API Gateway

### READEME.md
**Tool**: Microsoft Copilot

**Scope**:
- Generated service description.
- Generated list of installation steps.
- Generated basic Markdown design.

**Author review**:
- Validated correctness of service description and installation steps.
- Edited for style.

---

### auth.ts
**Tool**: Microsoft Copilot

**Scope**: Debugged proxy logic.

**Author review**: Validated correctness.

---

## User Service

### READEME.md
**Tool**: Microsoft Copilot

**Scope**:
- Generated service description.
- Generated list of installation steps.
- Generated basic Markdown design.

**Author review**:
- Validated correctness of service description and installation steps.
- Edited for style.

---

### validate.ts
**Tool**: Microsoft Copilot

**Scope**: Debugged schema logic.

**Author review**: Validated correctness.

---

### auth.ts
**Tool**: Microsoft Copilot

**Scope**:
- Generated initial authentication code implementation.
- Debugged authentication logic.

**Author review**:  
- Validated correctness.
- Added routes.
- Modified refresh token logic.
- Added unique user guard.

---

### user.ts
**Tool**: Microsoft Copilot

**Scope**: Debugged user account logic.

**Author review**: Validated correctness.

---

### google.ts
**Tool**: Microsoft Copilot

**Scope**: Debugged passport logic.

**Author review**: Validated correctness.

---

### refreshToken.ts
**Tool**: Microsoft Copilot

**Scope**: Debugged prisma calls.

**Author review**: Validated correctness.

---

## Matching Service

### READEME.md
**Tool**: Microsoft Copilot

**Scope**:
- Generated service description.
- Generated list of installation steps.
- Generated basic Markdown design.

**Author review**:
- Validated correctness of service description and installation steps.
- Edited for style.

---

### redis.ts
**Tool**: Microsoft Copilot

**Scope**:
- Generated initial Redis configuration.
- Debugged queueing logic.

**Author review**:  
- Validated correctness.
- Modified for our User schema.
- Modified per our matching criterias.
- Modified for compatibility with WebSocket.

---

### websocket.ts
**Tool**: Microsoft Copilot

**Scope**: Generated initial WebSocket configuration.

**Author review**:  
- Validated correctness.
- Implemented notifyMatch function.
- Resolved connection issues.

---

### match.ts
**Tool**: Microsoft Copilot

**Scope**: Generated initial start route implementation.

**Author review**: Validated correctness.

---

## Question Service

### READEME.md
**Tool**: Microsoft Copilot

**Scope**:
- Generated service description.
- Generated list of installation steps.
- Generated basic Markdown design.

**Author review**:
- Validated correctness of service description and installation steps.
- Edited for style.

---

### question.route.ts
**Tool**: ChatGPT

**Scope**:
- Generated boilerplate code for routes.
- Debugged prisma logic.

**Author review**:  
- Validated correctness.
- Modified random question route logic.

---

### index.ts
**Tool**: ChatGPT

**Scope**: Debugged seeding function.

**Author review**: Validated correctness.

---

## Collaboration Service

### READEME.md
**Tool**: Microsoft Copilot

**Scope**:
- Generated service description.
- Generated list of installation steps.
- Generated basic Markdown design.

**Author review**:
- Validated correctness of service description and installation steps.
- Edited for style.

---

### roomSetup.ts
**Tool**: ChatGPT

**Scope**:
- Generated boilerplate code for routes.
- Generated use of mutex for dealing with race conditions.
- Assisted in implementing Yjs logic.
- Debugged prisma logic.

**Author review**:  
- Validated correctness.
- Modified text for all console logs and error messages.

---

### socketServer.ts
**Tool**: ChatGPT

**Scope**: Assisted in interval implementation in requestSessionClosure function.

**Author review**: Validated correctness.

---

## AI Service

### READEME.md
**Tool**: Microsoft Copilot

**Scope**:
- Generated service description.
- Generated list of installation steps.
- Generated basic Markdown design.

**Author review**:
- Validated correctness of service description and installation steps.
- Edited for style.

---

### aiRoute.ts
**Tool**: ChatGPT

**Scope**:
- Discovered potential AI services that can be used.
- Generated AI prompts.

**Author review**:
- Decided on AI service to use from the discovered ones generated.
- Validated correctness and suitability of prompts.
