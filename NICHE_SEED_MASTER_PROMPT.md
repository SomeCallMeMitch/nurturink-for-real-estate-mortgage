# NurturInk Niche-Based Seed Data Generation
## Master Prompt Template for LLM Generation

**Version:** 1.0  
**Purpose:** Generate niche-specific card designs, messages,  automations for NurturInk  
**Format:** Multi-phase YAML-based prompt  
**Target Niches:** 11 industries with customizable phases

---

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Phase Breakdown](#phase-breakdown)
3. [Master Prompt Template](#master-prompt-template)
4. [Phase 1: Card Design Categories](#phase-1-card-design-categories)
5. [Phase 2: Card Design Ideas](#phase-2-card-design-ideas)
6. [Phase 3: Message Categories](#phase-3-message-categories)
7. [Phase 4: Message Copy](#phase-4-message-copy)
8. [Phase 5: Automations](#phase-5-automations)
9. [Implementation Guide](#implementation-guide)
10. [Example Output](#example-output)

---

## 🚀 Quick Start

### How to Use This Prompt

**Step 1:** Choose a niche from the list below  
**Step 2:** Copy the appropriate phase prompt  
**Step 3:** Replace `[NICHE]` with your chosen niche  
**Step 4:** If Phase 2+, paste previous phase output where indicated  
**Step 5:** Run the prompt in your LLM  
**Step 6:** Review output and proceed to next phase  

### Supported Niches
1. Roofing
2. Dental
3. Real Estate
4. Home Services (HVAC, Plumbing, Electrical)
5. Financial Services (Insurance, Accounting, Wealth Management)
6. Medical (General Practice, Veterinary)
7. Professional Services (Law, Consulting, Architecture)
8. Automotive (Dealerships, Auto Repair)
9. Hospitality (Hotels, Restaurants)
10. Fitness/Wellness (Gyms, Spas, Personal Training)
11. Education (Tutoring, Coaching)

---

## 📊 Phase Breakdown

| Phase | Input | Output | Purpose |
|-------|-------|--------|---------|
| **1** | Niche name | Card categories | Identify what types of cards this niche needs |
| **2** | Phase 1 output | Design concepts | Create 5+ visual design ideas per category |
| **3** | Niche name | Message categories | Define what message types fit this niche |
| **4** | Phase 3 output | Message copy | Write actual message text (<100 words) |
| **5** | Phase 4 output | Automation specs | Define triggers and timing |

---

## 🎯 Master Prompt Template

Use this template for all phases. Replace `[NICHE]` with your chosen niche and follow phase-specific instructions below.

```yaml
SYSTEM_CONTEXT: |
  You are an expert in [NICHE] industry business relationships and customer retention.
  You understand how [NICHE] professionals build lasting client relationships through
  personalized handwritten notecards.
  
  NurturInk is a platform that helps [NICHE] professionals send personalized handwritten
  notecards at key moments to strengthen client relationships and drive referrals.

NICHE: "[NICHE]"

TONE_GUIDELINES: |
  Messages should sound like quick notes a busy professional just jotted down:
  - Casual but professional (not stiff, not too informal)
  - Personal and genuine (not templated or ad-like)
  - Short and punchy (under 100 words, ideally under 80)
  - Conversational (how you'd speak to a valued client)
  - Authentic (reflects real business relationships in [NICHE])
  
  WRONG TONE: "We appreciate your business and look forward to serving you again."
  RIGHT TONE: "Hey! Just wanted to say thanks for trusting us with [project]. Really appreciated working with you!"

CARD_DESIGN_PHILOSOPHY: |
  NurturInk uses a signature design approach:
  - Front: Professional photo of the rep (builds personal connection)
  - Inside: Handwritten-style message (feels personal and genuine)
  - Design: Clean, modern, industry-appropriate
  - Color: Professional palette reflecting [NICHE] industry
  
  Most cards use the rep's photo on front + handwritten message inside.
  Industry-specific designs are rare - focus on universal designs that work across categories.

OUTPUT_FORMAT: |
  Provide output in the exact format specified for each phase.
  Be specific and detailed.
  Use proper JSON formatting for structured data.
  Ensure all text is actionable and ready to implement.
```

---

## Phase 1: Card Design Categories

**Input:** Niche name  
**Output:** Card categories specific to this niche  
**Time:** ~2 minutes

### Phase 1 Prompt

```yaml
PHASE: 1
TASK: "Identify card design categories for [NICHE]"

INSTRUCTIONS: |
  For the [NICHE] industry, identify the key moments when professionals send notecards
  to clients to strengthen relationships and drive referrals.
  
  Include:
  1. Universal categories (Birthday, Thank You, Win-back/Ghosted)
  2. Two industry-specific categories unique to [NICHE]
  
  For each category, provide:
  - Name (clear, actionable)
  - Description (when/why this card is sent)
  - Typical timing (when in the relationship this happens)
  - Business impact (how this strengthens the relationship)

EXPECTED_OUTPUT: |
  JSON array with 5 categories:
  [
    {
      "id": "birthday",
      "name": "Birthday",
      "description": "...",
      "timing": "...",
      "business_impact": "..."
    },
    ...
  ]

REQUEST: |
  Generate 5 card design categories for [NICHE] professionals.
  Include the 3 universal categories + 2 industry-specific ones.
  Format as JSON array.
```

---

## Phase 2: Card Design Ideas

**Input:** Phase 1 output (categories)  
**Output:** 5+ design concepts per category  
**Time:** ~5-10 minutes

### Phase 2 Prompt

```yaml
PHASE: 2
TASK: "Create card design concepts for [NICHE]"

PREVIOUS_OUTPUT: |
  [PASTE PHASE 1 OUTPUT HERE]

INSTRUCTIONS: |
  For each card design category, create 5 distinct visual design concepts.
  
  Each concept should include:
  - Design name (memorable, descriptive)
  - Visual style (modern, classic, minimalist, bold, etc.)
  - Color palette (2-3 primary colors + neutrals)
  - Front design description (what's on the front - typically rep photo)
  - Inside design description (layout, typography, visual elements)
  - Imagery style (photography, illustration, abstract, etc.)
  - Typography approach (font pairings, hierarchy)
  - Tone/feeling (professional, warm, creative, etc.)
  - Why it works for [NICHE] (specific to industry)
  
  Remember: Most cards feature the rep's photo on front.
  Focus on universal designs that work across multiple message categories.

EXPECTED_OUTPUT: |
  JSON object with design concepts:
  {
    "category_id": "birthday",
    "category_name": "Birthday",
    "design_concepts": [
      {
        "id": "birthday_minimal",
        "name": "Minimal Modern",
        "visual_style": "...",
        "color_palette": [...],
        "front_design": "...",
        "inside_design": "...",
        "imagery_style": "...",
        "typography": "...",
        "tone": "...",
        "why_it_works": "..."
      },
      ...
    ]
  }

REQUEST: |
  For each category from Phase 1, create 5 distinct card design concepts.
  Format as JSON with nested structure shown above.
  Be specific about colors, layouts, and visual elements.
```

---

## Phase 3: Message Categories

**Input:** Niche name  
**Output:** Message categories for this niche  
**Time:** ~2 minutes

### Phase 3 Prompt

```yaml
PHASE: 3
TASK: "Identify message categories for [NICHE]"

INSTRUCTIONS: |
  For the [NICHE] industry, identify the types of messages professionals send.
  
  Include:
  1. Universal categories (Birthday, Thank You, Win-back/Ghosted)
  2. Two industry-specific message types unique to [NICHE]
  
  For each category, provide:
  - Name (clear, actionable)
  - Description (what this message says)
  - Tone (how it should feel)
  - Use case (when/why this is sent)

EXPECTED_OUTPUT: |
  JSON array with 5 message categories:
  [
    {
      "id": "birthday",
      "name": "Birthday",
      "description": "...",
      "tone": "...",
      "use_case": "..."
    },
    ...
  ]

REQUEST: |
  Generate 5 message categories for [NICHE] professionals.
  Include the 3 universal categories + 2 industry-specific ones.
  Format as JSON array.
```

---

## Phase 4: Message Copy

**Input:** Phase 3 output (message categories)  
**Output:** Actual message text for each category  
**Time:** ~5-10 minutes

### Phase 4 Prompt

```yaml
PHASE: 4
TASK: "Write message copy for [NICHE]"

PREVIOUS_OUTPUT: |
  [PASTE PHASE 3 OUTPUT HERE]

TONE_REMINDER: |
  Messages should sound like quick notes a busy [NICHE] professional just jotted down:
  - Casual but professional (not stiff, not too informal)
  - Personal and genuine (not templated or ad-like)
  - Short and punchy (under 100 words, ideally under 80)
  - Conversational (how you'd speak to a valued client)
  - Authentic (reflects real [NICHE] business relationships)
  
  EXAMPLES OF RIGHT TONE:
  - "Hey! Just wanted to say thanks for trusting us with your roof. Really appreciated working with you!"
  - "Happy birthday! Hope you have an amazing day 🎂"
  - "Been thinking about you - it's been a minute! Would love to catch up soon."

INSTRUCTIONS: |
  For each message category, write 3 different message variations.
  
  Each message should:
  - Be under 100 words (ideally 70-90 words)
  - Use the tone guidelines above
  - Be specific to [NICHE] industry
  - Feel like a personal note, not a template
  - Include optional personalization placeholders: {{client_name}}, {{company_name}}, {{project/service}}
  - Be ready to handwrite on a notecard
  
  Variations should have slightly different angles/approaches while maintaining tone.

EXPECTED_OUTPUT: |
  JSON object with message variations:
  {
    "category_id": "birthday",
    "category_name": "Birthday",
    "variations": [
      {
        "id": "birthday_v1",
        "text": "...",
        "word_count": 75,
        "personalization_placeholders": ["{{client_name}}"],
        "tone_notes": "..."
      },
      ...
    ]
  }

REQUEST: |
  For each message category from Phase 3, write 3 message variations.
  Format as JSON with nested structure shown above.
  Keep messages under 100 words, ideally 70-90.
  Use the tone guidelines provided.
```

---

## Phase 5: Automations

**Input:** Phase 4 output (message categories)  
**Output:** Automation specifications  
**Time:** ~3-5 minutes

### Phase 5 Prompt

```yaml
PHASE: 5
TASK: "Define automations for [NICHE]"

PREVIOUS_OUTPUT: |
  [PASTE PHASE 4 OUTPUT HERE]

INSTRUCTIONS: |
  For each message category, define how it should be automated.
  
  Each automation should include:
  - Trigger type (birthday, anniversary, days_since_last_contact, etc.)
  - Timing (when to send relative to trigger)
  - Frequency cap (how often per year max)
  - Suggested message category (which messages to use)
  - Suggested card design category (which designs to use)
  - Industry-specific notes (why this automation matters for [NICHE])
  
  Trigger types available:
  - birthday (send on/before birthday)
  - anniversary (send on/before anniversary of service)
  - days_since_last_contact (send after X days of no contact)
  - renewal_reminder (send before renewal/contract end)
  - new_client_welcome (send after first purchase)
  - referral_request (send to ask for referrals)
  - custom (user-defined date field)

EXPECTED_OUTPUT: |
  JSON array with automation specs:
  [
    {
      "id": "automation_birthday",
      "name": "Birthday Card",
      "trigger_type": "birthday",
      "timing": "5 days before",
      "frequency_cap": "1 per year",
      "suggested_message_category": "birthday",
      "suggested_card_design_category": "birthday",
      "industry_notes": "..."
    },
    ...
  ]

REQUEST: |
  For each message category from Phase 4, define an automation specification.
  Format as JSON array shown above.
  Include industry-specific notes explaining why each automation matters for [NICHE].
```

---

## 📋 Implementation Guide

### Step-by-Step Workflow

**For Each Niche:**

1. **Phase 1 (5 min)**
   - Copy Phase 1 prompt
   - Replace `[NICHE]` with niche name
   - Run in LLM
   - Save output as `{NICHE}_phase1_categories.json`

2. **Phase 2 (10 min)**
   - Copy Phase 2 prompt
   - Replace `[NICHE]` with niche name
   - Paste Phase 1 output where indicated
   - Run in LLM
   - Save output as `{NICHE}_phase2_designs.json`

3. **Phase 3 (5 min)**
   - Copy Phase 3 prompt
   - Replace `[NICHE]` with niche name
   - Run in LLM
   - Save output as `{NICHE}_phase3_messages.json`

4. **Phase 4 (10 min)**
   - Copy Phase 4 prompt
   - Replace `[NICHE]` with niche name
   - Paste Phase 3 output where indicated
   - Run in LLM
   - **REVIEW:** Check tone and word counts
   - Save output as `{NICHE}_phase4_copy.json`

5. **Phase 5 (5 min)**
   - Copy Phase 5 prompt
   - Replace `[NICHE]` with niche name
   - Paste Phase 4 output where indicated
   - Run in LLM
   - Save output as `{NICHE}_phase5_automations.json`

### Quality Checkpoints

**After Phase 2 (Designs):**
- [ ] 5 distinct design concepts per category
- [ ] All include rep photo on front
- [ ] Colors are professional for [NICHE]
- [ ] Descriptions are specific and actionable

**After Phase 4 (Copy):**
- [ ] All messages under 100 words
- [ ] Tone is casual-professional (not ad-like)
- [ ] 3 variations per category
- [ ] Personalization placeholders included
- [ ] Ready to handwrite on notecard

**After Phase 5 (Automations):**
- [ ] Trigger types are valid
- [ ] Timing is realistic for [NICHE]
- [ ] Frequency caps make sense
- [ ] Industry notes explain business value

---

## 📤 Example Output

### Example: Roofing Industry, Phase 4 (Message Copy)

```json
{
  "category_id": "thank_you",
  "category_name": "Thank You",
  "variations": [
    {
      "id": "thank_you_v1",
      "text": "Hey {{client_name}}! Just wanted to say thanks for letting us handle your roof. We really appreciate your business and look forward to working with you again!",
      "word_count": 32,
      "personalization_placeholders": ["{{client_name}}"],
      "tone_notes": "Warm and genuine, emphasizes partnership"
    },
    {
      "id": "thank_you_v2",
      "text": "{{client_name}} - thanks so much for trusting us with your home. That means everything to us. If you ever need anything else, you know where to find us!",
      "word_count": 35,
      "personalization_placeholders": ["{{client_name}}"],
      "tone_notes": "Personal and accessible, opens door for future work"
    },
    {
      "id": "thank_you_v3",
      "text": "Really appreciated working with you on your roof project. Your team was great to work with, and we're proud of what we built together. Thanks for the opportunity!",
      "word_count": 32,
      "personalization_placeholders": [],
      "tone_notes": "Professional but warm, emphasizes collaboration"
    }
  ]
}
```

---

## 🔄 Workflow Summary

```
Phase 1: Categories → Phase 2: Designs → Phase 3: Messages → Phase 4: Copy → Phase 5: Automations
   (5 min)              (10 min)            (5 min)          (10 min)        (5 min)
   
Total per niche: ~35-40 minutes
Total for 11 niches: ~6-7 hours
```

---

## 💾 Output Organization

After completing all phases for all niches, organize outputs:

```
niche_seeds/
├── roofing/
│   ├── phase1_categories.json
│   ├── phase2_designs.json
│   ├── phase3_messages.json
│   ├── phase4_copy.json
│   └── phase5_automations.json
├── dental/
│   ├── phase1_categories.json
│   ├── phase2_designs.json
│   ├── phase3_messages.json
│   ├── phase4_copy.json
│   └── phase5_automations.json
└── [9 more niches...]
```

---

## 🚀 Next Steps

1. **Run Phase 1-5 for first niche** (Roofing recommended as test)
2. **Review outputs** for quality and tone
3. **Adjust prompt if needed** based on results
4. **Run for remaining 10 niches**
5. **Consolidate all outputs** into seed data format
6. **Create seed functions** to load this data into database

---

## 📝 Notes

- **Consistency:** Run all phases for one niche before moving to next
- **Review:** Check Phase 4 output carefully - tone is critical
- **Flexibility:** If output isn't right, adjust prompt and re-run
- **Reusability:** Once you have good outputs, they're ready to seed into database
- **Future:** These can be edited in SuperAdmin Niche Management page

---

**Ready to generate niche-specific seed data!**

